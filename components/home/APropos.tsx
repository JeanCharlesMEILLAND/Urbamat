"use client";

import { ArrowRight, Award, Wrench, ShieldCheck, Train, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

export function APropos() {
  const t = useTranslations("apropos");

  return (
    <section id="apropos" className="py-20 lg:py-28 bg-surface scroll-mt-24">
      <Container>
        {/* Bloc d'intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-widest text-accent font-bold mb-3">
              URBAMAT Environnement
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark leading-tight">
              {t("titre")}
            </h2>
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
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/apropos"
                className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all"
              >
                Découvrir l'entreprise
                <ArrowRight size={16} />
              </Link>
              <span className="text-gray-300">·</span>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-gray-600 font-medium hover:text-accent transition-colors"
              >
                {t("cta")}
              </Link>
            </div>
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

        {/* 5 sous-sections en cartes */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Expertise historique */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-surface-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
                <Award size={20} />
              </div>
              <h3 className="text-lg font-bold text-neutral-dark">
                Une expertise historique de l'accessibilité bus
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Forte d'une expertise reconnue dans l'accessibilité des transports publics,
              URBAMAT Environnement s'est fait connaître auprès des autorités organisatrices
              de transport, des exploitants, des maîtres d'œuvre et des entreprises de pose
              grâce à sa solution historique de bordure d'aide à l'accostage quai-bus{" "}
              <strong className="text-neutral-dark">URBABUS®</strong>.
            </p>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Cette solution, qui permet un accès de plain-pied au matériel roulant et
              qui est largement déployée sur le réseau français, est recommandée dans le{" "}
              <strong className="text-neutral-dark">guide CEREMA 2018</strong> consacré à
              l'accessibilité des points d'arrêt de bus et de car.
            </p>
          </div>

          {/* 2. URBAQUAI : retours d'expérience */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-surface-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
                <Wrench size={20} />
              </div>
              <h3 className="text-lg font-bold text-neutral-dark">
                URBAQUAI® : une réponse issue des retours d'expérience
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              C'est dans cette continuité qu'est né{" "}
              <strong className="text-neutral-dark">URBAQUAI®</strong> : un système constructif
              modulaire pensé pour les besoins de quais bus temporaires, rapidement et
              facilement déployable, robuste, réemployable et conçu conformément aux
              normes d'accessibilité PMR en vigueur.
            </p>
          </div>

          {/* 3. Niveau d'exigence */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-surface-200 shadow-sm md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-bold text-neutral-dark">
                Un niveau d'exigence élevé
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              URBAMAT applique des standards rigoureux en matière de qualité de fabrication
              et veille scrupuleusement au respect des normes. Cette culture de l'exigence
              irrigue l'ensemble de ses solutions dédiées à l'accessibilité des transports publics :
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="text-accent font-bold">•</span>
                <span>
                  <strong className="text-neutral-dark">URBABUS®</strong> — bordures d'aide
                  à l'accostage quai-bus
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent font-bold">•</span>
                <span>
                  <strong className="text-neutral-dark">URBATRAIN®</strong> — dalles d'éveil
                  de vigilance pour quais voyageurs SNCF, issues d'un site de production
                  qualifié sous VISA SNCF
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent font-bold">•</span>
                <span>
                  <strong className="text-neutral-dark">URBATRAM®</strong> — stations de
                  tramway préfabriquées sur mesure
                </span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              Dans tous ces domaines, conformité, sécurité et durabilité constituent
              des critères fondamentaux.
            </p>
          </div>

          {/* 4. Ancrage filière (FIF + SNCF) */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-surface-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
                <Train size={20} />
              </div>
              <h3 className="text-lg font-bold text-neutral-dark">
                Un ancrage reconnu dans la filière
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              URBAMAT Environnement est adhérent de la{" "}
              <strong className="text-neutral-dark">Fédération des Industries Ferroviaires (FIF)</strong>.
              Depuis 2015, l'entreprise est également{" "}
              <strong className="text-neutral-dark">fournisseur officiel de la SNCF</strong>.
            </p>
          </div>

          {/* 5. Une confiance renouvelée + logos clients */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-surface-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-bold text-neutral-dark">
                Une confiance renouvelée
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              La confiance accordée aux solutions URBAMAT témoigne de leur contribution
              concrète à l'amélioration de l'accès aux transports publics.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-gray-400 font-mono">
              <span className="px-2.5 py-1 border border-gray-200 rounded-md bg-gray-50">SNCF Réseau</span>
              <span className="px-2.5 py-1 border border-gray-200 rounded-md bg-gray-50">SNCF Gares &amp; Connexions</span>
              <span className="px-2.5 py-1 border border-gray-200 rounded-md bg-gray-50">Nice Métropole</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
