import { prisma } from "@/lib/prisma";
import { MapPin, FileText, Users, BarChart3 } from "lucide-react";

async function getStats() {
  const [realisations, documents, leads, stats] = await Promise.all([
    prisma.realisation.count(),
    prisma.document.count(),
    prisma.lead.count(),
    prisma.stat.count(),
  ]);
  return { realisations, documents, leads, stats };
}

async function getRecentLeads() {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      prenom: true,
      nom: true,
      societe: true,
      email: true,
      profil: true,
      createdAt: true,
    },
  });
}

const CARDS = [
  { key: "realisations" as const, label: "Réalisations", icon: MapPin, color: "bg-primary/10 text-primary" },
  { key: "documents" as const, label: "Documents", icon: FileText, color: "bg-accent/10 text-accent-700" },
  { key: "leads" as const, label: "Leads", icon: Users, color: "bg-emerald-50 text-emerald-700" },
  { key: "stats" as const, label: "Stats", icon: BarChart3, color: "bg-blue-50 text-blue-700" },
];

const PROFIL_SHORT: Record<string, string> = {
  moe: "MOE",
  moa: "MOA",
  tp: "TP",
  collectivite: "Coll.",
  autre: "Autre",
};

export default async function AdminDashboard() {
  const [counts, recentLeads] = await Promise.all([getStats(), getRecentLeads()]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-dark">Dashboard</h1>
      <p className="text-sm text-gray-500 mt-1">Vue d'ensemble du site URBAQUAI</p>

      {/* Compteurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {CARDS.map((card) => (
          <div key={card.key} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-neutral-dark mt-1">
                  {counts[card.key]}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Derniers leads */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-neutral-dark mb-4">Derniers leads</h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {recentLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Aucun lead pour le moment.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Société</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Profil</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-neutral-dark">
                      {lead.prenom} {lead.nom}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.societe}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
                        {PROFIL_SHORT[lead.profil] ?? lead.profil}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
