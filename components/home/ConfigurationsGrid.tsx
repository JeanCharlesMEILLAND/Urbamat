"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

const CONFIG_IDS = ["avancee", "avancee_velo", "ile", "ile_velo"] as const;

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
  const tGrid = useTranslations("configurationsGrid");
  const tConfig = useTranslations("configurations");

  return (
    <section className="py-20 lg:py-28 bg-neutral-light" ref={ref}>
      <Container>
        <SectionHeader
          titre={tGrid("titre")}
          sousTitre={tGrid("sousTitre")}
        />

        <div className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 transition-all duration-700",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {CONFIG_IDS.map((id) => (
            <Link key={id} href={`/configurations#${id}`}>
              <Card variant="feature" className="h-full group cursor-pointer">
                <CardContent className="p-6 lg:p-8">
                  <div
                    className={`w-full h-32 rounded-lg bg-gradient-to-br ${CONFIG_COLORS[id]} flex items-center justify-center mb-6 group-hover:scale-[1.02] transition-transform`}
                  >
                    <span className="font-mono text-2xl text-primary/60 tracking-widest">
                      {CONFIG_ICONS[id]}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-dark group-hover:text-primary transition-colors">
                        {tConfig(`${id}.titre`)}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono mt-1">
                        {tConfig(`${id}.sousTitre`)}
                      </p>
                    </div>
                    <ArrowRight
                      size={20}
                      className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1"
                    />
                  </div>

                  <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                    {tConfig(`${id}.description`)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[0, 1].map((i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-white/80 text-gray-600 rounded border border-gray-200"
                      >
                        {tConfig(`${id}.casUsage.${i}`)}
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
            {tGrid("voirTout")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
