"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

const PROBLEMS = ["inaccessibles", "travaux", "perturbation"] as const;

export function Constat() {
  const t = useTranslations("problemSolution");

  return (
    <section className="py-20 lg:py-24 bg-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark">
            {t("titre")}
          </h2>
          <p className="mt-4 text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t("sousTitre")}
          </p>
        </div>

        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-dark uppercase tracking-wider">
            <span className="h-px w-8 bg-neutral-dark/30" />
            {t("constat")}
            <span className="h-px w-8 bg-neutral-dark/30" />
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROBLEMS.map((key) => (
            <article
              key={key}
              className="relative rounded-2xl bg-surface border border-surface-200 p-6 lg:p-7"
            >
              <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-red-500" />
              <h3 className="text-lg font-semibold text-neutral-dark pr-6">
                {t(`problems.${key}.title`)}
              </h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {t(`problems.${key}.text`)}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
