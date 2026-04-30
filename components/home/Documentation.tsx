"use client";

import { FileText, Layers, Shield, Map, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

// Map type doc → icone Lucide. `fiche` et `guide` reprennent l'iconographie
// de l'ancien hardcoded ; `cctp` et `plan` sont les types restants du schema.
const TYPE_ICON = {
  fiche: FileText,
  guide: Layers,
  cctp: Shield,
  plan: Map,
} as const;

export interface DocumentationItem {
  id: string;
  titre: string;
  type: keyof typeof TYPE_ICON;
  fichierUrl: string;
  description: string | null;
}

interface DocumentationProps {
  /** Documents marqués `featured: true` en BDD (3 max recommandé). Si vide, la
   *  section affiche les libellés i18n par défaut comme fallback. */
  documents: DocumentationItem[];
  /** Override du titre depuis l'admin/CMS. */
  titre?: string;
}

export function Documentation({ documents, titre }: DocumentationProps) {
  const t = useTranslations("documentation");

  if (!documents.length) return null;

  return (
    <section id="documentation" className="py-20 lg:py-24 bg-white scroll-mt-24">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark">
            {titre || t("titre")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {documents.map((doc) => {
            const Icon = TYPE_ICON[doc.type] || FileText;
            return (
              <Link
                key={doc.id}
                href="/telechargements"
                className="group flex items-center gap-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 hover:border-accent/40 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-dark truncate">
                    {doc.titre}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {doc.description || t(`${doc.type}.format`)}
                  </p>
                </div>
                <Download size={16} className="text-gray-400 group-hover:text-accent transition-colors" />
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
