"use client";

import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

interface AProposCardOverride {
  titre?: string;
  /** Texte de la carte. Le HTML est autorisé pour permettre le gras / italique. */
  texte?: string;
  /** Nom d'icône Lucide */
  icon?: string;
}

interface AProposProps {
  /** Eyebrow ("URBAMAT Environnement") */
  eyebrow?: string;
  titre?: string;
  /** Texte d'intro (HTML autorisé). Si présent, remplace les 2 paragraphes par défaut. */
  intro?: string;
  /** Libellé du CTA "Découvrir l'entreprise" */
  ctaPrimaryLabel?: string;
  /** URL du CTA primaire (par défaut /apropos) */
  ctaPrimaryUrl?: string;
  /** Libellé du CTA secondaire (par défaut : "En savoir plus sur l'entreprise") */
  ctaSecondaryLabel?: string;
  /** URL du CTA secondaire (par défaut /contact) */
  ctaSecondaryUrl?: string;
  /** Image carrée affichée à droite. Si vide, fallback sur la mosaïque emoji décorative. */
  visuelUrl?: string;
  /** 5 cartes (texte HTML accepté). Index : expertise, urbaquai, exigence, ancrage, confiance. */
  cards?: [
    AProposCardOverride | undefined,
    AProposCardOverride | undefined,
    AProposCardOverride | undefined,
    AProposCardOverride | undefined,
    AProposCardOverride | undefined,
  ];
  /** Logos clients affichés en bas de la dernière carte */
  logosClients?: string[];
}

const DEFAULT_ICONS = ["Award", "Wrench", "ShieldCheck", "Train", "Users"] as const;

const DEFAULT_TITLES = [
  "Une expertise historique de l'accessibilité bus",
  "URBAQUAI® : une réponse issue des retours d'expérience",
  "Un niveau d'exigence élevé",
  "Un ancrage reconnu dans la filière",
  "Une confiance renouvelée",
] as const;

const DEFAULT_TEXTS = [
  `Forte d'une expertise reconnue dans l'accessibilité des transports publics, URBAMAT Environnement s'est fait connaître auprès des autorités organisatrices de transport, des exploitants, des maîtres d'œuvre et des entreprises de pose grâce à sa solution historique de bordure d'aide à l'accostage quai-bus <strong>URBABUS®</strong>.<br/><br/>Cette solution, qui permet un accès de plain-pied au matériel roulant et qui est largement déployée sur le réseau français, est recommandée dans le <strong>guide CEREMA 2018</strong> consacré à l'accessibilité des points d'arrêt de bus et de car.`,
  `C'est dans cette continuité qu'est né <strong>URBAQUAI®</strong> : un système constructif modulaire pensé pour les besoins de quais bus temporaires, rapidement et facilement déployable, robuste, réemployable et conçu conformément aux normes d'accessibilité PMR en vigueur.`,
  `URBAMAT applique des standards rigoureux en matière de qualité de fabrication et veille scrupuleusement au respect des normes.<br/><br/><strong>URBABUS®</strong> — bordures d'aide à l'accostage quai-bus.<br/><strong>URBATRAIN®</strong> — dalles d'éveil de vigilance pour quais voyageurs SNCF, issues d'un site de production qualifié sous VISA SNCF.<br/><strong>URBATRAM®</strong> — stations de tramway préfabriquées sur mesure.`,
  `URBAMAT Environnement est adhérent de la <strong>Fédération des Industries Ferroviaires (FIF)</strong>. Depuis 2015, l'entreprise est également <strong>fournisseur officiel de la SNCF</strong>.`,
  `La confiance accordée aux solutions URBAMAT témoigne de leur contribution concrète à l'amélioration de l'accès aux transports publics.`,
] as const;

const DEFAULT_LOGOS = ["SNCF Réseau", "SNCF Gares & Connexions", "Nice Métropole"];

function lucideByName(name: string): React.ComponentType<{ size?: number; className?: string }> {
  const lib = Icons as unknown as Record<
    string,
    React.ComponentType<{ size?: number; className?: string }>
  >;
  return lib[name] || lib.Award;
}

export function APropos({
  eyebrow,
  titre,
  intro,
  ctaPrimaryLabel,
  ctaPrimaryUrl,
  ctaSecondaryLabel,
  ctaSecondaryUrl,
  visuelUrl,
  cards,
  logosClients,
}: AProposProps = {}) {
  const t = useTranslations("apropos");

  const logos = logosClients?.length ? logosClients : DEFAULT_LOGOS;

  return (
    <section id="apropos" className="py-20 lg:py-28 bg-surface scroll-mt-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-widest text-accent font-bold mb-3">
              {eyebrow || "URBAMAT Environnement"}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark leading-tight">
              {titre || t("titre")}
            </h2>
            {intro ? (
              <div
                className="mt-6 text-base lg:text-lg text-gray-600 leading-relaxed [&_p]:mb-3"
                dangerouslySetInnerHTML={{ __html: intro }}
              />
            ) : (
              <>
                <p className="mt-6 text-base lg:text-lg text-gray-600 leading-relaxed">
                  PME familiale basée en Alsace, URBAMAT Environnement conçoit et développe
                  depuis le début des années 2000 des solutions en béton préfabriqué dédiées
                  à la mobilité urbaine.
                </p>
                <p className="mt-4 text-base lg:text-lg text-gray-600 leading-relaxed">
                  Sa philosophie s'inscrit dans une démarche d'amélioration de la qualité
                  de service des transports publics afin de garantir une mobilité accessible,
                  sûre et sans obstacle pour l'ensemble des usagers.
                </p>
              </>
            )}
            <div className="mt-8 flex items-center gap-4">
              <Link
                href={ctaPrimaryUrl || "/apropos"}
                className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all"
              >
                {ctaPrimaryLabel || "Découvrir l'entreprise"}
                <ArrowRight size={16} />
              </Link>
              <span className="text-gray-300">·</span>
              <Link
                href={ctaSecondaryUrl || "/contact"}
                className="inline-flex items-center gap-2 text-gray-600 font-medium hover:text-accent transition-colors"
              >
                {ctaSecondaryLabel || t("cta")}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-accent-100 via-accent-50 to-white border border-surface-200">
              {visuelUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={visuelUrl}
                  alt="URBAMAT Environnement"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1, 2, 3, 4].map((i) => {
            const card = cards?.[i];
            const Icon = lucideByName(card?.icon || DEFAULT_ICONS[i]);
            const isWide = i === 2; // 3e carte (exigence) prend toute la largeur
            return (
              <div
                key={i}
                className={`bg-white rounded-2xl p-6 lg:p-8 border border-surface-200 shadow-sm ${
                  isWide ? "md:col-span-2" : ""
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-dark">
                    {card?.titre || DEFAULT_TITLES[i]}
                  </h3>
                </div>
                <div
                  className="text-sm text-gray-600 leading-relaxed [&_strong]:text-neutral-dark"
                  dangerouslySetInnerHTML={{ __html: card?.texte || DEFAULT_TEXTS[i] }}
                />
                {/* Logos clients sur la dernière carte (Confiance renouvelée) */}
                {i === 4 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-gray-400 font-mono">
                    {logos.map((logo) => (
                      <span key={logo} className="px-2.5 py-1 border border-gray-200 rounded-md bg-gray-50">
                        {logo}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
