"use client";

import { FileText, Layers, Shield, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

const DOCS = [
  { key: "fiche", icon: FileText },
  { key: "guide", icon: Layers },
  { key: "norme", icon: Shield },
] as const;

export function Documentation() {
  const t = useTranslations("documentation");

  return (
    <section className="py-20 lg:py-24 bg-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark">
            {t("titre")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {DOCS.map(({ key, icon: Icon }) => (
            <Link
              key={key}
              href="/telechargements"
              className="group flex items-center gap-4 rounded-2xl border border-surface-200 bg-surface-50 p-5 hover:border-accent/40 hover:bg-white hover:shadow-md transition-all"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-dark truncate">
                  {t(`${key}.titre`)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t(`${key}.format`)}
                </p>
              </div>
              <Download size={16} className="text-gray-400 group-hover:text-accent transition-colors" />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
