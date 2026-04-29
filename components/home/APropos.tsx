"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

export function APropos() {
  const t = useTranslations("apropos");

  return (
    <section id="apropos" className="py-20 lg:py-28 bg-surface scroll-mt-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark leading-tight">
              {t("titre")}
            </h2>
            <p className="mt-6 text-base lg:text-lg text-gray-600 leading-relaxed">
              {t("description")}
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all"
            >
              {t("cta")}
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-accent-100 via-accent-50 to-white border border-surface-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 p-8">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-3xl"
                    >
                      {["🏗️", "🚌", "♿", "🧱"][i]}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-accent/30 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-accent-200/40 blur-2xl" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
