"use client";

import { MapPin, Calendar, ArrowRight, Ruler } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

export interface FeaturedRealisationItem {
  slug: string;
  titre: string;
  ville: string;
  departement: string;
  annee: number;
  typologieQuai: string;
  contexte: string;
  longueurMl: number;
  nbStations: number;
}

interface FeaturedRealisationsProps {
  /** Réalisations marquées `featured: true` en BDD (3 max). Si vide, la section
   *  ne s'affiche pas. */
  realisations: FeaturedRealisationItem[];
  /** Override du titre depuis l'admin/CMS. */
  titre?: string;
  /** Override du sous-titre depuis l'admin/CMS. */
  sousTitre?: string;
}

export function FeaturedRealisations({ realisations, titre, sousTitre }: FeaturedRealisationsProps) {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const t = useTranslations("featuredRealisations");

  // Pas de réalisations en avant → on masque la section pour éviter un bloc vide.
  if (!realisations.length) return null;

  return (
    <section id="realisations" className="py-20 lg:py-28 bg-white scroll-mt-24" ref={ref}>
      <Container>
        <SectionHeader
          titre={titre || t("titre")}
          sousTitre={sousTitre || t("sousTitre")}
        />

        <div className={cn(
          "grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 transition-all duration-700",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {realisations.map((real) => (
            <Link key={real.slug} href={`/realisations/${real.slug}`}>
              <Card variant="realisation" className="h-full group cursor-pointer">
                <div className="h-40 bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary/20">{real.ville}</span>
                </div>
                <div className="p-6">
                  <Badge variant="info">{real.typologieQuai}</Badge>
                  <h3 className="mt-3 text-lg font-bold text-neutral-dark group-hover:text-primary transition-colors">{real.titre}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={14} />{real.ville} ({real.departement})</span>
                    <span className="flex items-center gap-1"><Calendar size={14} />{real.annee}</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-2">{real.contexte}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Ruler size={12} />{real.longueurMl} ml</span>
                    <span>{real.nbStations} {t("stations")}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    {t("voirProjet")} <ArrowRight size={14} />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/realisations" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-600 transition-colors">
            {t("toutesRealisations")} <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
