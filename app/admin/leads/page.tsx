import { prisma } from "@/lib/prisma";
import { Users, Download } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PROFIL_LABELS } from "@/lib/constants";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">{leads.length} contact(s)</p>
        </div>
        {leads.length > 0 && <ExportCsvButton leads={leads} />}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users size={32} className="mx-auto mb-3 text-gray-300" />
            <p>Aucun lead pour le moment.</p>
            <p className="text-xs text-gray-400 mt-1">
              Les leads apparaîtront ici lorsque des visiteurs rempliront un formulaire.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Société</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Profil</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Dept</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Message</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-neutral-dark whitespace-nowrap">
                      {lead.prenom} {lead.nom}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.societe}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info">
                        {PROFIL_LABELS[lead.profil] ?? lead.profil}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{lead.departement}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">
                      {lead.message || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
