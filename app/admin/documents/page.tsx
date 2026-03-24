import { prisma } from "@/lib/prisma";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { DOCUMENT_TYPE_LABELS } from "@/lib/constants";

export default async function AdminDocumentsPage() {
  const documents = await prisma.document.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">{documents.length} document(s)</p>
        </div>
        <Button href="/admin/documents/new" size="sm">
          <Plus size={16} className="mr-2" />
          Ajouter
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText size={32} className="mx-auto mb-3 text-gray-300" />
            <p>Aucun document pour le moment.</p>
            <Button href="/admin/documents/new" variant="outline" size="sm" className="mt-4">
              Ajouter le premier
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Titre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">URL</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-neutral-dark">{doc.titre}</td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono truncate max-w-[200px]">
                    {doc.fichierUrl}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton id={doc.id} endpoint="/api/admin/documents" label="ce document" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
