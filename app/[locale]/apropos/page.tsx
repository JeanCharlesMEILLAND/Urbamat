import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { APropos } from "@/components/home/APropos";
import { getCmsOverrides } from "@/lib/cms";

export const metadata: Metadata = {
  title: "À propos d'URBAMAT Environnement — URBAQUAI®",
  description:
    "URBAMAT Environnement, PME familiale alsacienne spécialiste de l'accessibilité des transports publics depuis le début des années 2000. Membre de la Fédération des Industries Ferroviaires (FIF) et fournisseur officiel SNCF depuis 2015.",
};

type Props = { params: Promise<{ locale: string }> };

export default async function AProposPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Réutilise les overrides du bloc "À propos" édités depuis /admin/pages → page Accueil.
  // Le client édite à un seul endroit, et la home + la page /apropos affichent le même
  // contenu (cohérent avec leur usage : c'est la même section).
  const cms = await getCmsOverrides("home", locale);

  return (
    <main>
      <APropos
        eyebrow={cms.apropos_eyebrow}
        titre={cms.apropos_titre}
        intro={cms.apropos_intro}
        ctaPrimaryLabel={cms.apropos_cta_primaire}
        ctaPrimaryUrl={cms.apropos_cta_primaire_url}
        ctaSecondaryLabel={cms.apropos_cta_secondaire}
        ctaSecondaryUrl={cms.apropos_cta_secondaire_url}
        visuelUrl={cms.apropos_visuel}
        cards={[
          { titre: cms.apropos_card1_titre, texte: cms.apropos_card1_texte, icon: cms.apropos_card1_icon },
          { titre: cms.apropos_card2_titre, texte: cms.apropos_card2_texte, icon: cms.apropos_card2_icon },
          { titre: cms.apropos_card3_titre, texte: cms.apropos_card3_texte, icon: cms.apropos_card3_icon },
          { titre: cms.apropos_card4_titre, texte: cms.apropos_card4_texte, icon: cms.apropos_card4_icon },
          { titre: cms.apropos_card5_titre, texte: cms.apropos_card5_texte, icon: cms.apropos_card5_icon },
        ]}
        logosClients={cms.apropos_logos_clients?.split("|").map((s) => s.trim()).filter(Boolean)}
      />
    </main>
  );
}
