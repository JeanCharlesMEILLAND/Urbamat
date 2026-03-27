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

export const EDITABLE_PAGES: Record<string, PageDef> = {
  home: {
    label: "Accueil",
    path: "/",
    blocks: [
      {
        id: "hero",
        label: "Hero",
        description: "Bannière principale du site",
        icon: "Sparkles",
        sections: [
          { key: "hero_titre", label: "Titre", type: "texte", placeholder: "Le quai bus accessible. En 48h." },
          { key: "hero_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Système breveté URBAMAT..." },
          { key: "hero_description", label: "Description", type: "html", placeholder: "URBAQUAI est le système modulaire..." },
          { key: "hero_cta", label: "Texte du bouton CTA", type: "texte", placeholder: "Voir le système" },
          { key: "hero_image", label: "Image de fond", type: "image" },
        ],
      },
      {
        id: "stats",
        label: "Chiffres clés",
        description: "Barre de statistiques animée",
        icon: "BarChart3",
        sections: [
          { key: "stat_1_value", label: "Chiffre 1 — Valeur", type: "texte", placeholder: "35 ans" },
          { key: "stat_1_label", label: "Chiffre 1 — Label", type: "texte", placeholder: "d'expertise béton" },
          { key: "stat_2_value", label: "Chiffre 2 — Valeur", type: "texte", placeholder: "48h" },
          { key: "stat_2_label", label: "Chiffre 2 — Label", type: "texte", placeholder: "de pose sur site" },
          { key: "stat_3_value", label: "Chiffre 3 — Valeur", type: "texte", placeholder: "200+" },
          { key: "stat_3_label", label: "Chiffre 3 — Label", type: "texte", placeholder: "quais posés en France" },
        ],
      },
      {
        id: "problem",
        label: "Problème / Solution",
        description: "Section constat + réponse URBAQUAI",
        icon: "AlertTriangle",
        sections: [
          { key: "probleme_titre", label: "Titre section", type: "texte", placeholder: "Un problème national..." },
          { key: "probleme_sous_titre", label: "Sous-titre", type: "texte", placeholder: "En France, des milliers..." },
        ],
      },
      {
        id: "configs",
        label: "Configurations",
        description: "Grille des 4 configurations",
        icon: "Grid3x3",
        sections: [
          { key: "configs_titre", label: "Titre section", type: "texte", placeholder: "4 configurations, toutes les situations" },
          { key: "configs_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Chaque arrêt de bus est unique..." },
        ],
      },
      {
        id: "comparison",
        label: "Comparaison",
        description: "Tableau comparatif URBAQUAI vs alternatives",
        icon: "Table",
        sections: [
          { key: "comparison_titre", label: "Titre", type: "texte", placeholder: "Pourquoi URBAQUAI ?" },
          { key: "comparison_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Comparaison objective..." },
        ],
      },
      {
        id: "realisations",
        label: "Réalisations en vedette",
        description: "Projets mis en avant",
        icon: "MapPin",
        sections: [
          { key: "featured_titre", label: "Titre", type: "texte", placeholder: "Ils nous font confiance" },
          { key: "featured_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Découvrez nos réalisations..." },
        ],
      },
      {
        id: "reglementation",
        label: "Bloc Réglementation",
        description: "Bloc conformité normes",
        icon: "ShieldCheck",
        sections: [
          { key: "reglement_titre", label: "Titre", type: "texte", placeholder: "100% conforme. Sans compromis." },
          { key: "reglement_sous_titre", label: "Sous-titre", type: "texte", placeholder: "URBAQUAI est conçu..." },
        ],
      },
      {
        id: "cta",
        label: "CTA Contact",
        description: "Bloc d'appel à action en bas de page",
        icon: "Send",
        sections: [
          { key: "cta_titre", label: "Titre", type: "texte", placeholder: "Un projet d'accessibilité ?" },
          { key: "cta_description", label: "Description", type: "texte", placeholder: "Parlez-nous de votre besoin..." },
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
        label: "Hero Produit",
        description: "Présentation URBAQUAI 140+50",
        icon: "Package",
        sections: [
          { key: "titre", label: "Titre", type: "texte", placeholder: "URBAQUAI 140+50" },
          { key: "sous_titre", label: "Sous-titre", type: "texte", placeholder: "Quai préfabriqué modulaire..." },
          { key: "description", label: "Description", type: "html", placeholder: "Les modules préfabriqués..." },
          { key: "hero_image", label: "Image produit principale", type: "image" },
        ],
      },
      {
        id: "specs",
        label: "Caractéristiques techniques",
        description: "Section specs et accordion",
        icon: "Settings",
        sections: [
          { key: "specs_titre", label: "Titre", type: "texte", placeholder: "Caractéristiques techniques" },
          { key: "specs_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Béton C40/50, tests CERIB..." },
        ],
      },
      {
        id: "installation",
        label: "Mise en œuvre",
        description: "Étapes d'installation",
        icon: "Wrench",
        sections: [
          { key: "installation_titre", label: "Titre", type: "texte", placeholder: "Mise en œuvre" },
          { key: "installation_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Pose directe sur enrobé..." },
        ],
      },
      {
        id: "cta",
        label: "CTA Configurations",
        description: "Appel vers la page configurations",
        icon: "ArrowRight",
        sections: [
          { key: "cta_titre", label: "Titre", type: "texte", placeholder: "Quelle configuration pour votre projet ?" },
          { key: "cta_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Avancée de trottoir, île..." },
        ],
      },
    ],
  },
  urbaterra: {
    label: "URBATERRA",
    path: "/urbaterra",
    blocks: [
      {
        id: "hero",
        label: "Hero URBATERRA",
        description: "Présentation terrasse modulaire",
        icon: "UtensilsCrossed",
        sections: [
          { key: "titre", label: "Titre", type: "texte", placeholder: "Gagnez 9 à 18 m² de terrasse. En 48h." },
          { key: "description", label: "Description", type: "html", placeholder: "URBATERRA® est une extension..." },
          { key: "hero_image", label: "Image produit", type: "image" },
        ],
      },
      {
        id: "cibles",
        label: "Pour qui ?",
        description: "Cibles : restaurateurs, mairies, gestionnaires",
        icon: "Users",
        sections: [
          { key: "cibles_titre", label: "Titre", type: "texte", placeholder: "Pour qui ?" },
          { key: "cibles_sous_titre", label: "Sous-titre", type: "texte", placeholder: "URBATERRA s'adresse à tous..." },
        ],
      },
      {
        id: "cta",
        label: "CTA Terrasse",
        description: "Appel à action",
        icon: "Send",
        sections: [
          { key: "cta_titre", label: "Titre", type: "texte", placeholder: "Prêt à agrandir votre terrasse ?" },
          { key: "cta_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Contactez-nous pour une étude..." },
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
  realisations: {
    label: "Réalisations",
    path: "/realisations",
    blocks: [
      {
        id: "hero",
        label: "En-tête Réalisations",
        description: "Titre et description",
        icon: "MapPin",
        sections: [
          { key: "titre", label: "Titre", type: "texte", placeholder: "Nos réalisations" },
          { key: "sous_titre", label: "Sous-titre", type: "texte", placeholder: "Quais modulaires URBAQUAI..." },
        ],
      },
    ],
  },
  reglementation: {
    label: "Réglementation",
    path: "/reglementation",
    blocks: [
      {
        id: "hero",
        label: "En-tête Réglementation",
        description: "Titre et description",
        icon: "Scale",
        sections: [
          { key: "titre", label: "Titre", type: "texte", placeholder: "Cadre réglementaire" },
          { key: "sous_titre", label: "Sous-titre", type: "texte", placeholder: "L'accessibilité des arrêts..." },
          { key: "introduction", label: "Introduction", type: "html" },
        ],
      },
      {
        id: "cta",
        label: "CTA Conformité",
        description: "Appel à action en bas de page",
        icon: "Send",
        sections: [
          { key: "cta_titre", label: "Titre", type: "texte", placeholder: "Un doute sur la conformité ?" },
          { key: "cta_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Notre équipe technique..." },
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
  configurateur: {
    label: "Configurateur",
    path: "/configurateur",
    blocks: [
      {
        id: "hero",
        label: "En-tête Configurateur",
        description: "Titre et description",
        icon: "Settings",
        sections: [
          { key: "titre", label: "Titre", type: "texte", placeholder: "Configurateur URBAQUAI" },
          { key: "sous_titre", label: "Sous-titre", type: "texte", placeholder: "Construisez votre quai..." },
        ],
      },
    ],
  },
};
