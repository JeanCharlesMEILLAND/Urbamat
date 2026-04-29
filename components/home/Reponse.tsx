"use client";

import { Accessibility, Zap, Wrench, Droplets, Sun, BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const SOLUTIONS = [
  { key: "accessibilite", icon: Accessibility },
  { key: "pose48h", icon: Zap },
  { key: "modulaire", icon: Wrench },
  { key: "hydraulique", icon: Droplets },
  { key: "albedo", icon: Sun },
  { key: "certifie", icon: BadgeCheck },
] as const;

export function Reponse() {
  const t = useTranslations("problemSolution");

  return (
    <section className="py-20 lg:py-24 bg-surface">
      <Container>
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent uppercase tracking-wider">
            <span className="h-px w-8 bg-accent/40" />
            {t("reponse")}
            <span className="h-px w-8 bg-accent/40" />
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-neutral-dark">
            {t("reponseTitre")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SOLUTIONS.map(({ key, icon: Icon }, i) => {
            const isAccent = i === 0;
            return (
              <article
                key={key}
                className={cn(
                  "rounded-2xl p-6 lg:p-7 transition-all duration-300",
                  isAccent
                    ? "bg-accent text-white shadow-lg shadow-accent/30"
                    : "bg-white border border-surface-200 hover:border-accent/30 hover:shadow-md"
                )}
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center mb-4",
                    isAccent ? "bg-white/15" : "bg-accent-50 text-accent"
                  )}
                >
                  <Icon size={20} />
                </div>
                <h3
                  className={cn(
                    "text-base lg:text-lg font-semibold leading-snug",
                    isAccent ? "text-white" : "text-neutral-dark"
                  )}
                >
                  {t(`solutions.${key}.title`)}
                </h3>
                <p
                  className={cn(
                    "mt-2.5 text-sm leading-relaxed",
                    isAccent ? "text-white/85" : "text-gray-600"
                  )}
                >
                  {t(`solutions.${key}.text`)}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
