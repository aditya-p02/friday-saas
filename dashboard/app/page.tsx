"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [leads, setLeads] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [leadsRes, pendingRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/leads`),
        fetch(`${API_BASE}/api/v1/leads/pending/approval`)
      ]);
      const leadsData = await leadsRes.json();
      const pendingData = await pendingRes.json();
      setLeads(leadsData);
      setPending(pendingData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function approveLead(id: string) {
    await fetch(`${API_BASE}/api/v1/leads/${id}/approve`, { method: "POST" });
    fetchData();
  }

  async function rejectLead(id: string) {
    await fetch(`${API_BASE}/api/v1/leads/${id}/reject`, { method: "POST" });
    fetchData();
  }

  const high = leads.filter((l) => l.lead_tier === "HIGH").length;
  const medium = leads.filter((l) => l.lead_tier === "MEDIUM").length;
  const low = leads.filter((l) => l.lead_tier === "LOW").length;

  if (loading) return (
    <main style={{ background: "var(--bg-primary)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--xbox-green-light)", fontSize: "1.2rem" }}>Loading FRIDAY...</div>
    </main>
  );

  return (
    <main style={{ background: "var(--bg-primary)", minHeight: "100vh", padding: "2rem" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--xbox-green-light)", letterSpacing: "-0.5px" }}>FRIDAY</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.2rem" }}>AI Sales Operations Platform</p>
        </div>
        <Link href="/leads" style={{ background: "var(--xbox-green)", color: "#fff", padding: "0.5rem 1.2rem", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
          View All Leads →
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
        {[
          { label: "Total Leads", value: leads.length, color: "var(--xbox-green-light)" },
          { label: "HIGH Tier", value: high, color: "#52B043" },
          { label: "MEDIUM Tier", value: medium, color: "#a0a0a0" },
          { label: "LOW Tier", value: low, color: "#666" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderTop: `2px solid ${stat.color}`, borderRadius: "6px", padding: "1.5rem" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>{stat.label}</p>
            <p style={{ fontSize: "2.5rem", fontWeight: 700, color: stat.color, marginTop: "0.5rem" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Pending Approval */}
      {pending.length > 0 && (
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--xbox-green-light)", boxShadow: "0 0 8px var(--xbox-green-light)", animation: "pulse 2s infinite" }} />
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--xbox-green-light)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Pending Approval ({pending.length})
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {pending.map((lead) => (
              <div key={lead.id} style={{ background: "var(--bg-card)", border: "1px solid var(--xbox-green)", borderRadius: "6px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "1rem" }}>{lead.lead_name}</span>
                    <span style={{ background: "var(--xbox-green)", color: "#fff", padding: "0.15rem 0.6rem", borderRadius: "3px", fontSize: "0.7rem", fontWeight: 700 }}>HIGH</span>
                    <span style={{ color: "var(--xbox-green-light)", fontSize: "0.85rem", fontWeight: 600 }}>{lead.qualification_score}</span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>{lead.email} · {lead.source}</p>
                  <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "4px", padding: "0.75rem", maxHeight: "80px", overflow: "hidden" }}>
                    <p style={{ color: "#ccc", fontSize: "0.78rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{lead.drafted_response_email?.substring(0, 200)}...</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginLeft: "1.5rem", minWidth: "120px" }}>
                  <button
                    onClick={() => approveLead(lead.id)}
                    style={{ background: "var(--xbox-green)", color: "#fff", border: "none", padding: "0.6rem 1rem", borderRadius: "4px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => rejectLead(lead.id)}
                    style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", padding: "0.6rem 1rem", borderRadius: "4px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                  >
                    ✕ Reject
                  </button>
                  <Link href={`/leads/${lead.id}`} style={{ color: "var(--xbox-green-light)", fontSize: "0.78rem", textAlign: "center", textDecoration: "none", marginTop: "0.25rem" }}>
                    View full →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Leads */}
      <div>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem" }}>Recent Leads</h2>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Name", "Source", "Tier", "Score", "Status", "Date"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0.85rem 1rem", color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 8).map((lead) => (
                <tr key={lead.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <Link href={`/leads/${lead.id}`} style={{ color: "var(--xbox-green-light)", fontWeight: 500, textDecoration: "none", fontSize: "0.9rem" }}>{lead.lead_name}</Link>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{lead.source}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span style={{
                      padding: "0.2rem 0.6rem", borderRadius: "3px", fontSize: "0.72rem", fontWeight: 700,
                      background: lead.lead_tier === "HIGH" ? "var(--xbox-green)" : lead.lead_tier === "MEDIUM" ? "#2a2a2a" : "#1a1a1a",
                      color: lead.lead_tier === "HIGH" ? "#fff" : lead.lead_tier === "MEDIUM" ? "#a0a0a0" : "#666"
                    }}>{lead.lead_tier}</span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "var(--xbox-green-light)", fontSize: "0.85rem", fontWeight: 600 }}>{lead.qualification_score}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span style={{
                      padding: "0.2rem 0.6rem", borderRadius: "3px", fontSize: "0.72rem", fontWeight: 600,
                      background: lead.status === "approved" ? "rgba(16,124,16,0.2)" : lead.status === "pending_approval" ? "rgba(82,176,67,0.15)" : lead.status === "rejected" ? "rgba(255,50,50,0.1)" : "transparent",
                      color: lead.status === "approved" ? "var(--xbox-green-light)" : lead.status === "pending_approval" ? "#52B043" : lead.status === "rejected" ? "#ff6b6b" : "var(--text-secondary)"
                    }}>{lead.status === "none" ? "—" : lead.status.replace("_", " ")}</span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>{new Date(lead.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}