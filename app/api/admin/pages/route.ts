import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { EDITABLE_PAGES } from "@/lib/content";

/** Mapping section.key (admin CMS) → chemin dans les fichiers messages/{locale}.json
 *  (ex. "hero_titre" → "hero.titre"). Permet de retrouver le texte par défaut
 *  pour la locale active dans l'admin. */
const I18N_KEY_MAP: Record<string, string> = {
  // Hero
  hero_titre: "hero.titre",
  hero_sous_titre: "hero.sousTitre",
  hero_description: "hero.description",
  // USP cards (4 atouts)
  usp_card1_titre: "usp.miseEnOeuvre.title",
  usp_card2_titre: "usp.poseDirecte.title",
  usp_card3_titre: "usp.logistique.title",
  usp_card4_titre: "usp.accessibilite.title",
  // Concept (sur la home)
  concept_titre: "concept.titre",
  concept_description: "concept.description",
  concept_legende: "concept.visuelLegende",
  // Constat (problèmes)
  constat_titre: "problemSolution.titre",
  constat_sous_titre: "problemSolution.sousTitre",
  constat_eyebrow: "problemSolution.constat",
  constat_card1_titre: "problemSolution.problems.inaccessibles.title",
  constat_card1_texte: "problemSolution.problems.inaccessibles.text",
  constat_card2_titre: "problemSolution.problems.travaux.title",
  constat_card2_texte: "problemSolution.problems.travaux.text",
  constat_card3_titre: "problemSolution.problems.perturbation.title",
  constat_card3_texte: "problemSolution.problems.perturbation.text",
  // Réponse (solutions)
  reponse_eyebrow: "problemSolution.reponse",
  reponse_titre: "problemSolution.reponseTitre",
  reponse_card1_titre: "problemSolution.solutions.accessibilite.title",
  reponse_card1_texte: "problemSolution.solutions.accessibilite.text",
  reponse_card2_titre: "problemSolution.solutions.pose48h.title",
  reponse_card2_texte: "problemSolution.solutions.pose48h.text",
  reponse_card3_titre: "problemSolution.solutions.modulaire.title",
  reponse_card3_texte: "problemSolution.solutions.modulaire.text",
  reponse_card4_titre: "problemSolution.solutions.hydraulique.title",
  reponse_card4_texte: "problemSolution.solutions.hydraulique.text",
  reponse_card5_titre: "problemSolution.solutions.albedo.title",
  reponse_card5_texte: "problemSolution.solutions.albedo.text",
  reponse_card6_titre: "problemSolution.solutions.certifie.title",
  reponse_card6_texte: "problemSolution.solutions.certifie.text",
  // Configurations (section + 4 cartes)
  configs_titre: "configurationsGrid.titre",
  configs_sous_titre: "configurationsGrid.sousTitre",
  config_avancee_titre: "configurations.avancee.titre",
  config_avancee_sous_titre: "configurations.avancee.sousTitre",
  config_avancee_description: "configurations.avancee.description",
  config_avancee_velo_titre: "configurations.avancee_velo.titre",
  config_avancee_velo_sous_titre: "configurations.avancee_velo.sousTitre",
  config_avancee_velo_description: "configurations.avancee_velo.description",
  config_ile_titre: "configurations.ile.titre",
  config_ile_sous_titre: "configurations.ile.sousTitre",
  config_ile_description: "configurations.ile.description",
  config_ile_velo_titre: "configurations.ile_velo.titre",
  config_ile_velo_sous_titre: "configurations.ile_velo.sousTitre",
  config_ile_velo_description: "configurations.ile_velo.description",
  // Comparaison (en-têtes + valeurs)
  comparison_titre: "comparison.titre",
  comparison_sous_titre: "comparison.sousTitre",
  comparison_critere_label: "comparison.critere",
  comparison_urbaquai_label: "comparison.urbaquai",
  comparison_urbaquai_sub: "comparison.urbaquaiSub",
  comparison_plastique_label: "comparison.plastique",
  comparison_plastique_sub: "comparison.plastiqueSub",
  comparison_traditionnel_label: "comparison.traditionnel",
  comparison_traditionnel_sub: "comparison.traditionnelSub",
  // Comparaison — libellés des 11 lignes (1=perennite … 11=delai)
  comparison_row1_libelle: "comparison.rows.perennite",
  comparison_row2_libelle: "comparison.rows.gelDegel",
  comparison_row3_libelle: "comparison.rows.stabilite",
  comparison_row4_libelle: "comparison.rows.antiderapante",
  comparison_row5_libelle: "comparison.rows.reemploi",
  comparison_row6_libelle: "comparison.rows.certification",
  comparison_row7_libelle: "comparison.rows.poseSol",
  comparison_row8_libelle: "comparison.rows.hydraulique",
  comparison_row9_libelle: "comparison.rows.albedo",
  comparison_row10_libelle: "comparison.rows.impact",
  comparison_row11_libelle: "comparison.rows.delai",
  // Réalisations (titre + sous-titre + libellés CTA)
  realisations_titre: "featuredRealisations.titre",
  realisations_sous_titre: "featuredRealisations.sousTitre",
  // Documentation
  documentation_titre: "documentation.titre",
  // À propos (home)
  apropos_titre: "apropos.titre",
  apropos_intro: "apropos.description",
  apropos_cta_secondaire: "apropos.cta",
  // Réglementation (titre + sous-titre + 3 cartes + CTA)
  reglementation_titre: "reglementationBlock.titre",
  reglementation_sous_titre: "reglementationBlock.sousTitre",
  reglementation_cta_label: "reglementationBlock.explorer",
  reglementation_card1_titre: "reglementationBlock.loi2005.titre",
  reglementation_card1_description: "reglementationBlock.loi2005.description",
  reglementation_card2_titre: "reglementationBlock.cerema.titre",
  reglementation_card2_description: "reglementationBlock.cerema.description",
  reglementation_card3_titre: "reglementationBlock.norme.titre",
  reglementation_card3_description: "reglementationBlock.norme.description",
  // CTA Contact
  cta_titre: "ctaContact.titre",
  cta_description: "ctaContact.sousTitre",
  // Contact page
  prescripteur_titre: "contact.prescripteur.titre",
  prescripteur_texte: "contact.prescripteur.texte",
  prescripteur_cta_label: "contact.accesTelechargements",
  contact_telephone_label: "contact.telephone",
  contact_email_label: "contact.emailLabel",
  contact_adresse_label: "contact.adresse",
  contact_horaires_label: "contact.horaires",
  contact_horaires: "contact.horairesValue",
  contact_formulaire_titre: "contact.formulaire",
  contact_coordonnees_titre: "contact.coordonnees",
  // Téléchargements
  documents_disponibles: "telechargements.documentsDisponibles",
  acces_documents: "telechargements.accesDocuments",
  acces_debloque: "telechargements.accesDebloque",
  cliquez_telecharger: "telechargements.cliquezTelecharger",
  remplissez_formulaire: "telechargements.remplissezFormulaire",
  // Layout
  navbar_concept: "nav.concept",
  navbar_produit: "nav.produit",
  navbar_configurateur: "nav.configurateur",
  navbar_apropos: "nav.apropos",
  navbar_telechargements: "nav.telechargements",
  navbar_contact: "nav.contact",
  navbar_devis_cta: "nav.devis",
  footer_description: "footer.description",
};

