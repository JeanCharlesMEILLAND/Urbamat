"use client";

import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, Accessibility, Zap, Wrench, BadgeCheck, Droplets, Sun } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

const PROBLEMS = [
  {
    icon: ShieldAlert,
    title: "Arrêts inaccessibles",
    text: "Des milliers d'arrêts de bus en France ne sont toujours pas conformes à la loi accessibilité de 2005.",
  },
  {
    icon: Clock,
    title: "Travaux longs et coûteux",
    text: "Les solutions en béton coulé nécessitent des semaines de travaux, de terrassement et de séchage.",
  },
  {
    icon: AlertTriangle,
    title: "Perturbation du trafic",
    text: "Les chantiers classiques imposent des déviations et des interruptions de service prolongées.",
  },
];

const SOLUTIONS = [
  {
    icon: Accessibility,
    title: "Accessibilité immédiate",
    text: "Quai à hauteur normalisée pour un accès de plain-pied, conforme PMR dès la pose.",
  },
  {
    icon: Zap,
    title: "Pose en 48h",
    text: "Modules préfabriqués livrés prêts à poser. Pas de coffrage, pas de séchage, pas d'attente.",
  },
  {
    icon: Wrench,
    title: "Modulaire et réversible",
    text: "Configuration provisoire ou définitive. Démontable et repositionnable sans destruction.",
  },
  {
    icon: Droplets,
    title: "Transparence hydraulique",
    text: "Vide fonctionnel continu sous dalle — évacuation latérale et longitudinale des eaux pluviales, sans rétention.",
  },
  {
    icon: Sun,
    title: "Albédo élevé",
    text: "Réduction de l'échauffement de surface et des îlots de chaleur. 4 coloris naturels clairs disponibles.",
  },
  {
    icon: BadgeCheck,
    title: "Certifié CERIB EN 1339",
    text: "Béton C40/50, ciment NF bas carbone, tests CERIB validés. Conforme CEREMA 2018 et loi accessibilité 2005.",
  },
];

export function ProblemSolution() {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <section className="py-20 lg:py-28 bg-white" ref={ref}>
      <Container>
        <SectionHeader
          titre="Un problème national. Une solution concrète."
          sousTitre="En France, des milliers d'arrêts de bus restent inaccessibles aux personnes à mobilité réduite. URBAQUAI change la donne."
        />

        <div className={cn(
          "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mt-16 transition-all duration-700",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {/* Problème */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-dark">Le constat</h3>
            </div>
            <div className="space-y-6">
              {PROBLEMS.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <item.icon size={20} className="text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-dark">{item.title}</h4>
                    <p className="mt-1 text-gray-600 leading-relaxed text-sm">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-success" />
              </div>
              <h3 className="text-xl font-bold text-neutral-dark">La réponse URBAQUAI</h3>
            </div>
            <div className="space-y-6">
              {SOLUTIONS.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <item.icon size={20} className="text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-dark">{item.title}</h4>
                    <p className="mt-1 text-gray-600 leading-relaxed text-sm">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
