import { setRequestLocale } from "next-intl/server";
import { getCmsOverrides } from "@/lib/cms";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/home/Hero";
import { UspCards } from "@/components/home/UspCards";
import { ConceptUrbaquai } from "@/components/home/ConceptUrbaquai";
import { Constat } from "@/components/home/Constat";
import { Reponse } from "@/components/home/Reponse";
import { ConfigurationsGrid } from "@/components/home/ConfigurationsGrid";
import { Documentation } from "@/components/home/Documentation";
import { APropos } from "@/components/home/APropos";
import { ComparisonTable } from "@/components/home/ComparisonTable";
import { FeaturedRealisations } from "@/components/home/FeaturedRealisations";
import { ReglementationBlock } from "@/components/home/ReglementationBlock";
import { CtaContact } from "@/components/home/CtaContact";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  // En parallèle : overrides CMS + réalisations & documents marqués featured.
  // Limit 3 pour les deux (la grille de la home est dimensionnée pour 3 cartes).
  const [cms, featuredRealisations, featuredDocuments] = await Promise.all([
    getCmsOverrides("home", locale),
    prisma.realisation.findMany({
      where: { featured: true },
      orderBy: { annee: "desc" },
      take: 3,
    }),
    prisma.document.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div>
      <Hero />
      <UspCards
        eyebrow={cms.usp_eyebrow}
        titre={cms.usp_titre}
        cards={[
          { titre: cms.usp_card1_titre, description: cms.usp_card1_description, icon: cms.usp_card1_icon },
          { titre: cms.usp_card2_titre, description: cms.usp_card2_description, icon: cms.usp_card2_icon },
          { titre: cms.usp_card3_titre, description: cms.usp_card3_description, icon: cms.usp_card3_icon },
          { titre: cms.usp_card4_titre, description: cms.usp_card4_description, icon: cms.usp_card4_icon },
        ]}
      />
      <ConceptUrbaquai
        titre={cms.concept_titre}
        description={cms.concept_description}
        legende={cms.concept_legende}
        visualUrl={cms.concept_visual}
      />
      <Constat
        titre={cms.constat_titre}
        sousTitre={cms.constat_sous_titre}
        eyebrow={cms.constat_eyebrow}
        cards={[
          { titre: cms.constat_card1_titre, texte: cms.constat_card1_texte },
          { titre: cms.constat_card2_titre, texte: cms.constat_card2_texte },
          { titre: cms.constat_card3_titre, texte: cms.constat_card3_texte },
        ]}
      />
      <Reponse
        eyebrow={cms.reponse_eyebrow}
        titre={cms.reponse_titre}
        cards={[
          { titre: cms.reponse_card1_titre, texte: cms.reponse_card1_texte, icon: cms.reponse_card1_icon },
          { titre: cms.reponse_card2_titre, texte: cms.reponse_card2_texte, icon: cms.reponse_card2_icon },
          { titre: cms.reponse_card3_titre, texte: cms.reponse_card3_texte, icon: cms.reponse_card3_icon },
          { titre: cms.reponse_card4_titre, texte: cms.reponse_card4_texte, icon: cms.reponse_card4_icon },
          { titre: cms.reponse_card5_titre, texte: cms.reponse_card5_texte, icon: cms.reponse_card5_icon },
          { titre: cms.reponse_card6_titre, texte: cms.reponse_card6_texte, icon: cms.reponse_card6_icon },
        ]}
      />
      <ConfigurationsGrid
        titre={cms.configs_titre}
        sousTitre={cms.configs_sous_titre}
        imageOverrides={{
          avancee: cms.configs_image_avancee,
          avancee_velo: cms.configs_image_avancee_velo,
          ile: cms.configs_image_ile,
          ile_velo: cms.configs_image_ile_velo,
        }}
        cardOverrides={{
          avancee: {
            titre: cms.config_avancee_titre,
            sousTitre: cms.config_avancee_sous_titre,
            description: cms.config_avancee_description,
          },
          avancee_velo: {
            titre: cms.config_avancee_velo_titre,
            sousTitre: cms.config_avancee_velo_sous_titre,
            description: cms.config_avancee_velo_description,
          },
          ile: {
            titre: cms.config_ile_titre,
            sousTitre: cms.config_ile_sous_titre,
            description: cms.config_ile_description,
          },
          ile_velo: {
            titre: cms.config_ile_velo_titre,
            sousTitre: cms.config_ile_velo_sous_titre,
            description: cms.config_ile_velo_description,
          },
        }}
      />
      <ComparisonTable
        titre={cms.comparison_titre}
        sousTitre={cms.comparison_sous_titre}
        critereLabel={cms.comparison_critere_label}
        urbaquaiLabel={cms.comparison_urbaquai_label}
        urbaquaiSubLabel={cms.comparison_urbaquai_sub}
        plastiqueLabel={cms.comparison_plastique_label}
        plastiqueSubLabel={cms.comparison_plastique_sub}
        traditionnelLabel={cms.comparison_traditionnel_label}
        traditionnelSubLabel={cms.comparison_traditionnel_sub}
        rows={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => ({
          libelle: cms[`comparison_row${n}_libelle`],
          urbaquai: cms[`comparison_row${n}_urbaquai`],
          zicla: cms[`comparison_row${n}_plastique`],
          traditionnel: cms[`comparison_row${n}_traditionnel`],
        }))}
      />
      <FeaturedRealisations
        realisations={featuredRealisations}
        titre={cms.realisations_titre}
        sousTitre={cms.realisations_sous_titre}
      />
      <Documentation
        documents={featuredDocuments}
        titre={cms.documentation_titre}
      />
      <APropos
        eyebrow={cms.apropos_eyebrow}
        titre={cms.apropos_titre}
        intro={cms.apropos_intro}
        ctaPrimaryLabel={cms.apropos_cta_primaire}
        ctaSecondaryLabel={cms.apropos_cta_secondaire}
        cards={[
          { titre: cms.apropos_card1_titre, texte: cms.apropos_card1_texte, icon: cms.apropos_card1_icon },
          { titre: cms.apropos_card2_titre, texte: cms.apropos_card2_texte, icon: cms.apropos_card2_icon },
          { titre: cms.apropos_card3_titre, texte: cms.apropos_card3_texte, icon: cms.apropos_card3_icon },
          { titre: cms.apropos_card4_titre, texte: cms.apropos_card4_texte, icon: cms.apropos_card4_icon },
          { titre: cms.apropos_card5_titre, texte: cms.apropos_card5_texte, icon: cms.apropos_card5_icon },
        ]}
        logosClients={cms.apropos_logos_clients?.split("|").map((s) => s.trim()).filter(Boolean)}
      />
      <ReglementationBlock
        titre={cms.reglementation_titre}
        sousTitre={cms.reglementation_sous_titre}
        ctaLabel={cms.reglementation_cta_label}
        cards={[
          { titre: cms.reglementation_card1_titre, description: cms.reglementation_card1_description },
          { titre: cms.reglementation_card2_titre, description: cms.reglementation_card2_description },
          { titre: cms.reglementation_card3_titre, description: cms.reglementation_card3_description },
        ]}
      />
      <CtaContact
        titre={cms.cta_titre}
        description={cms.cta_description}
      />
    </div>
  );
}