function resolvePath(obj: unknown, path: string): string {
  return path.split(".").reduce<unknown>(
    (acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined),
    obj
  ) as string;
}

// GET — Liste tous les contenus éditables (+ defaults i18n pour la locale)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const locale = req.nextUrl.searchParams.get("locale") || "fr";

  const [contents, messages] = await Promise.all([
    prisma.pageContent.findMany({
      where: { locale },
      orderBy: [{ page: "asc" }, { ordre: "asc" }],
    }),
    import(`@/messages/${locale}.json`)
      .then((m) => m.default ?? m)
      .catch(() => ({})),
  ]);

  // Résout les valeurs par défaut depuis les messages/{locale}.json pour chaque
  // section connue (par mapping I18N_KEY_MAP). Le client utilise ces défauts pour
  // pré-remplir les inputs même quand aucune valeur CMS n'existe.
  const defaults: Record<string, string> = {};
  for (const sectionKey of Object.keys(I18N_KEY_MAP)) {
    const value = resolvePath(messages, I18N_KEY_MAP[sectionKey]);
    if (typeof value === "string" && value.length) {
      defaults[sectionKey] = value;
    }
  }

  return NextResponse.json({ pages: EDITABLE_PAGES, contents, defaults });
}

// PUT — Met à jour un ou plusieurs contenus
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { updates, locale = "fr" } = body as {
    updates: { page: string; section: string; contenu: string; type?: string }[];
    locale?: string;
  };

  if (!updates || !Array.isArray(updates)) {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 });
  }

  const results = [];
  for (const u of updates) {
    const result = await prisma.pageContent.upsert({
      where: {
        page_section_locale: { page: u.page, section: u.section, locale },
      },
      update: { contenu: u.contenu },
      create: {
        page: u.page,
        section: u.section,
        locale,
        contenu: u.contenu,
        type: (u.type as any) || "texte",
      },
    });
    results.push(result);
  }

  return NextResponse.json({ ok: true, count: results.length });
}
