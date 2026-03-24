import Link from "next/link";
import { Plus, MapPin, Pencil, Ruler } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminRealisationsPage() {
  const realisations = await prisma.realisation.findMany({
    orderBy: { annee: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">Réalisations</h1>
          <p className="text-sm text-gray-500 mt-1">{realisations.length} réalisation(s)</p>
        </div>
        <Button href="/admin/realisations/new" size="sm">
          <Plus size={16} className="mr-2" />
          Ajouter
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {realisations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MapPin size={32} className="mx-auto mb-3 text-gray-300" />
            <p>Aucune réalisation pour le moment.</p>
            <Button href="/admin/realisations/new" variant="outline" size="sm" className="mt-4">
              Créer la première
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Titre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Ville</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Typologie</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">ml</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Stations</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Année</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {realisations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-neutral-dark">{r.titre}</td>
                    <td className="px-4 py-3 text-gray-600">{r.ville} ({r.departement})</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{r.typologieQuai}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600">{r.longueurMl}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{r.nbStations}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{r.annee}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/realisations/${r.id}`}
                          className="p-1.5 text-gray-400 hover:text-primary rounded transition-colors"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </Link>
                        <DeleteButton id={r.id} endpoint="/api/admin/realisations" />
                      </div>
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
