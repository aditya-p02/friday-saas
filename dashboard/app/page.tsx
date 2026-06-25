import Link from "next/link";
import { getAllLeads } from "@/lib/api";

export default async function Home() {
  let leads = [];
  try {
    leads = await getAllLeads();
  } catch (e) {
    leads = [];
  }

  const high = leads.filter((l: any) => l.lead_tier === "HIGH").length;
  const medium = leads.filter((l: any) => l.lead_tier === "MEDIUM").length;
  const low = leads.filter((l: any) => l.lead_tier === "LOW").length;

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-blue-400">FRIDAY</h1>
        <p className="text-gray-400 mt-1">AI Sales Operations Platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Total Leads</p>
          <p className="text-4xl font-bold mt-1">{leads.length}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 border border-green-900">
          <p className="text-green-400 text-sm">HIGH Tier</p>
          <p className="text-4xl font-bold mt-1 text-green-400">{high}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 border border-yellow-900">
          <p className="text-yellow-400 text-sm">MEDIUM Tier</p>
          <p className="text-4xl font-bold mt-1 text-yellow-400">{medium}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 border border-red-900">
          <p className="text-red-400 text-sm">LOW Tier</p>
          <p className="text-4xl font-bold mt-1 text-red-400">{low}</p>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Recent Leads</h2>
          <Link href="/leads" className="text-blue-400 text-sm hover:underline">
            View all →
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-800">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Source</th>
              <th className="text-left p-4">Tier</th>
              <th className="text-left p-4">Score</th>
              <th className="text-left p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.slice(0, 5).map((lead: any) => (
              <tr key={lead.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                <td className="p-4">
                  <Link href={`/leads/${lead.id}`} className="text-blue-400 hover:underline">
                    {lead.lead_name}
                  </Link>
                </td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}