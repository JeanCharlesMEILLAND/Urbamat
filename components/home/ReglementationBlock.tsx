"use client";

import { ShieldCheck, BookOpen, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

interface ReglementationCardOverride {
  titre?: string;
  description?: string;
}

interface ReglementationBlockProps {
  titre?: string;
  sousTitre?: string;
  /** Texte du lien CTA en bas du bloc */
  ctaLabel?: string;
  /** Override des 3 cartes (Loi 2005, Cerema, Norme) */
  cards?: [
    ReglementationCardOverride | undefined,
    ReglementationCardOverride | undefined,
    ReglementationCardOverride | undefined,
  ];
}

const I18N_KEYS = ["loi2005", "cerema", "norme"] as const;

export function ReglementationBlock({ titre, sousTitre, ctaLabel, cards }: ReglementationBlockProps = {}) {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const t = useTranslations("reglementationBlock");

  return (
    <section id="reglementation" className="py-20 lg:py-24 bg-white scroll-mt-24" ref={ref}>
      <Container>
        <div
          className={cn(
            "text-center mb-12 transition-all duration-700",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-50 mb-5">
            <ShieldCheck size={22} className="text-accent" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark">{titre || t("titre")}</h2>
          <p className="mt-3 text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {sousTitre || t("sousTitre")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[0, 1, 2].map((i) => {
            const card = cards?.[i];
            const k = I18N_KEYS[i];
            return (
              <div
                key={i}
                className="rounded-2xl bg-surface-50 border border-surface-200 p-6 hover:border-accent/30 hover:shadow-md transition-all"
              >
                <BookOpen size={18} className="text-accent mb-3" />
                <h3 className="text-base font-semibold text-neutral-dark">{card?.titre || t(`${k}.titre`)}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{card?.description || t(`${k}.description`)}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/reglementation"
            className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all"
          >
            {ctaLabel || t("explorer")} <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
