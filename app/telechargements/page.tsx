"use client";

import { useState } from "react";
import { FileText, FileSpreadsheet, FileCode, Download, Lock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LeadForm } from "@/components/LeadForm";
import { DOCUMENT_TYPE_LABELS } from "@/lib/constants";

const DOCUMENTS = [
  {
    id: "fiche-technique",
    titre: "Fiche technique URBAQUAI",
    type: "fiche" as const,
    description: "Dimensions, résistances, matériaux, coloris. Le document essentiel pour vos CCTP.",
    format: "PDF — 2.4 Mo",
  },
  {
    id: "guide-pose",
    titre: "Guide de pose et d'assemblage",
    type: "guide" as const,
    description: "Instructions détaillées de mise en œuvre, schémas d'assemblage, outillage requis.",
    format: "PDF — 5.1 Mo",
  },
  {
    id: "cctp-bpu",
    titre: "Extrait CCTP / BPU type",
    type: "cctp" as const,
    description: "Clauses techniques types intégrables directement dans vos marchés publics.",
    format: "DOCX — 380 Ko",
  },
  {
    id: "plans-dwg",
    titre: "Plans DWG / AutoCAD",
    type: "plan" as const,
    description: "Plans 2D des 4 configurations pour intégration dans vos projets CAO.",
    format: "DWG — 1.8 Mo",
  },
];

const TYPE_ICONS: Record<string, typeof FileText> = {
  fiche: FileText,
  guide: FileSpreadsheet,
  cctp: FileCode,
  plan: FileCode,
};

export default function TelechargmentsPage() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div>
      {/* Hero */}
      <section className="bg-neutral-light py-16 lg:py-24">
        <Container>
          <SectionHeader
            titre="Téléchargements"
            sousTitre="Accédez à toute la documentation technique URBAQUAI : fiches produit, guides de pose, CCTP types et plans CAO."
          />
        </Container>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Documents */}
            <div className="lg:col-span-3">
              <h2 className="text-xl font-bold text-neutral-dark mb-6">
                Documents disponibles
              </h2>
              <div className="space-y-4">
                {DOCUMENTS.map((doc) => {
                  const Icon = TYPE_ICONS[doc.type] ?? FileText;

                  return (
                    <Card key={doc.id} variant="product">
                      <CardContent className="flex items-start gap-4 p-5">
                        <div className="shrink-0 w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                          <Icon size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-neutral-dark">{doc.titre}</h3>
                          <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="info">{DOCUMENT_TYPE_LABELS[doc.type]}</Badge>
                            <span className="text-xs text-gray-400 font-mono">{doc.format}</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {unlocked ? (
                            <button className="p-2 text-primary hover:text-primary-600 transition-colors" aria-label={`Télécharger ${doc.titre}`}>
                              <Download size={20} />
                            </button>
                          ) : (
                            <div className="p-2 text-gray-300" aria-label="Document verrouillé">
                              <Lock size={20} />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* LeadForm gate */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                {unlocked ? (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-6 text-center">
                    <Download size={32} className="text-success mx-auto mb-3" />
                    <h3 className="font-bold text-success text-lg">Accès débloqué !</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Cliquez sur l'icône de téléchargement à côté de chaque document pour le récupérer.
                    </p>
                  </div>
                ) : (
                  <div className="bg-neutral-light rounded-lg p-6 border border-gray-200">
                    <h3 className="font-bold text-neutral-dark text-lg mb-2">
                      Accédez aux documents
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Remplissez le formulaire ci-dessous pour débloquer l'accès à tous les
                      documents techniques URBAQUAI.
                    </p>
                    <LeadForm
                      compact
                      documentIds={DOCUMENTS.map((d) => d.id)}
                      onSuccess={() => setUnlocked(true)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
