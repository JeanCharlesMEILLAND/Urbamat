"use client";

import { useState } from "react";
import { FileText, FileSpreadsheet, FileCode, Download, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LeadForm } from "@/components/LeadForm";

const DOC_KEYS = ["fiche", "guide", "cctp", "plan"] as const;
const DOC_IDS = ["fiche-technique", "guide-pose", "cctp-bpu", "plans-dwg"];
const DOC_FORMATS = ["PDF — 2.4 Mo", "PDF — 5.1 Mo", "DOCX — 380 Ko", "DWG — 1.8 Mo"];

const TYPE_ICONS: Record<string, typeof FileText> = {
  fiche: FileText,
  guide: FileSpreadsheet,
  cctp: FileCode,
  plan: FileCode,
};

export default function TelechargmentsPage() {
  const [unlocked, setUnlocked] = useState(false);
  const t = useTranslations("telechargements");

  return (
    <div>
      <section className="bg-neutral-light py-16 lg:py-24">
        <Container>
          <SectionHeader titre={t("titre")} sousTitre={t("sousTitre")} />
        </Container>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <h2 className="text-xl font-bold text-neutral-dark mb-6">{t("documentsDisponibles")}</h2>
              <div className="space-y-4">
                {DOC_KEYS.map((key, i) => {
                  const Icon = TYPE_ICONS[key];
                  return (
                    <Card key={key} variant="product">
                      <CardContent className="flex items-start gap-4 p-5">
                        <div className="shrink-0 w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                          <Icon size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-neutral-dark">{t(`documents.${key}.titre`)}</h3>
                          <p className="text-sm text-gray-500 mt-1">{t(`documents.${key}.description`)}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="info">{t(`types.${key}`)}</Badge>
                            <span className="text-xs text-gray-400 font-mono">{DOC_FORMATS[i]}</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {unlocked ? (
                            <button className="p-2 text-primary hover:text-primary-600 transition-colors">
                              <Download size={20} />
                            </button>
                          ) : (
                            <div className="p-2 text-gray-300"><Lock size={20} /></div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24">
                {unlocked ? (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-6 text-center">
                    <Download size={32} className="text-success mx-auto mb-3" />
                    <h3 className="font-bold text-success text-lg">{t("accesDebloque")}</h3>
                    <p className="text-sm text-gray-600 mt-2">{t("cliquezTelecharger")}</p>
                  </div>
                ) : (
                  <div className="bg-neutral-light rounded-lg p-6 border border-gray-200">
                    <h3 className="font-bold text-neutral-dark text-lg mb-2">{t("accesDocuments")}</h3>
                    <p className="text-sm text-gray-600 mb-6">{t("remplissezFormulaire")}</p>
                    <LeadForm compact documentIds={DOC_IDS} onSuccess={() => setUnlocked(true)} />
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
