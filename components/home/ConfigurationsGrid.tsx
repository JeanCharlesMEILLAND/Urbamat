"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { CONFIG_DIAGRAMS } from "@/components/produit/ConfigurationDiagrams";

const CONFIG_IDS = ["avancee", "avancee_velo", "ile", "ile_velo"] as const;

type ConfigId = typeof CONFIG_IDS[number];

interface ConfigCardOverride {
  titre?: string;
  sousTitre?: string;
  description?: string;
}

interface ConfigurationsGridProps {
  /** Override titre */
  titre?: string;
  /** Override sous-titre */
  sousTitre?: string;
  /** Map id config → URL d'image custom (remplace le schéma SVG si défini) */
  imageOverrides?: Partial<Record<ConfigId, string>>;
  /** Override des textes de chaque carte (titre/sous-titre/description) */
  cardOverrides?: Partial<Record<ConfigId, ConfigCardOverride>>;
}

export function ConfigurationsGrid({ titre, sousTitre, imageOverrides, cardOverrides }: ConfigurationsGridProps = {}) {
  const tGrid = useTranslations("configurationsGrid");
  const tConfig = useTranslations("configurations");

  return (
    <section id="configs" className="py-20 lg:py-28 bg-surface scroll-mt-24">
      <Container>
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark">
            {titre || tGrid("titre")}
          </h2>
          <p className="mt-4 text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {sousTitre || tGrid("sousTitre")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CONFIG_IDS.map((id) => {
            const Diagram = CONFIG_DIAGRAMS[id];
            const customImage = imageOverrides?.[id];
            const card = cardOverrides?.[id];
            return (
              <Link key={id} href={`/configurations#${id}`} className="group">
                <article className="h-full bg-white rounded-2xl border border-surface-200 hover:border-accent/40 hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-0">
                    {/* Visuel — image custom uploadée si dispo, sinon schéma SVG par défaut */}
                    <div className="sm:col-span-2 bg-gray-50 p-3 flex items-center justify-center">
                      {customImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={customImage}
                          alt={tConfig(`${id}.titre`)}
                          className="w-full h-auto rounded group-hover:scale-[1.02] transition-transform duration-300 object-contain"
                        />
                      ) : (
                        <Diagram className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-300" showLabel={false} />
                      )}
                    </div>
                    <div className="sm:col-span-3 p-6 flex flex-col justify-center">
                      <h3 className="text-lg font-semibold text-neutral-dark group-hover:text-accent transition-colors">
                        {card?.titre || tConfig(`${id}.titre`)}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 font-mono">
                        {card?.sousTitre || tConfig(`${id}.sousTitre`)}
                      </p>
                      {card?.description ? (
                        <div
                          className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-3 [&_p]:m-0"
                          dangerouslySetInnerHTML={{ __html: card.description }}
                        />
                      ) : (
                        <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-3">
                          {tConfig(`${id}.description`)}
                        </p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent group-hover:gap-2.5 transition-all">
                        {tGrid("detail")}
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
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
