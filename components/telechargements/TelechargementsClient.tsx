"use client";

import { useState } from "react";
import { FileText, FileSpreadsheet, FileCode, Map, Download, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LeadForm } from "@/components/LeadForm";

interface DocItem {
  id: string;
  titre: string;
  type: "fiche" | "guide" | "cctp" | "plan";
  fichierUrl: string;
  description: string | null;
}

interface TelechargementsClientProps {
  documents: DocItem[];
  /** Libellés de la colonne docs (titre, copy CTA…) éditables depuis l'admin. */
  labels: {
    documentsDisponibles?: string;
    accesDocuments?: string;
    accesDebloque?: string;
    cliquezTelecharger?: string;
    remplissezFormulaire?: string;
  };
}

const TYPE_ICONS: Record<string, typeof FileText> = {
  fiche: FileText,
  guide: FileSpreadsheet,
  cctp: FileCode,
  plan: Map,
};

export function TelechargementsClient({ documents, labels }: TelechargementsClientProps) {
  const [unlocked, setUnlocked] = useState(false);
  const t = useTranslations("telechargements");
  const docIds = documents.map((d) => d.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
      <div className="lg:col-span-3">
        <h2 className="text-xl font-bold text-neutral-dark mb-6">
          {labels.documentsDisponibles || t("documentsDisponibles")}
        </h2>

        {documents.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            Aucun document disponible pour le moment.
          </p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => {
              const Icon = TYPE_ICONS[doc.type] || FileText;
              return (
                <Card key={doc.id} variant="product">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="shrink-0 w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-dark">{doc.titre}</h3>
                      {doc.description && (
                        <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="info">{t(`types.${doc.type}`)}</Badge>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {unlocked ? (
                        <a
                          href={doc.fichierUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-primary hover:text-primary-600 transition-colors inline-block"
                          title="Télécharger"
                        >
                          <Download size={20} />
                        </a>
                      ) : (
                        <div className="p-2 text-gray-300"><Lock size={20} /></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-24">
          {unlocked ? (
            <div className="bg-success/10 border border-success/20 rounded-lg p-6 text-center">
              <Download size={32} className="text-success mx-auto mb-3" />
              <h3 className="font-bold text-success text-lg">
                {labels.accesDebloque || t("accesDebloque")}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {labels.cliquezTelecharger || t("cliquezTelecharger")}
              </p>
            </div>
          ) : (
            <div className="bg-neutral-light rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold text-neutral-dark text-lg mb-2">
                {labels.accesDocuments || t("accesDocuments")}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {labels.remplissezFormulaire || t("remplissezFormulaire")}
              </p>
              <LeadForm compact documentIds={docIds} onSuccess={() => setUnlocked(true)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
