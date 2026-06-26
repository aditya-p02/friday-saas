"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LeadDetailPage() {
  const params = useParams();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionDone, setActionDone] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/leads/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setLead(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  async function approveLead() {
    await fetch(`${API_BASE}/api/v1/leads/${params.id}/approve`, { method: "POST" });
    setLead({ ...lead, status: "approved" });
    setActionDone(true);
  }

  async function rejectLead() {
    await fetch(`${API_BASE}/api/v1/leads/${params.id}/reject`, { method: "POST" });
    setLead({ ...lead, status: "rejected" });
    setActionDone(true);
  }

  if (loading) return (
    <main style={{ background: "var(--bg-primary)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--xbox-green-light)", fontSize: "1.2rem" }}>Loading...</div>
    </main>
  );

  if (!lead) return (
    <main style={{ background: "var(--bg-primary)", minHeight: "100vh", padding: "2rem" }}>
      <Link href="/leads" style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textDecoration: "none" }}>← Back</Link>
      <p style={{ color: "#ff6b6b", marginTop: "2rem" }}>Lead not found.</p>
    </main>
  );

  return (
    <main style={{ background: "var(--bg-primary)", minHeight: "100vh", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>

      {/* Back */}
      <Link href="/leads" style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textDecoration: "none" }}>← Back to Leads</Link>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", margin: "1.5rem 0 2rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>{lead.lead_name}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.3rem" }}>{lead.email} · {lead.source}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{
            padding: "0.4rem 1rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 700,
            background: lead.lead_tier === "HIGH" ? "var(--xbox-green)" : lead.lead_tier === "MEDIUM" ? "#2a2a2a" : "#1a1a1a",
            color: lead.lead_tier === "HIGH" ? "#fff" : lead.lead_tier === "MEDIUM" ? "#a0a0a0" : "#666"
          }}>{lead.lead_tier}</span>
          <span style={{ color: "var(--xbox-green-light)", fontWeight: 700, fontSize: "1.1rem" }}>{lead.qualification_score}</span>
        </div>
      </div>

      {/* Approval buttons — only show for pending */}
      {lead.status === "pending_approval" && !actionDone && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--xbox-green)", borderRadius: "6px", padding: "1.25rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "var(--xbox-green-light)", fontWeight: 600, fontSize: "0.9rem" }}>⚡ Awaiting your approval</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.2rem" }}>Approve to send the drafted email to this lead</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={approveLead}
              style={{ background: "var(--xbox-green)", color: "#fff", border: "none", padding: "0.6rem 1.5rem", borderRadius: "4px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
            >
              ✓ Approve & Send
            </button>
            <button
              onClick={rejectLead}
              style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", padding: "0.6rem 1.5rem", borderRadius: "4px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
            >
              ✕ Reject
            </button>
          </div>
        </div>
      )}

      {/* Status badge for approved/rejected */}
      {(lead.status === "approved" || lead.status === "rejected") && (
        <div style={{ background: "var(--bg-card)", border: `1px solid ${lead.status === "approved" ? "var(--xbox-green)" : "#333"}`, borderRadius: "6px", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ color: lead.status === "approved" ? "var(--xbox-green-light)" : "#ff6b6b", fontWeight: 600, fontSize: "0.9rem" }}>
            {lead.status === "approved" ? "✓ Email sent to this lead" : "✕ Lead rejected"}
          </p>
        </div>
      )}

      {/* Lead Message */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", padding: "1.5rem", marginBottom: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.75rem" }}>Lead Message</p>
        <p style={{ color: "#e0e0e0", lineHeight: 1.7, fontSize: "0.9rem" }}>{lead.raw_message}</p>
      </div>

      {/* AI Reasoning */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", padding: "1.5rem", marginBottom: "1rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.75rem" }}>AI Reasoning</p>
        <p style={{ color: "#e0e0e0", lineHeight: 1.7, fontSize: "0.9rem" }}>{lead.agent_reasoning}</p>
      </div>

      {/* Drafted Email */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--xbox-green)", borderRadius: "6px", padding: "1.5rem" }}>
        <p style={{ color: "var(--xbox-green-light)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.75rem" }}>Drafted Response Email</p>
        <pre style={{ color: "#e0e0e0", lineHeight: 1.7, fontSize: "0.88rem", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{lead.drafted_response_email}</pre>
      </div>

    </main>
  );
}