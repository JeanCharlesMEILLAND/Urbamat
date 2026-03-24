import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CONFIGURATIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Configurations — 4 solutions pour chaque arrêt de bus",
  description:
    "Découvrez les 4 configurations URBAQUAI : avancée de trottoir, avancée avec piste cyclable, île centrale et île avec piste cyclable. Solution modulaire pour chaque situation.",
};

const SCHEMA_VISUALS: Record<string, { top: string; bottom: string; color: string }> = {
  avancee: {
    top: "━━━━━━━━━━━━━━ VOIE BUS ━━━━━━━━━━━━━━",
    bottom: "▓▓▓▓▓▓████████▓▓▓ TROTTOIR ▓▓▓▓▓▓▓▓▓▓",
    color: "from-primary/10 to-primary/5",
  },
  avancee_velo: {
    top: "━━━━━━━━━━━━━━ VOIE BUS ━━━━━━━━━━━━━━",
    bottom: "🚲🚲🚲 ▓▓████████▓▓ TROTTOIR ▓▓▓▓▓▓▓▓",
    color: "from-emerald-50 to-emerald-100/30",
  },
  ile: {
    top: "━━━━━ VOIE ━━━━━ ██████ ━━━━━ VOIE ━━━━━",
    bottom: "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
    color: "from-accent/10 to-accent/5",
  },
  ile_velo: {
    top: "━━ VOIE ━━ 🚲 ██████ 🚲 ━━ VOIE ━━",
    bottom: "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
    color: "from-blue-50 to-blue-100/30",
  },
};

export default function ConfigurationsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-neutral-light py-16 lg:py-24">
        <Container>
          <SectionHeader
            titre="Configurations URBAQUAI"
            sousTitre="4 configurations modulaires pour répondre à chaque situation d'arrêt de bus. Choisissez la solution adaptée à votre projet."
          />
        </Container>
      </section>

      {/* Les 4 configurations */}
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="space-y-20">
            {CONFIGURATIONS.map((config, index) => {
              const visual = SCHEMA_VISUALS[config.id];
              const isEven = index % 2 === 0;

              return (
                <div
                  key={config.id}
                  id={config.id}
                  className="scroll-mt-24"
                >
                  <div className={cn(
                    "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",
                    !isEven && "lg:grid-flow-dense"
                  )}>
                    {/* Schéma */}
                    <div className={cn(!isEven && "lg:col-start-2")}>
                      <div className={cn(
                        "rounded-xl p-8 bg-gradient-to-br",
                        visual.color,
                        "border border-gray-100"
                      )}>
                        <div className="font-mono text-xs text-center space-y-6 text-gray-500">
                          <div className="bg-white/60 rounded p-3 tracking-wider">
                            {visual.top}
                          </div>
                          <div className="flex justify-center">
                            <div className="bg-primary/20 border-2 border-primary/40 rounded px-6 py-3 text-primary font-bold text-sm">
                              QUAI URBAQUAI
                            </div>
                          </div>
                          <div className="bg-white/60 rounded p-3 tracking-wider">
                            {visual.bottom}
                          </div>
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-4">
                          Vue schématique en plan — {config.sousTitre}
                        </p>
                      </div>
                    </div>

                    {/* Texte */}
                    <div className={cn(!isEven && "lg:col-start-1")}>
                      <Badge variant={index < 2 ? "info" : "warning"} className="mb-3">
                        Configuration {index + 1}/4
                      </Badge>
                      <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark">
                        {config.titre}
                      </h2>
                      <p className="mt-1 text-sm font-mono text-gray-500">{config.sousTitre}</p>
                      <p className="mt-4 text-gray-600 leading-relaxed">{config.description}</p>

                      {/* Avantages */}
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Avantages
                        </h3>
                        <ul className="space-y-2">
                          {config.avantages.map((av) => (
                            <li key={av} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
                              {av}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cas d'usage */}
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Cas d'usage
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {config.casUsage.map((cas) => (
                            <span
                              key={cas}
                              className="text-xs px-3 py-1.5 bg-neutral-light text-gray-600 rounded-full border border-gray-200"
                            >
                              {cas}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-neutral-light">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark">
              Besoin d'aide pour choisir ?
            </h2>
            <p className="mt-4 text-gray-600 max-w-xl mx-auto">
              Notre équipe vous accompagne dans le choix de la configuration optimale pour votre projet.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contact" size="lg">
                Nous contacter
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button href="/realisations" variant="outline" size="lg">
                Voir des exemples
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
