"use client";

import * as Icons from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

interface UspCardOverride {
  titre?: string;
  description?: string;
  /** Nom d'icône Lucide (ex. "Zap", "Recycle"). Si vide ou inconnu → fallback. */
  icon?: string;
}

interface UspCardsProps {
  /** Surtitre / eyebrow (au-dessus du titre principal). Optionnel. */
  eyebrow?: string;
  /** Titre principal de la section. Optionnel. */
  titre?: string;
  /** Override des 4 cartes — index 0..3. */
  cards?: [
    UspCardOverride | undefined,
    UspCardOverride | undefined,
    UspCardOverride | undefined,
    UspCardOverride | undefined,
  ];
}

// Icônes par défaut (chaîne pour rester en phase avec le CMS qui stocke un nom)
const DEFAULT_ICONS = ["Zap", "MapPin", "Recycle", "Accessibility"] as const;
const I18N_KEYS = ["miseEnOeuvre", "poseDirecte", "logistique", "accessibilite"] as const;

/** Résout un nom d'icône Lucide (string) en composant React. Fallback Zap. */
function lucideByName(name: string): React.ComponentType<{ size?: number; className?: string }> {
  const lib = Icons as unknown as Record<
    string,
    React.ComponentType<{ size?: number; className?: string }>
  >;
  return lib[name] || lib.Zap;
}

export function UspCards({ eyebrow, titre, cards }: UspCardsProps = {}) {
  const t = useTranslations("usp");

  return (
    <section id="usp" className="bg-surface pb-16 lg:pb-24 scroll-mt-24">
      <Container>
        {(eyebrow || titre) && (
          <div className="text-center mb-10">
            {eyebrow && (
              <p className="text-xs uppercase tracking-widest text-accent font-bold mb-2">
                {eyebrow}
              </p>
            )}
            {titre && (
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark">
                {titre}
              </h2>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => {
            const card = cards?.[i];
            const isAccent = i === 0;
            const cardTitre = card?.titre || t(`${I18N_KEYS[i]}.title`);
            const cardDesc = card?.description; // nouveau champ optionnel
            const Icon = lucideByName(card?.icon || DEFAULT_ICONS[i]);

            return (
              <article
                key={i}
                className={cn(
                  "rounded-2xl p-6 lg:p-7 min-h-[200px] flex flex-col gap-4 transition-all duration-300",
                  isAccent
                    ? "bg-accent text-white shadow-lg shadow-accent/30"
                    : "bg-white text-neutral-dark border border-surface-200 hover:border-accent/30 hover:shadow-md"
                )}
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center",
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
                  {cardTitre}
                </h3>
                {cardDesc && (
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      isAccent ? "text-white/85" : "text-gray-600"
                    )}
                  >
                    {cardDesc}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
