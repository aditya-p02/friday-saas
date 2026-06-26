import os
from fastapi import FastAPI, HTTPException, status, Depends
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from openai import OpenAI
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sentence_transformers import SentenceTransformer
from database import init_db, get_db, LeadRecord, find_similar_leads
from fastapi import BackgroundTasks
from email_service import send_drafted_email

load_dotenv()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="FRIDAY Sales Operations Platform",
    description="Phase 4: Lead Qualification + Vector Memory + Approval System",
    version="4.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load embedding model once at startup ---
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY")
)

# --- Startup ---
@app.on_event("startup")
async def startup():
    await init_db()

# --- Input Schema ---
class LeadInput(BaseModel):
    name: str = Field(..., examples=["Aditi Sharma"])
    email: EmailStr = Field(..., examples=["aditi@example.com"])
    phone: Optional[str] = Field(None, examples=["+919876543210"])
    source: str = Field(..., examples=["Facebook Ads"])
    raw_message: str = Field(..., examples=["Looking for a 2BHK in Pune. Budget 80 Lakhs."])

# --- Output Schema ---
class LeadAnalysisResponse(BaseModel):
    lead_name: str
    qualification_score: float
    lead_tier: str
    agent_reasoning: str
    drafted_response_email: str

# --- Similar Lead Schema ---
class SimilarLeadResult(BaseModel):
    lead_name: str
    email: str
    source: str
    raw_message: str
    lead_tier: str
    qualification_score: float
    agent_reasoning: str
    similarity: float

# --- Route 1: Analyze and save a lead ---
@app.post("/api/v1/analyze-lead", response_model=LeadAnalysisResponse)
async def analyze_incoming_lead(
    lead: LeadInput,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    try:
        system_prompt = (
            "You are FRIDAY, the Lead Analysis engine for a B2B SaaS platform. "
            "Analyze the prospect inquiry for intent, budget, and clarity. "
            "Output EXCLUSIVELY a JSON object matching this exact structure: "
            "{\n"
            "  \"lead_name\": \"string\",\n"
            "  \"qualification_score\": 0.85,\n"
            "  \"lead_tier\": \"HIGH\" | \"MEDIUM\" | \"LOW\",\n"
            "  \"agent_reasoning\": \"string description\",\n"
            "  \"drafted_response_email\": \"A customized, professional outreach email.\"\n"
            "}"
        )

        user_content = (
            f"Lead Name: {lead.name}\n"
            f"Source: {lead.source}\n"
            f"Inquiry: {lead.raw_message}"
        )

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )

        raw_json_output = completion.choices[0].message.content
        result = LeadAnalysisResponse.model_validate_json(raw_json_output)

        # --- Generate embedding ---
        embedding_vector = embedding_model.encode(lead.raw_message).tolist()

        # --- Set status based on tier ---
        lead_status = "pending_approval" if result.lead_tier == "HIGH" else "none"

        # --- Save lead to PostgreSQL ---
        lead_record = LeadRecord(
            lead_name=result.lead_name,
            email=lead.email,
            source=lead.source,
            raw_message=lead.raw_message,
            qualification_score=result.qualification_score,
            lead_tier=result.lead_tier,
            agent_reasoning=result.agent_reasoning,
            drafted_response_email=result.drafted_response_email,
            embedding=embedding_vector,
            status=lead_status
        )
        db.add(lead_record)
        await db.commit()

        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"FRIDAY Core Engine Error: {str(e)}"
        )

# --- Route 2: Find similar past leads ---
@app.post("/api/v1/similar-leads", response_model=List[SimilarLeadResult])
async def get_similar_leads(lead: LeadInput, db: AsyncSession = Depends(get_db)):
    try:
        embedding_vector = embedding_model.encode(lead.raw_message).tolist()
        results = await find_similar_leads(embedding=embedding_vector, limit=3, db=db)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"FRIDAY Similarity Search Error: {str(e)}"
        )

# --- Route 3: Get all leads ---
@app.get("/api/v1/leads")
async def get_all_leads(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            text("SELECT id, lead_name, email, source, lead_tier, qualification_score, status, created_at FROM leads ORDER BY created_at DESC")
        )
        rows = result.fetchall()
        return [
            {
                "id": str(row.id),
                "lead_name": row.lead_name,
                "email": row.email,
                "source": row.source,
                "lead_tier": row.lead_tier,
                "qualification_score": row.qualification_score,
                "status": row.status,
                "created_at": str(row.created_at)
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch leads: {str(e)}"
        )

# --- Route 4: Get single lead by ID ---
@app.get("/api/v1/leads/{lead_id}")
async def get_lead_by_id(lead_id: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            text("SELECT * FROM leads WHERE id = :id"),
            {"id": lead_id}
        )
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Lead not found")
        return {
            "id": str(row.id),
            "lead_name": row.lead_name,
            "email": row.email,
            "source": row.source,
            "raw_message": row.raw_message,
            "lead_tier": row.lead_tier,
            "qualification_score": row.qualification_score,
            "agent_reasoning": row.agent_reasoning,
            "drafted_response_email": row.drafted_response_email,
            "status": row.status,
            "created_at": str(row.created_at)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch lead: {str(e)}"
        )

# --- Route 5: Get all pending approval leads ---
@app.get("/api/v1/leads/pending/approval")
async def get_pending_leads(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            text("SELECT id, lead_name, email, source, lead_tier, qualification_score, drafted_response_email, created_at FROM leads WHERE status = 'pending_approval' ORDER BY created_at DESC")
        )
        rows = result.fetchall()
        return [
            {
                "id": str(row.id),
                "lead_name": row.lead_name,
                "email": row.email,
                "source": row.source,
                "lead_tier": row.lead_tier,
                "qualification_score": row.qualification_score,
                "drafted_response_email": row.drafted_response_email,
                "created_at": str(row.created_at)
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch pending leads: {str(e)}"
        )

# --- Route 6: Approve a lead and send email ---
@app.post("/api/v1/leads/{lead_id}/approve")
async def approve_lead(
    lead_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(
            text("SELECT * FROM leads WHERE id = :id"),
            {"id": lead_id}
        )
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Lead not found")

        # Send the email in background
        background_tasks.add_task(
            send_drafted_email,
            to_email=row.email,
            subject=f"Regarding your inquiry via {row.source}",
            body=row.drafted_response_email
        )

        # Update status to approved
        await db.execute(
            text("UPDATE leads SET status = 'approved' WHERE id = :id"),
            {"id": lead_id}
        )
        await db.commit()

        return {"message": f"Lead approved. Email sending to {row.email}"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve lead: {str(e)}"
        )

# --- Route 7: Reject a lead ---
@app.post("/api/v1/leads/{lead_id}/reject")
async def reject_lead(lead_id: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            text("SELECT id FROM leads WHERE id = :id"),
            {"id": lead_id}
        )
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Lead not found")

        await db.execute(
            text("UPDATE leads SET status = 'rejected' WHERE id = :id"),
            {"id": lead_id}
        )
        await db.commit()

        return {"message": "Lead rejected successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject lead: {str(e)}"
        )