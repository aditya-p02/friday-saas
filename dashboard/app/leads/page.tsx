"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/leads`)
      .then((r) => r.json())
      .then((data) => { setLeads(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? leads : leads.filter((l) => l.lead_tier === filter);

  if (loading) return (
    <main style={{ background: "var(--bg-primary)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--xbox-green-light)", fontSize: "1.2rem" }}>Loading...</div>
    </main>
  );

  return (
    <main style={{ background: "var(--bg-primary)", minHeight: "100vh", padding: "2rem" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem" }}>
        <div>
          <Link href="/" style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textDecoration: "none" }}>← Dashboard</Link>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--xbox-green-light)", marginTop: "0.5rem" }}>All Leads</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{leads.length} total leads captured</p>
        </div>

        {/* Filter buttons */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["ALL", "HIGH", "MEDIUM", "LOW"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "4px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                border: filter === f ? "none" : "1px solid var(--border)",
                background: filter === f ? "var(--xbox-green)" : "transparent",
                color: filter === f ? "#fff" : "var(--text-secondary)"
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Name", "Email", "Source", "Tier", "Score", "Status", "Date", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.85rem 1rem", color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "0.85rem 1rem", fontWeight: 500, fontSize: "0.9rem" }}>{lead.lead_name}</td>
                <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>{lead.email}</td>
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
                <td style={{ padding: "0.85rem 1rem" }}>
                  <Link href={`/leads/${lead.id}`} style={{ color: "var(--xbox-green-light)", fontSize: "0.8rem", textDecoration: "none", fontWeight: 500 }}>View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}