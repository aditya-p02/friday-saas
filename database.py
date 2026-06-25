import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, String, Float, Text, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from dotenv import load_dotenv
import uuid
import datetime

load_dotenv()

# --- 1. Build the connection URL from .env ---
DATABASE_URL = (
    f"postgresql+asyncpg://"
    f"{os.getenv('POSTGRES_USER')}:"
    f"{os.getenv('POSTGRES_PASSWORD')}@"
    f"postgres:5432/"
    f"{os.getenv('POSTGRES_DB')}"
)

# --- 2. Create the async engine ---
engine = create_async_engine(DATABASE_URL, echo=False)

# --- 3. Create a session factory ---
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# --- 4. Base class for all models ---
Base = declarative_base()

# --- 5. The leads table ---
class LeadRecord(Base):
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    source = Column(String, nullable=False)
    raw_message = Column(Text, nullable=False)
    qualification_score = Column(Float, nullable=False)
    lead_tier = Column(String, nullable=False)
    agent_reasoning = Column(Text, nullable=False)
    drafted_response_email = Column(Text, nullable=False)
    embedding = Column(Vector(384), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# --- 6. Initialize DB on startup ---
async def init_db():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)

# --- 7. Dependency for FastAPI routes ---
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# --- 8. Find similar leads using vector similarity ---
async def find_similar_leads(embedding: list, limit: int = 3, db: AsyncSession = None):
    query = text("""
        SELECT
            lead_name,
            email,
            source,
            raw_message,
            lead_tier,
            qualification_score,
            agent_reasoning,
            1 - (embedding <=> CAST(:embedding AS vector)) AS similarity
        FROM leads
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> CAST(:embedding AS vector)
        LIMIT :limit
    """)

    result = await db.execute(query, {
        "embedding": str(embedding),
        "limit": limit
    })

    rows = result.fetchall()
    return [
        {
            "lead_name": row.lead_name,
            "email": row.email,
            "source": row.source,
            "raw_message": row.raw_message,
            "lead_tier": row.lead_tier,
            "qualification_score": row.qualification_score,
            "agent_reasoning": row.agent_reasoning,
            "similarity": round(float(row.similarity), 4)
        }
        for row in rows
    ]