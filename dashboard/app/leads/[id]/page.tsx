import Link from "next/link";
import { getLeadById } from "@/lib/api";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  let lead = null;
  try {
    lead = await getLeadById(params.id);
  } catch (e) {
    lead = null;
  }

  if (!lead) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-8">
        <Link href="/leads" className="text-gray-400 text-sm hover:underline">
          ← Back to Leads
        </Link>
        <p className="mt-8 text-red-400">Lead not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/leads" className="text-gray-400 text-sm hover:underline">
          ← Back to Leads
        </Link>
      </div>

      {/* Lead Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{lead.lead_name}</h1>
          <p className="text-gray-400 mt-1">{lead.email} · {lead.source}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
          lead.lead_tier === "HIGH" ? "bg-green-900 text-green-400" :
          lead.lead_tier === "MEDIUM" ? "bg-yellow-900 text-yellow-400" :
          "bg-red-900 text-red-400"
        }`}>
          {lead.lead_tier} · {lead.qualification_score}
        </span>
      </div>

      {/* Lead Message */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Lead Message</h2>
        <p className="text-gray-200 leading-relaxed">{lead.raw_message}</p>
      </div>

      {/* AI Reasoning */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="text-sm text-gray-400 mb-3 uppercase tracking-wider">AI Reasoning</h2>
        <p className="text-gray-200 leading-relaxed">{lead.agent_reasoning}</p>
      </div>

      {/* Drafted Email */}
      <div className="bg-gray-900 rounded-xl border border-blue-900 p-6">
        <h2 className="text-sm text-blue-400 mb-3 uppercase tracking-wider">
          Drafted Response Email
        </h2>
        <pre className="text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
          {lead.drafted_response_email}
        </pre>
      </div>
    </main>
  );
}