"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

const CONFIG_IDS = ["avancee", "avancee_velo", "ile", "ile_velo"] as const;

export function ConfigurationsGrid() {
  const tGrid = useTranslations("configurationsGrid");
  const tConfig = useTranslations("configurations");

  return (
    <section className="py-20 lg:py-28 bg-surface">
      <Container>
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark">
            {tGrid("titre")}
          </h2>
          <p className="mt-4 text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {tGrid("sousTitre")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CONFIG_IDS.map((id) => (
            <Link key={id} href={`/configurations#${id}`} className="group">
              <article className="h-full bg-white rounded-2xl border border-surface-200 hover:border-accent/40 hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="grid grid-cols-5 gap-0">
                  <div className="col-span-2 aspect-square bg-surface-100 flex items-center justify-center">
                    <span className="text-5xl opacity-60 group-hover:scale-110 transition-transform duration-300">
                      🚌
                    </span>
                  </div>
                  <div className="col-span-3 p-6 flex flex-col justify-center">
                    <h3 className="text-lg font-semibold text-neutral-dark group-hover:text-accent transition-colors">
                      {tConfig(`${id}.titre`)}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 font-mono">
                      {tConfig(`${id}.sousTitre`)}
                    </p>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {tConfig(`${id}.description`)}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent group-hover:gap-2.5 transition-all">
                      {tGrid("detail")}
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/configurations"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white font-semibold text-sm hover:bg-accent-600 transition-colors"
          >
            {tGrid("voirTout")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
