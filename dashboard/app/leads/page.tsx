import Link from "next/link";
import { getAllLeads } from "@/lib/api";

export default async function LeadsPage() {
  let leads = [];
  try {
    leads = await getAllLeads();
  } catch (e) {
    leads = [];
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="mb-8">
        <Link href="/" className="text-gray-400 text-sm hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-4">All Leads</h1>
        <p className="text-gray-400 mt-1">{leads.length} total leads captured</p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-800">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Source</th>
              <th className="text-left p-4">Tier</th>
              <th className="text-left p-4">Score</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead: any) => (
              <tr key={lead.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                <td className="p-4 font-medium">{lead.lead_name}</td>
                <td className="p-4 text-gray-400 text-sm">{lead.email}</td>
                <td className="p-4 text-gray-300">{lead.source}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    lead.lead_tier === "HIGH" ? "bg-green-900 text-green-400" :
                    lead.lead_tier === "MEDIUM" ? "bg-yellow-900 text-yellow-400" :
                    "bg-red-900 text-red-400"
                  }`}>
                    {lead.lead_tier}
                  </span>
                </td>
                <td className="p-4 text-gray-300">{lead.qualification_score}</td>
                <td className="p-4 text-gray-400 text-sm">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="text-blue-400 text-sm hover:underline"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}