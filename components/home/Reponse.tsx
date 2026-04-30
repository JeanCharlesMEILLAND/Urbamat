"use client";

import * as Icons from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

interface ReponseCardOverride {
  titre?: string;
  texte?: string;
  /** Nom d'icône Lucide (ex. "Accessibility", "Zap", "Wrench") */
  icon?: string;
}

interface ReponseProps {
  /** Eyebrow ("La réponse URBAQUAI") */
  eyebrow?: string;
  /** Titre principal */
  titre?: string;
  /** Override des 6 cartes */
  cards?: [
    ReponseCardOverride | undefined,
    ReponseCardOverride | undefined,
    ReponseCardOverride | undefined,
    ReponseCardOverride | undefined,
    ReponseCardOverride | undefined,
    ReponseCardOverride | undefined,
  ];
}

const I18N_KEYS = ["accessibilite", "pose48h", "modulaire", "hydraulique", "albedo", "certifie"] as const;
const DEFAULT_ICONS = ["Accessibility", "Zap", "Wrench", "Droplets", "Sun", "BadgeCheck"] as const;

function lucideByName(name: string): React.ComponentType<{ size?: number; className?: string }> {
  const lib = Icons as unknown as Record<
    string,
    React.ComponentType<{ size?: number; className?: string }>
  >;
  return lib[name] || lib.Accessibility;
}

export function Reponse({ eyebrow, titre, cards }: ReponseProps = {}) {
  const t = useTranslations("problemSolution");

  return (
    <section id="reponse" className="py-20 lg:py-24 bg-surface scroll-mt-24">
      <Container>
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent uppercase tracking-wider">
            <span className="h-px w-8 bg-accent/40" />
            {eyebrow || t("reponse")}
            <span className="h-px w-8 bg-accent/40" />
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-neutral-dark">
            {titre || t("reponseTitre")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const card = cards?.[i];
            const k = I18N_KEYS[i];
            const isAccent = i === 0;
            const Icon = lucideByName(card?.icon || DEFAULT_ICONS[i]);
            return (
              <article
                key={i}
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
                  {card?.titre || t(`solutions.${k}.title`)}
                </h3>
                <p
                  className={cn(
                    "mt-2.5 text-sm leading-relaxed",
                    isAccent ? "text-white/85" : "text-gray-600"
                  )}
                >
                  {card?.texte || t(`solutions.${k}.text`)}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
