import { prisma } from "./prisma";

// ─── Types ─────────────────────────────────────────────────────

export type FieldType = "texte" | "html" | "image";

export interface SectionDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
}

export interface BlockDef {
  id: string;
  label: string;
  description: string;
  icon: string; // lucide icon name
  sections: SectionDef[];
}

export interface PageDef {
  label: string;
  path: string;
  blocks: BlockDef[];
}

// ─── Fetch helpers ─────────────────────────────────────────────

/**
 * Récupère un contenu éditable avec fallback.
 */
export async function getContent(
  page: string,
  section: string,
  fallback: string,
  locale: string = "fr"
): Promise<string> {
  try {
    const row = await prisma.pageContent.findUnique({
      where: { page_section_locale: { page, section, locale } },
    });
    return row?.contenu || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Récupère tous les contenus d'une page pour une locale.
 */
export async function getPageContents(
  page: string,
  defaults: Record<string, string>,
  locale: string = "fr"
): Promise<Record<string, string>> {
  try {
    const rows = await prisma.pageContent.findMany({
      where: { page, locale },
    });
    const result = { ...defaults };
    for (const row of rows) {
      if (row.contenu) result[row.section] = row.contenu;
    }
    return result;
  } catch {
    return defaults;
  }
}

// ─── Editable pages / blocks definition ────────────────────────
// Convention : seuls les champs RÉELLEMENT branchés aux composants sont listés ici.
// Si tu ajoutes un champ, ajoute aussi son `getCmsOverrides()` dans le composant cible.
// L'ORDRE de cet objet est l'ordre d'affichage dans la sidebar admin — il calque
// sur l'ordre de la navbar du site (concept est sur la home, donc Accueil en 1er ;
// configurateur est exclu car il n'a pas de contenu CMS).

export const EDITABLE_PAGES: Record<string, PageDef> = {
  home: {
    label: "Accueil",
    path: "/",
    blocks: [
      {
        id: "hero",
        label: "Hero (haut de page)",
        description: "Logo URBAQUAI + titre + description en haut de la home",
        icon: "Sparkles",
        sections: [
          { key: "hero_titre", label: "Titre principal", type: "texte", placeholder: "Garantir l'accessibilité aux bus et aux cars." },
          { key: "hero_sous_titre", label: "Sous-titre / eyebrow", type: "texte", placeholder: "Innovation protégée par dépôt de brevet — URBAMAT Environnement" },
          { key: "hero_description", label: "Paragraphe de description", type: "html", placeholder: "Pour favoriser des transports publics plus attractifs et une mobilité urbaine mieux partagée, l'accessibilité des arrêts de bus et de cars est devenue un enjeu majeur pour les collectivités." },
          { key: "hero_logo", label: "Logo URBAQUAI affiché en haut du hero", type: "image", placeholder: "/images/logo-urbaquai.png" },
        ],
      },
      {
        id: "concept",
        label: "Concept URBAQUAI",
        description: "Section avec animation 3D du quai + stats + sélecteur coloris",
        icon: "Sparkles",
        sections: [
          { key: "concept_titre", label: "Titre", type: "texte", placeholder: "Concept URBAQUAI" },
          { key: "concept_description", label: "Description", type: "html", placeholder: "URBAQUAI est un système modulaire de quais bus en béton préfabriqué haute performance pour la mise en accessibilité des arrêts de bus." },
          { key: "concept_legende", label: "Légende sous l'animation", type: "texte", placeholder: "Module URBAQUAI — béton préfabriqué haute performance" },
          { key: "concept_visual", label: "Visuel à la place de l'animation 3D (image OU vidéo .mp4/.webm)", type: "image" },
        ],
      },
      {
        id: "configs",
        label: "4 configurations URBAQUAI",
        description: "Section avec les 4 cartes : chaque carte a son visuel + titre + sous-titre + description, modifiable indépendamment.",
        icon: "Grid3x3",
        sections: [
          { key: "configs_titre", label: "Titre de la section", type: "texte", placeholder: "4 configurations, toutes les situations" },
          { key: "configs_sous_titre", label: "Sous-titre de la section", type: "texte", placeholder: "Chaque arrêt de bus est unique…" },
          // ── Carte 1 : Avancée de trottoir ───────────────────────
          { key: "config_avancee_titre", label: "1. Avancée — Titre", type: "texte", placeholder: "Avancée de trottoir" },
          { key: "config_avancee_sous_titre", label: "1. Avancée — Sous-titre", type: "texte", placeholder: "Boarding bulb" },
          { key: "config_avancee_description", label: "1. Avancée — Description", type: "html", placeholder: "Extension du trottoir au niveau de l'arrêt de bus, permettant un accostage optimal du véhicule et un accès de plain-pied pour les PMR." },
          { key: "configs_image_avancee", label: "1. Avancée — Image (laisse vide pour le schéma SVG par défaut)", type: "image", placeholder: "/api/images/configs/avancee" },
          // ── Carte 2 : Avancée + vélo ────────────────────────────
          { key: "config_avancee_velo_titre", label: "2. Avancée + vélo — Titre", type: "texte", placeholder: "Avancée avec piste cyclable" },
          { key: "config_avancee_velo_sous_titre", label: "2. Avancée + vélo — Sous-titre", type: "texte", placeholder: "Boarding bulb + cycle lane" },
          { key: "config_avancee_velo_description", label: "2. Avancée + vélo — Description", type: "html", placeholder: "Configuration avancée intégrant une piste cyclable sécurisée à l'arrière du quai, permettant la cohabitation bus-vélo." },
          { key: "configs_image_avancee_velo", label: "2. Avancée + vélo — Image", type: "image", placeholder: "/api/images/configs/avancee_velo" },
          // ── Carte 3 : Île ───────────────────────────────────────
          { key: "config_ile_titre", label: "3. Île — Titre", type: "texte", placeholder: "Configuration en île" },
          { key: "config_ile_sous_titre", label: "3. Île — Sous-titre", type: "texte", placeholder: "Island platform" },
          { key: "config_ile_description", label: "3. Île — Description", type: "html", placeholder: "Quai central isolé de la circulation, desservant une ou deux directions. Idéal pour les couloirs bus et BHNS." },
          { key: "configs_image_ile", label: "3. Île — Image", type: "image", placeholder: "/api/images/configs/ile" },
          // ── Carte 4 : Île + vélo ────────────────────────────────
          { key: "config_ile_velo_titre", label: "4. Île + vélo — Titre", type: "texte", placeholder: "Île avec piste cyclable" },
          { key: "config_ile_velo_sous_titre", label: "4. Île + vélo — Sous-titre", type: "texte", placeholder: "Island platform + cycle lane" },
          { key: "config_ile_velo_description", label: "4. Île + vélo — Description", type: "html", placeholder: "Configuration en île avec intégration d'une piste cyclable, assurant la continuité des itinéraires vélo à travers l'arrêt." },
          { key: "configs_image_ile_velo", label: "4. Île + vélo — Image", type: "image", placeholder: "/api/images/configs/ile_velo" },
        ],
      },
      {
        id: "usp",
        label: "4 atouts (cartes USP, sous le hero)",
        description: "Bandeau « Système breveté URBAMAT Environnement » — eyebrow + titre + 4 cartes (titre + description + nom d'icône Lucide).",
        icon: "Sparkles",
        sections: [
          { key: "usp_eyebrow", label: "Surtitre / eyebrow", type: "texte", placeholder: "Système breveté URBAMAT Environnement" },
          { key: "usp_titre", label: "Titre principal de la section", type: "texte", placeholder: "4 atouts qui changent la donne" },
          // Carte 1
          { key: "usp_card1_titre", label: "Carte 1 — Titre", type: "texte", placeholder: "Mise en œuvre et mise en service rapides" },
          { key: "usp_card1_description", label: "Carte 1 — Description", type: "texte", placeholder: "Pose en 24 h, mise en service immédiate, sans coulage de béton sur site." },
          { key: "usp_card1_icon", label: "Carte 1 — Icône Lucide (ex: Zap, Truck, Layers, ShieldCheck, Recycle, Accessibility)", type: "texte", placeholder: "Zap" },
          // Carte 2
          { key: "usp_card2_titre", label: "Carte 2 — Titre", type: "texte", placeholder: "Pose directe sur tout type de support" },
          { key: "usp_card2_description", label: "Carte 2 — Description", type: "texte", placeholder: "Compatible chaussée souple ou rigide, sans préparation lourde du sol." },
          { key: "usp_card2_icon", label: "Carte 2 — Icône Lucide", type: "texte", placeholder: "Layers" },
          // Carte 3
          { key: "usp_card3_titre", label: "Carte 3 — Titre", type: "texte", placeholder: "Logistique et réemploi simplifiés" },
          { key: "usp_card3_description", label: "Carte 3 — Description", type: "texte", placeholder: "Modules réutilisables, démontables, transportables sans engins lourds." },
          { key: "usp_card3_icon", label: "Carte 3 — Icône Lucide", type: "texte", placeholder: "Recycle" },
          // Carte 4
          { key: "usp_card4_titre", label: "Carte 4 — Titre", type: "texte", placeholder: "Accessibilité PMR et sécurité d'usage" },
          { key: "usp_card4_description", label: "Carte 4 — Description", type: "texte", placeholder: "Hauteur d'accostage normée, surface antidérapante, conformité PMR." },
          { key: "usp_card4_icon", label: "Carte 4 — Icône Lucide", type: "texte", placeholder: "Accessibility" },
        ],
      },
      {
        id: "realisations",
        label: "Réalisations (« Ils nous font confiance »)",
        description: "Titre + sous-titre. Les 3 cartes affichées proviennent de la BDD : va dans /admin/realisations et clique sur l'étoile ★ des réalisations à mettre en avant (3 max).",
        icon: "MapPin",
        sections: [
          { key: "realisations_titre", label: "Titre", type: "texte", placeholder: "Ils nous font confiance" },
          { key: "realisations_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Découvrez nos réalisations à travers la France." },
        ],
      },
      {
        id: "documentation",
        label: "Documentation (« Télécharger notre documentation »)",
        description: "Titre uniquement. Les documents listés viennent de la BDD : va dans /admin/documents et clique sur l'étoile ★ des documents à afficher (3 max).",
        icon: "Download",
        sections: [
          { key: "documentation_titre", label: "Titre", type: "texte", placeholder: "Télécharger notre documentation" },
        ],
      },
      {
        id: "apropos",
        label: "À propos d'URBAMAT (section home)",
        description: "Bloc À propos avec les 5 sous-sections (expertise, niveau d'exigence, etc.)",
        icon: "Users",
        sections: [
          { key: "apropos_titre", label: "Titre", type: "texte", placeholder: "À propos d'URBAMAT" },
          { key: "apropos_intro", label: "Introduction", type: "html", placeholder: "URBAMAT est une entreprise…" },
        ],
      },
      {
        id: "cta",
        label: "CTA Contact (bas de page)",
        description: "Bloc d'appel à action avec formulaire en bas de la home",
        icon: "Send",
        sections: [
          { key: "cta_titre", label: "Titre", type: "texte", placeholder: "Un projet d'accessibilité ?" },
          { key: "cta_description", label: "Description", type: "texte", placeholder: "Parlez-nous de votre besoin…" },
        ],
      },
    ],
  },
  produit: {
    label: "Produit URBAQUAI",
    path: "/produit",
    blocks: [
      {
        id: "hero",
        label: "Hero Produit (à câbler)",
        description: "Titre, sous-titre, image éclatée. Champs prêts pour activation.",
        icon: "Package",
        sections: [
          { key: "titre", label: "Titre", type: "texte", placeholder: "URBAQUAI" },
          { key: "sous_titre", label: "Sous-titre", type: "texte", placeholder: "Quai bus provisoire — solution durable" },
          { key: "hero_image", label: "Image hero (vue éclatée)", type: "image" },
        ],
      },
    ],
  },
  apropos: {
    label: "À propos",
    path: "/apropos",
    blocks: [
      {
        id: "hero",
        label: "En-tête À propos",
        description: "Titre et description de la page",
        icon: "Users",
        sections: [
          { key: "titre", label: "Titre", type: "texte", placeholder: "À propos d'URBAMAT" },
          { key: "sous_titre", label: "Sous-titre", type: "texte", placeholder: "35 ans d'expertise béton…" },
        ],
      },
    ],
  },
  telechargements: {
    label: "Téléchargements",
    path: "/telechargements",
    blocks: [
      {
        id: "hero",
        label: "En-tête Téléchargements",
        description: "Titre et description",
        icon: "Download",
        sections: [
          { key: "titre", label: "Titre", type: "texte", placeholder: "Téléchargements" },
          { key: "sous_titre", label: "Sous-titre", type: "texte", placeholder: "Accédez à toute la documentation..." },
        ],
      },
    ],
  },
  contact: {
    label: "Contact",
    path: "/contact",
    blocks: [
      {
        id: "hero",
        label: "En-tête Contact",
        description: "Titre et accroche",
        icon: "Mail",
        sections: [
          { key: "titre", label: "Titre", type: "texte", placeholder: "Parlons de votre projet" },
          { key: "sous_titre", label: "Sous-titre", type: "texte", placeholder: "Décrivez-nous votre besoin..." },
        ],
      },
      {
        id: "prescripteur",
        label: "Encadré prescripteur",
        description: "Bloc latéral CCTP/DWG",
        icon: "FileText",
        sections: [
          { key: "prescripteur_titre", label: "Titre", type: "texte", placeholder: "Vous êtes prescripteur ?" },
          { key: "prescripteur_texte", label: "Texte", type: "html", placeholder: "Nous fournissons gratuitement..." },
        ],
      },
    ],
  },
  layout: {
    label: "Mise en page (navbar + footer)",
    path: "/",
    blocks: [
      {
        id: "navbar",
        label: "Barre de navigation",
        description: "Logo URBAMAT, libellés des liens, bouton « Devis »",
        icon: "Settings",
        sections: [
          { key: "navbar_logo", label: "Logo affiché dans la barre de navigation", type: "image", placeholder: "/images/logo-urbamat.svg" },
          { key: "navbar_concept", label: "Lien 1 — Libellé Concept", type: "texte", placeholder: "Concept" },
          { key: "navbar_produit", label: "Lien 2 — Libellé Produit", type: "texte", placeholder: "Produit" },
          { key: "navbar_configurateur", label: "Lien 3 — Libellé Configurateur", type: "texte", placeholder: "Configurateur" },
          { key: "navbar_apropos", label: "Lien 4 — Libellé À propos", type: "texte", placeholder: "À propos" },
          { key: "navbar_telechargements", label: "Lien 5 — Libellé Téléchargements", type: "texte", placeholder: "Téléchargements" },
          { key: "navbar_contact", label: "Lien 6 — Libellé Contact", type: "texte", placeholder: "Contact" },
          { key: "navbar_devis_cta", label: "Texte du bouton « Devis » (à droite)", type: "texte", placeholder: "Demander un devis" },
          { key: "navbar_devis_url", label: "URL de redirection du bouton « Devis »", type: "texte", placeholder: "/contact" },
          { key: "navbar_lang_fr", label: "Sélecteur langue — Libellé français", type: "texte", placeholder: "Français" },
          { key: "navbar_lang_en", label: "Sélecteur langue — Libellé anglais", type: "texte", placeholder: "English" },
          { key: "navbar_lang_de", label: "Sélecteur langue — Libellé allemand", type: "texte", placeholder: "Deutsch" },
        ],
      },
      {
        id: "footer",
        label: "Pied de page",
        description: "Logo, description, mentions légales en bas du site",
        icon: "FileText",
        sections: [
          { key: "footer_description", label: "Phrase de description (sous le logo)", type: "html", placeholder: "URBAQUAI® — Quai bus modulaire en béton…" },
        ],
      },
    ],
  },
};
// NOTE — pages ABSENTES intentionnellement :
//   - /configurateur : utilise uniquement next-intl (pas de CMS)
//   - /realisations & /reglementation : pages internes pas dans le menu navbar
//   - /urbaterra : page retirée du site
