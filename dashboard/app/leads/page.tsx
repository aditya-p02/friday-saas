"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/leads`)
      .then((r) => r.json())
      .then((data) => { setLeads(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? leads : leads.filter((l) => l.lead_tier === filter);

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  function toggleSelectAll() {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((l) => l.id));
    }
  }

  async function deleteSelected() {
    if (!confirm(`Delete ${selected.length} selected leads?`)) return;
    await Promise.all(selected.map((id) =>
      fetch(`${API_BASE}/api/v1/leads/${id}`, { method: "DELETE" })
    ));
    setLeads(leads.filter((l) => !selected.includes(l.id)));
    setSelected([]);
  }

  async function deleteAll() {
    if (!confirm("Delete ALL leads? This cannot be undone.")) return;
    await fetch(`${API_BASE}/api/v1/leads`, { method: "DELETE" });
    setLeads([]);
    setSelected([]);
  }

  async function deleteSingle(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    await fetch(`${API_BASE}/api/v1/leads/${id}`, { method: "DELETE" });
    setLeads(leads.filter((l) => l.id !== id));
    setSelected(selected.filter((s) => s !== id));
  }

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

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {/* Filter buttons */}
          {["ALL", "HIGH", "MEDIUM", "LOW"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "0.4rem 1rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                border: filter === f ? "none" : "1px solid var(--border)",
                background: filter === f ? "var(--xbox-green)" : "transparent",
                color: filter === f ? "#fff" : "var(--text-secondary)"
              }}
            >{f}</button>
          ))}

          {/* Delete selected */}
          {selected.length > 0 && (
            <button
              onClick={deleteSelected}
              style={{ padding: "0.4rem 1rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", background: "rgba(255,50,50,0.15)", color: "#ff6b6b", border: "1px solid rgba(255,50,50,0.3)" }}
            >
              Delete {selected.length} selected
            </button>
          )}

          {/* Clear all */}
          <button
            onClick={deleteAll}
            style={{ padding: "0.4rem 1rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", background: "transparent", color: "#555", border: "1px solid #333" }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "0.85rem 1rem", width: "40px" }}>
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  style={{ cursor: "pointer", accentColor: "var(--xbox-green)" }}
                />
              </th>
              {["Name", "Email", "Source", "Tier", "Score", "Status", "Date", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.85rem 1rem", color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} style={{ borderBottom: "1px solid var(--border)", background: selected.includes(lead.id) ? "rgba(16,124,16,0.05)" : "transparent" }}>
                <td style={{ padding: "0.85rem 1rem" }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(lead.id)}
                    onChange={() => toggleSelect(lead.id)}
                    style={{ cursor: "pointer", accentColor: "var(--xbox-green)" }}
                  />
                </td>
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
                <td style={{ padding: "0.85rem 1rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <Link href={`/leads/${lead.id}`} style={{ color: "var(--xbox-green-light)", fontSize: "0.8rem", textDecoration: "none", fontWeight: 500 }}>View →</Link>
                  <button
                    onClick={() => deleteSingle(lead.id, lead.lead_name)}
                    style={{ background: "transparent", color: "#555", border: "none", fontSize: "0.8rem", cursor: "pointer", padding: "0" }}
                  >✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}