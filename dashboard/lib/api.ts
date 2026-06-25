const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getAllLeads() {
  const res = await fetch(`${API_BASE}/api/v1/leads`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function getLeadById(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/leads/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch lead");
  return res.json();
}