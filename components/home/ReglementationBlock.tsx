"use client";

import { ShieldCheck, BookOpen, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

const NORMES_KEYS = ["loi2005", "cerema", "norme"] as const;

export function ReglementationBlock() {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const t = useTranslations("reglementationBlock");

  return (
    <section className="py-20 lg:py-28 bg-primary" ref={ref}>
      <Container>
        <div className={cn(
          "text-center mb-12 transition-all duration-700",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-6">
            <ShieldCheck size={28} className="text-accent" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {t("titre")}
          </h2>
          <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto leading-relaxed">
            {t("sousTitre")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {NORMES_KEYS.map((key) => (
            <div key={key} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <BookOpen size={20} className="text-accent mb-3" />
              <h3 className="text-lg font-bold text-white">{t(`${key}.titre`)}</h3>
              <p className="mt-2 text-sm text-primary-100 leading-relaxed">{t(`${key}.description`)}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/reglementation" className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-300 transition-colors">
            {t("explorer")} <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
