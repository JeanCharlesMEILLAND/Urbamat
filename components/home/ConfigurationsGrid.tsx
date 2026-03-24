"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { CONFIGURATIONS } from "@/lib/constants";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

const CONFIG_COLORS: Record<string, string> = {
  avancee: "from-primary/10 to-primary/5",
  avancee_velo: "from-emerald-50 to-emerald-25",
  ile: "from-accent/10 to-accent/5",
  ile_velo: "from-blue-50 to-blue-25",
};

const CONFIG_ICONS: Record<string, string> = {
  avancee: "┃██▓░░",
  avancee_velo: "┃██▓🚲",
  ile: "░░██░░",
  ile_velo: "🚲██🚲",
};

export function ConfigurationsGrid() {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <section className="py-20 lg:py-28 bg-neutral-light" ref={ref}>
      <Container>
        <SectionHeader
          titre="4 configurations, toutes les situations"
          sousTitre="Chaque arrêt de bus est unique. URBAQUAI s'adapte avec 4 configurations modulaires pour répondre à tous les cas de figure."
        />

        <div className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 transition-all duration-700",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {CONFIGURATIONS.map((config) => (
            <Link key={config.id} href={`/configurations#${config.id}`}>
              <Card variant="feature" className="h-full group cursor-pointer">
                <CardContent className="p-6 lg:p-8">
                  <div
                    className={`w-full h-32 rounded-lg bg-gradient-to-br ${CONFIG_COLORS[config.id]} flex items-center justify-center mb-6 group-hover:scale-[1.02] transition-transform`}
                  >
                    <span className="font-mono text-2xl text-primary/60 tracking-widest">
                      {CONFIG_ICONS[config.id]}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-dark group-hover:text-primary transition-colors">
                        {config.titre}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono mt-1">
                        {config.sousTitre}
                      </p>
                    </div>
                    <ArrowRight
                      size={20}
                      className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1"
                    />
                  </div>

                  <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                    {config.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {config.casUsage.slice(0, 2).map((cas) => (
                      <span
                        key={cas}
                        className="text-xs px-2 py-1 bg-white/80 text-gray-600 rounded border border-gray-200"
                      >
                        {cas}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/configurations"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-600 transition-colors"
          >
            Voir toutes les configurations en détail
            <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
