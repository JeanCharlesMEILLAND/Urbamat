import { prisma } from "./prisma";

// ─── Types ─────────────────────────────────────────────────────

export type FieldType = "texte" | "html" | "image" | "icon";

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
          { key: "usp_card1_icon", label: "Carte 1 — Icône", type: "icon", placeholder: "Zap" },
          // Carte 2
          { key: "usp_card2_titre", label: "Carte 2 — Titre", type: "texte", placeholder: "Pose directe sur tout type de support" },
          { key: "usp_card2_description", label: "Carte 2 — Description", type: "texte", placeholder: "Compatible chaussée souple ou rigide, sans préparation lourde du sol." },
          { key: "usp_card2_icon", label: "Carte 2 — Icône", type: "icon", placeholder: "Layers" },
          // Carte 3
          { key: "usp_card3_titre", label: "Carte 3 — Titre", type: "texte", placeholder: "Logistique et réemploi simplifiés" },
          { key: "usp_card3_description", label: "Carte 3 — Description", type: "texte", placeholder: "Modules réutilisables, démontables, transportables sans engins lourds." },
          { key: "usp_card3_icon", label: "Carte 3 — Icône", type: "icon", placeholder: "Recycle" },
          // Carte 4
          { key: "usp_card4_titre", label: "Carte 4 — Titre", type: "texte", placeholder: "Accessibilité PMR et sécurité d'usage" },
          { key: "usp_card4_description", label: "Carte 4 — Description", type: "texte", placeholder: "Hauteur d'accostage normée, surface antidérapante, conformité PMR." },
          { key: "usp_card4_icon", label: "Carte 4 — Icône", type: "icon", placeholder: "Accessibility" },
        ],
      },
      {
        id: "constat",
        label: "Le constat (3 problèmes)",
        description: "Section blanche entre Concept et Réponse — 3 cartes problèmes en gris.",
        icon: "AlertTriangle",
        sections: [
          { key: "constat_titre", label: "Titre", type: "texte", placeholder: "Une accessibilité encore loin d'être atteinte" },
          { key: "constat_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Malgré la loi de 2005, des milliers d'arrêts de bus restent inaccessibles." },
          { key: "constat_eyebrow", label: "Eyebrow (« Le constat »)", type: "texte", placeholder: "Le constat" },
          // 3 cartes
          { key: "constat_card1_titre", label: "Carte 1 — Titre", type: "texte", placeholder: "Des arrêts inaccessibles" },
          { key: "constat_card1_texte", label: "Carte 1 — Texte", type: "texte", placeholder: "Trottoir trop bas, manque d'élément d'accostage…" },
          { key: "constat_card2_titre", label: "Carte 2 — Titre", type: "texte", placeholder: "Travaux complexes & longs" },
          { key: "constat_card2_texte", label: "Carte 2 — Texte", type: "texte", placeholder: "Coulage de béton sur place, séchage, signalisation…" },
          { key: "constat_card3_titre", label: "Carte 3 — Titre", type: "texte", placeholder: "Perturbation du réseau" },
          { key: "constat_card3_texte", label: "Carte 3 — Texte", type: "texte", placeholder: "Lignes de bus déviées, arrêts hors service…" },
        ],
      },
      {
        id: "reponse",
        label: "La réponse URBAQUAI (6 atouts)",
        description: "Bandeau gris avec eyebrow + titre + 6 cartes solutions (titre + texte + icône Lucide).",
        icon: "ShieldCheck",
        sections: [
          { key: "reponse_eyebrow", label: "Eyebrow (« La réponse URBAQUAI »)", type: "texte", placeholder: "La réponse URBAQUAI" },
          { key: "reponse_titre", label: "Titre principal", type: "texte", placeholder: "Une solution complète, durable et déployable" },
          // 6 cartes
          { key: "reponse_card1_titre", label: "Carte 1 — Titre", type: "texte", placeholder: "Accessibilité PMR" },
          { key: "reponse_card1_texte", label: "Carte 1 — Texte", type: "texte", placeholder: "Hauteur d'accostage normée 21 cm…" },
          { key: "reponse_card1_icon", label: "Carte 1 — Icône", type: "icon", placeholder: "Accessibility" },
          { key: "reponse_card2_titre", label: "Carte 2 — Titre", type: "texte", placeholder: "Pose en 48h" },
          { key: "reponse_card2_texte", label: "Carte 2 — Texte", type: "texte", placeholder: "Modules préfabriqués, pose à sec…" },
          { key: "reponse_card2_icon", label: "Carte 2 — Icône", type: "icon", placeholder: "Zap" },
          { key: "reponse_card3_titre", label: "Carte 3 — Titre", type: "texte", placeholder: "Modulaire & démontable" },
          { key: "reponse_card3_texte", label: "Carte 3 — Texte", type: "texte", placeholder: "Réutilisable, transportable, adaptable…" },
          { key: "reponse_card3_icon", label: "Carte 3 — Icône", type: "icon", placeholder: "Wrench" },
          { key: "reponse_card4_titre", label: "Carte 4 — Titre", type: "texte", placeholder: "Transparence hydraulique" },
          { key: "reponse_card4_texte", label: "Carte 4 — Texte", type: "texte", placeholder: "Permet l'écoulement des eaux pluviales…" },
          { key: "reponse_card4_icon", label: "Carte 4 — Icône", type: "icon", placeholder: "Droplets" },
          { key: "reponse_card5_titre", label: "Carte 5 — Titre", type: "texte", placeholder: "Albédo élevé" },
          { key: "reponse_card5_texte", label: "Carte 5 — Texte", type: "texte", placeholder: "Surface claire, confort thermique…" },
          { key: "reponse_card5_icon", label: "Carte 5 — Icône", type: "icon", placeholder: "Sun" },
          { key: "reponse_card6_titre", label: "Carte 6 — Titre", type: "texte", placeholder: "Certifié CERIB" },
          { key: "reponse_card6_texte", label: "Carte 6 — Texte", type: "texte", placeholder: "Béton C40/50 XF4 conforme aux normes…" },
          { key: "reponse_card6_icon", label: "Carte 6 — Icône", type: "icon", placeholder: "BadgeCheck" },
        ],
      },
      {
        id: "comparison",
        label: "Tableau comparatif (Pourquoi URBAQUAI ?)",
        description: "Tableau de 11 critères × 3 colonnes (URBAQUAI / Plastique / Traditionnel). Pour les cellules : tape `yes`, `no` ou `partial` pour avoir les icônes ✓ ✗ — sinon le texte tel quel.",
        icon: "Table",
        sections: [
          { key: "comparison_titre", label: "Titre", type: "texte", placeholder: "Pourquoi URBAQUAI ?" },
          { key: "comparison_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Comparaison objective avec les solutions plastiques modulaires…" },
          { key: "comparison_critere_label", label: "En-tête colonne 1 (« Critère »)", type: "texte", placeholder: "Critère" },
          { key: "comparison_urbaquai_label", label: "En-tête colonne 2 (URBAQUAI)", type: "texte", placeholder: "URBAQUAI®" },
          { key: "comparison_urbaquai_sub", label: "Colonne 2 — Sous-libellé", type: "texte", placeholder: "Béton modulaire C40/50" },
          { key: "comparison_plastique_label", label: "En-tête colonne 3 (Plastique)", type: "texte", placeholder: "Plastique modulaire" },
          { key: "comparison_plastique_sub", label: "Colonne 3 — Sous-libellé", type: "texte", placeholder: "Ex: Zicla Vectorial" },
          { key: "comparison_traditionnel_label", label: "En-tête colonne 4 (Traditionnel)", type: "texte", placeholder: "Béton coulé" },
          { key: "comparison_traditionnel_sub", label: "Colonne 4 — Sous-libellé", type: "texte", placeholder: "Solution traditionnelle" },
          // 11 lignes × {libellé, urbaquai, plastique, traditionnel}
          { key: "comparison_row1_libelle", label: "Ligne 1 — Libellé", type: "texte", placeholder: "Pérennité" },
          { key: "comparison_row1_urbaquai", label: "Ligne 1 — Cellule URBAQUAI", type: "texte", placeholder: "50+ ans" },
          { key: "comparison_row1_plastique", label: "Ligne 1 — Cellule Plastique", type: "texte", placeholder: "10-15 ans" },
          { key: "comparison_row1_traditionnel", label: "Ligne 1 — Cellule Traditionnel", type: "texte", placeholder: "30-50 ans" },
          { key: "comparison_row2_libelle", label: "Ligne 2 — Libellé", type: "texte", placeholder: "Résistance gel/dégel" },
          { key: "comparison_row2_urbaquai", label: "Ligne 2 — Cellule URBAQUAI", type: "texte", placeholder: "< 0.3 kg/m² (XF4)" },
          { key: "comparison_row2_plastique", label: "Ligne 2 — Cellule Plastique", type: "texte", placeholder: "partial" },
          { key: "comparison_row2_traditionnel", label: "Ligne 2 — Cellule Traditionnel", type: "texte", placeholder: "Variable" },
          { key: "comparison_row3_libelle", label: "Ligne 3 — Libellé", type: "texte", placeholder: "Stabilité (poids)" },
          { key: "comparison_row3_urbaquai", label: "Ligne 3 — Cellule URBAQUAI", type: "texte", placeholder: "1 400 kg/module" },
          { key: "comparison_row3_plastique", label: "Ligne 3 — Cellule Plastique", type: "texte", placeholder: "~50 kg/module" },
          { key: "comparison_row3_traditionnel", label: "Ligne 3 — Cellule Traditionnel", type: "texte", placeholder: "Massif" },
          { key: "comparison_row4_libelle", label: "Ligne 4 — Libellé", type: "texte", placeholder: "Finition antidérapante" },
          { key: "comparison_row4_urbaquai", label: "Ligne 4 — Cellule URBAQUAI", type: "texte", placeholder: "Sablé B24, SRT ≥ 78" },
          { key: "comparison_row4_plastique", label: "Ligne 4 — Cellule Plastique", type: "texte", placeholder: "Surface plastique" },
          { key: "comparison_row4_traditionnel", label: "Ligne 4 — Cellule Traditionnel", type: "texte", placeholder: "Variable" },
          { key: "comparison_row5_libelle", label: "Ligne 5 — Libellé", type: "texte", placeholder: "Réemploi / réversibilité" },
          { key: "comparison_row5_urbaquai", label: "Ligne 5 — Cellule URBAQUAI (tape yes/no/partial pour icône)", type: "texte", placeholder: "yes" },
          { key: "comparison_row5_plastique", label: "Ligne 5 — Cellule Plastique", type: "texte", placeholder: "partial" },
          { key: "comparison_row5_traditionnel", label: "Ligne 5 — Cellule Traditionnel", type: "texte", placeholder: "no" },
          { key: "comparison_row6_libelle", label: "Ligne 6 — Libellé", type: "texte", placeholder: "Certification CERIB" },
          { key: "comparison_row6_urbaquai", label: "Ligne 6 — Cellule URBAQUAI", type: "texte", placeholder: "yes" },
          { key: "comparison_row6_plastique", label: "Ligne 6 — Cellule Plastique", type: "texte", placeholder: "no" },
          { key: "comparison_row6_traditionnel", label: "Ligne 6 — Cellule Traditionnel", type: "texte", placeholder: "partial" },
          { key: "comparison_row7_libelle", label: "Ligne 7 — Libellé", type: "texte", placeholder: "Pose sur sol souple ET rigide" },
          { key: "comparison_row7_urbaquai", label: "Ligne 7 — Cellule URBAQUAI", type: "texte", placeholder: "yes" },
          { key: "comparison_row7_plastique", label: "Ligne 7 — Cellule Plastique", type: "texte", placeholder: "no" },
          { key: "comparison_row7_traditionnel", label: "Ligne 7 — Cellule Traditionnel", type: "texte", placeholder: "no" },
          { key: "comparison_row8_libelle", label: "Ligne 8 — Libellé", type: "texte", placeholder: "Transparence hydraulique" },
          { key: "comparison_row8_urbaquai", label: "Ligne 8 — Cellule URBAQUAI", type: "texte", placeholder: "yes" },
          { key: "comparison_row8_plastique", label: "Ligne 8 — Cellule Plastique", type: "texte", placeholder: "no" },
          { key: "comparison_row8_traditionnel", label: "Ligne 8 — Cellule Traditionnel", type: "texte", placeholder: "no" },
          { key: "comparison_row9_libelle", label: "Ligne 9 — Libellé", type: "texte", placeholder: "Albédo élevé (confort thermique)" },
          { key: "comparison_row9_urbaquai", label: "Ligne 9 — Cellule URBAQUAI", type: "texte", placeholder: "yes" },
          { key: "comparison_row9_plastique", label: "Ligne 9 — Cellule Plastique", type: "texte", placeholder: "no" },
          { key: "comparison_row9_traditionnel", label: "Ligne 9 — Cellule Traditionnel", type: "texte", placeholder: "partial" },
          { key: "comparison_row10_libelle", label: "Ligne 10 — Libellé", type: "texte", placeholder: "Impact environnemental" },
          { key: "comparison_row10_urbaquai", label: "Ligne 10 — Cellule URBAQUAI", type: "texte", placeholder: "Ciment NF bas carbone" },
          { key: "comparison_row10_plastique", label: "Ligne 10 — Cellule Plastique", type: "texte", placeholder: "Plastique recyclé" },
          { key: "comparison_row10_traditionnel", label: "Ligne 10 — Cellule Traditionnel", type: "texte", placeholder: "Béton standard" },
          { key: "comparison_row11_libelle", label: "Ligne 11 — Libellé", type: "texte", placeholder: "Délai de mise en service" },
          { key: "comparison_row11_urbaquai", label: "Ligne 11 — Cellule URBAQUAI", type: "texte", placeholder: "48h" },
          { key: "comparison_row11_plastique", label: "Ligne 11 — Cellule Plastique", type: "texte", placeholder: "24-48h" },
          { key: "comparison_row11_traditionnel", label: "Ligne 11 — Cellule Traditionnel", type: "texte", placeholder: "2-4 sem." },
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
        label: "À propos d'URBAMAT (section home, 5 cartes)",
        description: "Eyebrow + titre + intro (HTML) + 5 cartes thématiques. Logos clients en bas de la dernière carte.",
        icon: "Users",
        sections: [
          { key: "apropos_eyebrow", label: "Eyebrow (au-dessus du titre)", type: "texte", placeholder: "URBAMAT Environnement" },
          { key: "apropos_titre", label: "Titre", type: "texte", placeholder: "À propos d'URBAMAT Environnement" },
          { key: "apropos_intro", label: "Introduction (HTML — autorise <strong>, <br/>)", type: "html", placeholder: "PME familiale basée en Alsace, URBAMAT Environnement conçoit et développe depuis le début des années 2000 des solutions en béton préfabriqué dédiées à la mobilité urbaine.<br/><br/>Sa philosophie s'inscrit dans une démarche d'amélioration de la qualité de service des transports publics afin de garantir une mobilité accessible, sûre et sans obstacle pour l'ensemble des usagers." },
          { key: "apropos_visuel", label: "Visuel décoratif (image carrée à droite — par défaut : mosaïque emoji)", type: "image" },
          { key: "apropos_cta_primaire", label: "Bouton principal — Libellé", type: "texte", placeholder: "Découvrir l'entreprise" },
          { key: "apropos_cta_primaire_url", label: "Bouton principal — URL", type: "texte", placeholder: "/apropos" },
          { key: "apropos_cta_secondaire", label: "Bouton secondaire — Libellé", type: "texte", placeholder: "En savoir plus sur l'entreprise" },
          { key: "apropos_cta_secondaire_url", label: "Bouton secondaire — URL", type: "texte", placeholder: "/contact" },
          // 5 cartes
          { key: "apropos_card1_titre", label: "Carte 1 — Titre", type: "texte", placeholder: "Une expertise historique de l'accessibilité bus" },
          { key: "apropos_card1_texte", label: "Carte 1 — Texte (HTML)", type: "html", placeholder: "Forte d'une expertise reconnue…" },
          { key: "apropos_card1_icon", label: "Carte 1 — Icône", type: "icon", placeholder: "Award" },
          { key: "apropos_card2_titre", label: "Carte 2 — Titre", type: "texte", placeholder: "URBAQUAI® : une réponse issue des retours d'expérience" },
          { key: "apropos_card2_texte", label: "Carte 2 — Texte (HTML)", type: "html", placeholder: "C'est dans cette continuité…" },
          { key: "apropos_card2_icon", label: "Carte 2 — Icône", type: "icon", placeholder: "Wrench" },
          { key: "apropos_card3_titre", label: "Carte 3 — Titre", type: "texte", placeholder: "Un niveau d'exigence élevé" },
          { key: "apropos_card3_texte", label: "Carte 3 — Texte (HTML)", type: "html", placeholder: "URBAMAT applique des standards rigoureux…" },
          { key: "apropos_card3_icon", label: "Carte 3 — Icône", type: "icon", placeholder: "ShieldCheck" },
          { key: "apropos_card4_titre", label: "Carte 4 — Titre", type: "texte", placeholder: "Un ancrage reconnu dans la filière" },
          { key: "apropos_card4_texte", label: "Carte 4 — Texte (HTML)", type: "html", placeholder: "URBAMAT Environnement est adhérent…" },
          { key: "apropos_card4_icon", label: "Carte 4 — Icône", type: "icon", placeholder: "Train" },
          { key: "apropos_card5_titre", label: "Carte 5 — Titre", type: "texte", placeholder: "Une confiance renouvelée" },
          { key: "apropos_card5_texte", label: "Carte 5 — Texte (HTML)", type: "html", placeholder: "La confiance accordée aux solutions URBAMAT…" },
          { key: "apropos_card5_icon", label: "Carte 5 — Icône", type: "icon", placeholder: "Users" },
          { key: "apropos_logos_clients", label: "Logos clients (séparés par |, ex: SNCF Réseau|Nice Métropole)", type: "texte", placeholder: "SNCF Réseau|SNCF Gares & Connexions|Nice Métropole" },
        ],
      },
      {
        id: "reglementation",
        label: "Bloc Réglementation (3 normes)",
        description: "Bandeau réglementation : titre + sous-titre + 3 cartes (Loi 2005, Cerema, Norme).",
        icon: "ShieldCheck",
        sections: [
          { key: "reglementation_titre", label: "Titre", type: "texte", placeholder: "Conformité réglementaire" },
          { key: "reglementation_sous_titre", label: "Sous-titre", type: "texte", placeholder: "URBAQUAI répond aux exigences…" },
          { key: "reglementation_cta_label", label: "Libellé bouton (« Explorer la réglementation »)", type: "texte", placeholder: "Explorer la réglementation" },
          { key: "reglementation_card1_titre", label: "Carte 1 — Titre", type: "texte", placeholder: "Loi du 11 février 2005" },
          { key: "reglementation_card1_description", label: "Carte 1 — Description", type: "texte", placeholder: "Égalité des droits et des chances…" },
          { key: "reglementation_card2_titre", label: "Carte 2 — Titre", type: "texte", placeholder: "Guide CEREMA 2018" },
          { key: "reglementation_card2_description", label: "Carte 2 — Description", type: "texte", placeholder: "Référentiel d'accessibilité bus/car…" },
          { key: "reglementation_card3_titre", label: "Carte 3 — Titre", type: "texte", placeholder: "Norme NF P98-351" },
          { key: "reglementation_card3_description", label: "Carte 3 — Description", type: "texte", placeholder: "Bandes d'éveil de vigilance…" },
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
        id: "intro",
        label: "1. Introduction (haut de page)",
        description: "Badge brevet + logo + sous-titre + 3 paragraphes en HTML + 2 boutons CTA + caption sous la vue éclatée.",
        icon: "Package",
        sections: [
          { key: "produit_intro_badge", label: "Badge brevet", type: "texte", placeholder: "Innovation protégée par dépôt de brevet" },
          { key: "produit_intro_logo", label: "Logo URBAQUAI affiché en haut", type: "image", placeholder: "/images/logo-urbaquai.png" },
          { key: "produit_intro_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Quai bus provisoire — Solution durable et accessible" },
          { key: "produit_intro_description", label: "Description (HTML, plusieurs paragraphes)", type: "html", placeholder: "<p><strong>URBAQUAI®</strong> est une solution innovante pour la création de quais bus provisoires. Composé de modules en béton préfabriqué bas carbone haute performance, ce système constructif s'adapte à la diversité des configurations urbaines ainsi qu'aux spécificités du matériel roulant.</p><p>Afin d'assurer un accès de plain-pied, la hauteur des modules est calibrée en fonction du niveau du plancher du bus. La gamme standardisée est conçue pour s'adapter à la longueur des véhicules comme à l'espace disponible.</p><p>Posés directement sur la chaussée existante, les modules limitent les travaux préparatoires, réduisent les perturbations et accélèrent la mise en service du point d'arrêt.</p>" },
          { key: "produit_intro_cta_primaire", label: "Bouton principal — Libellé", type: "texte", placeholder: "Configurer un quai" },
          { key: "produit_intro_cta_primaire_url", label: "Bouton principal — URL", type: "texte", placeholder: "/configurateur" },
          { key: "produit_intro_cta_secondaire", label: "Bouton secondaire — Libellé", type: "texte", placeholder: "Documentation" },
          { key: "produit_intro_cta_secondaire_url", label: "Bouton secondaire — URL", type: "texte", placeholder: "/telechargements" },
          { key: "produit_intro_caption", label: "Légende sous la vue éclatée", type: "texte", placeholder: "vue éclatée — D-004 · D-002 · D-003" },
        ],
      },
      {
        id: "concept",
        label: "2. Le concept URBAQUAI® (6 points)",
        description: "Eyebrow + titre + intro + 6 cartes (titre + texte + icône). 6 principes constructifs au cœur du système.",
        icon: "Sparkles",
        sections: [
          { key: "produit_concept_eyebrow", label: "Eyebrow", type: "texte", placeholder: "Concept" },
          { key: "produit_concept_titre", label: "Titre", type: "texte", placeholder: "Le concept URBAQUAI®" },
          { key: "produit_concept_intro", label: "Intro / sous-titre", type: "texte", placeholder: "Six principes constructifs au cœur du système, pour répondre aux exigences fondamentales d'un point d'arrêt bus provisoire : accessibilité PMR, transparence hydraulique, visibilité, sécurité et robustesse." },
          { key: "produit_concept_card1_titre", label: "Carte 1 — Titre", type: "texte", placeholder: "Logistique et réemploi simplifiés" },
          { key: "produit_concept_card1_texte", label: "Carte 1 — Texte", type: "texte", placeholder: "La conception basée sur un nombre limité de modules standardisés permet de rationaliser les opérations d'installation, de démontage, de maintenance et de stockage. Cette approche élimine le risque de perte d'éléments et garantit une réelle flexibilité pour le réemploi ou la reconfiguration en fonction des exigences de chaque site." },
          { key: "produit_concept_card1_icon", label: "Carte 1 — Icône", type: "icon", placeholder: "Layers" },
          { key: "produit_concept_card2_titre", label: "Carte 2 — Titre", type: "texte", placeholder: "4 plots intégrés, 2 bénéfices clés" },
          { key: "produit_concept_card2_texte", label: "Carte 2 — Texte", type: "texte", placeholder: "Reposant sur quatre plots intégrés et pré-percés, les modules assurent une véritable transparence hydraulique par la libre circulation des eaux pluviales sous le quai, tout en limitant au minimum les perçages dans la chaussée afin d'en préserver l'état lors de la restitution du site." },
          { key: "produit_concept_card2_icon", label: "Carte 2 — Icône", type: "icon", placeholder: "Anchor" },
          { key: "produit_concept_card3_titre", label: "Carte 3 — Titre", type: "texte", placeholder: "Stabilité et adaptabilité au support" },
          { key: "produit_concept_card3_texte", label: "Carte 3 — Texte", type: "texte", placeholder: "URBAQUAI® s'installe directement sur les supports existants, qu'il s'agisse d'un enrobé ou d'une grave non traitée. Sur assise souple de type GNT, les plots s'intègrent dans une dalle de répartition préfabriquée, conçue pour stabiliser l'ensemble et répartir les efforts." },
          { key: "produit_concept_card3_icon", label: "Carte 3 — Icône", type: "icon", placeholder: "Boxes" },
          { key: "produit_concept_card4_titre", label: "Carte 4 — Titre", type: "texte", placeholder: "Lisibilité durable et contraste visuel" },
          { key: "produit_concept_card4_texte", label: "Carte 4 — Texte", type: "texte", placeholder: "Le traitement antisalissure S.O., non filmogène et intégré lors du processus de fabrication, protège durablement l'aspect d'origine du quai et contribue à la qualité visuelle de l'ouvrage dans le temps. Associé à un albédo élevé, il renforce le contraste visuel avec la chaussée, améliorant ainsi la perception du point d'arrêt provisoire et son repérage par les voyageurs." },
          { key: "produit_concept_card4_icon", label: "Carte 4 — Icône", type: "icon", placeholder: "Eye" },
          { key: "produit_concept_card5_titre", label: "Carte 5 — Titre", type: "texte", placeholder: "Béton haute performance et durabilité" },
          { key: "produit_concept_card5_texte", label: "Carte 5 — Texte", type: "texte", placeholder: "Les modules URBAQUAI® sont fabriqués en béton de classe C45/55, à base de ciment de type CEM II et avec une classe d'exposition XF4, particulièrement adaptée aux conditions environnementales exigeantes. Cette composition assure une protection efficace contre le gel, le dégel et l'action des sels de déneigement, tout en contribuant à limiter les émissions de gaz à effet de serre." },
          { key: "produit_concept_card5_icon", label: "Carte 5 — Icône", type: "icon", placeholder: "Shield" },
          { key: "produit_concept_card6_titre", label: "Carte 6 — Titre", type: "texte", placeholder: "Sécurisation et signalisation" },
          { key: "produit_concept_card6_texte", label: "Carte 6 — Texte", type: "texte", placeholder: "Le système peut intégrer les réservations nécessaires à la fixation des équipements de sécurité et de signalisation du site, tels que garde-corps, balises ou poteaux. Des éléments sur mesure peuvent également être prévus afin de répondre aux contraintes spécifiques de chaque implantation." },
          { key: "produit_concept_card6_icon", label: "Carte 6 — Icône", type: "icon", placeholder: "Wrench" },
        ],
      },
      {
        id: "coloris",
        label: "3. Bandeau coloris (4 nuances béton)",
        description: "Titre + 4 swatches (nom + image). Le client peut changer les visuels de coloris si la collection évolue.",
        icon: "Sparkles",
        sections: [
          { key: "produit_coloris_titre", label: "Titre du bandeau", type: "texte", placeholder: "4 coloris béton naturels" },
          { key: "produit_coloris_c1_nom", label: "Carte 1 — Nom", type: "texte", placeholder: "Quartz Blanc" },
          { key: "produit_coloris_c1_image", label: "Carte 1 — Image", type: "image", placeholder: "/images/urbamat/coloris-quartz-blanc.png" },
          { key: "produit_coloris_c2_nom", label: "Carte 2 — Nom", type: "texte", placeholder: "Granit Gris" },
          { key: "produit_coloris_c2_image", label: "Carte 2 — Image", type: "image", placeholder: "/images/urbamat/coloris-granit-gris.png" },
          { key: "produit_coloris_c3_nom", label: "Carte 3 — Nom", type: "texte", placeholder: "Basalte Noir" },
          { key: "produit_coloris_c3_image", label: "Carte 3 — Image", type: "image", placeholder: "/images/urbamat/coloris-basalte-noir.png" },
          { key: "produit_coloris_c4_nom", label: "Carte 4 — Nom", type: "texte", placeholder: "Calcaire Jaune" },
          { key: "produit_coloris_c4_image", label: "Carte 4 — Image", type: "image", placeholder: "/images/urbamat/coloris-calcaire-jaune.png" },
        ],
      },
      {
        id: "performance",
        label: "4. Comparaison des performances",
        description: "Section grise avec image comparatif (URBAQUAI vs concurrents). Le client peut remplacer le tableau par une nouvelle image si les chiffres bougent.",
        icon: "Table",
        sections: [
          { key: "produit_performance_eyebrow", label: "Eyebrow", type: "texte", placeholder: "Performance" },
          { key: "produit_performance_titre", label: "Titre", type: "texte", placeholder: "Comparaison des niveaux de performance" },
          { key: "produit_performance_sous_titre", label: "Sous-titre", type: "texte", placeholder: "URBAQUAI® face aux solutions concurrentes : grands modules béton, quais plastique, quais béton coulés en place." },
          { key: "produit_performance_image", label: "Image du tableau comparatif", type: "image", placeholder: "/images/urbamat/comparaison-performances.png" },
        ],
      },
      {
        id: "accessibilite",
        label: "5. Accessibilité & cadre réglementaire (3 cartes)",
        description: "Section blanche avec eyebrow + titre + picto + 3 sous-cartes. Chaque carte = badge + titre + contenu HTML (liste à puces) + image illustrative + légende.",
        icon: "ShieldCheck",
        sections: [
          { key: "produit_accessibilite_eyebrow", label: "Eyebrow", type: "texte", placeholder: "Accessibilité & cadre réglementaire" },
          { key: "produit_accessibilite_titre", label: "Titre", type: "texte", placeholder: "Une solution accessible, lisible et sûre" },
          { key: "produit_accessibilite_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Conforme aux normes en vigueur pour l'accessibilité PMR, la lisibilité tactile et visuelle, ainsi que la sécurité antidérapante." },
          { key: "produit_accessibilite_picto", label: "Image picto accessibilité", type: "image", placeholder: "/images/urbamat/picto-accessibilite.png" },
          // Carte 1 — Accessible
          { key: "produit_accessibilite_card1_badge", label: "Carte 1 — Badge", type: "texte", placeholder: "Une solution accessible" },
          { key: "produit_accessibilite_card1_titre", label: "Carte 1 — Titre", type: "texte", placeholder: "Un accès en pente douce pour les utilisateurs de fauteuil roulant" },
          { key: "produit_accessibilite_card1_contenu", label: "Carte 1 — Contenu (HTML, liste à puces autorisée)", type: "html", placeholder: "<ul><li>Une <strong>rampe en acier galvanisé</strong> assure l'interface entre les modules URBAQUAI® et le trottoir.</li><li>La surface structurée antidérapante favorise la sécurité d'usage.</li><li>Une visserie inviolable peut être prévue en option.</li></ul>" },
          { key: "produit_accessibilite_card1_image", label: "Carte 1 — Image illustrative", type: "image", placeholder: "/images/urbamat/rampe-acier-plan.png" },
          { key: "produit_accessibilite_card1_legende", label: "Carte 1 — Légende sous l'image", type: "texte", placeholder: "Rampe acier 2010 mm — vues plan + profil" },
          // Carte 2 — Lisible
          { key: "produit_accessibilite_card2_badge", label: "Carte 2 — Badge", type: "texte", placeholder: "Une solution lisible" },
          { key: "produit_accessibilite_card2_titre", label: "Carte 2 — Titre", type: "texte", placeholder: "Une bande de guidage contrastée pour les personnes aveugles ou malvoyantes" },
          { key: "produit_accessibilite_card2_contenu", label: "Carte 2 — Contenu (HTML)", type: "html", placeholder: "<ul><li>L'ergonomie tactile respecte la <strong>norme NF P 98-352</strong>.</li><li>Le contraste visuel présente une valeur minimale de <strong>70 %</strong>, conforme à la <strong>norme NF P 98-351</strong>.</li><li>Cette conception offre au chauffeur un repère visuel précis pour positionner correctement la porte avant au niveau du quai.</li></ul>" },
          { key: "produit_accessibilite_card2_image", label: "Carte 2 — Image illustrative", type: "image", placeholder: "/images/urbamat/bandes-eveil-sketchup.jpeg" },
          { key: "produit_accessibilite_card2_legende", label: "Carte 2 — Légende sous l'image", type: "texte", placeholder: "Implantation bande de guidage — repérage porte avant" },
          // Carte 3 — Sécurité
          { key: "produit_accessibilite_card3_badge", label: "Carte 3 — Badge", type: "texte", placeholder: "Sécurité d'usage élevée" },
          { key: "produit_accessibilite_card3_titre", label: "Carte 3 — Titre", type: "texte", placeholder: "Une finition de surface antidérapante type B24" },
          { key: "produit_accessibilite_card3_contenu", label: "Carte 3 — Contenu (HTML)", type: "html", placeholder: "<ul><li>La finition <strong>B24</strong> offre un niveau de résistance à la glissance élevé.</li><li>La valeur <strong>SRT > 78</strong> est validée par le <strong>CERIB</strong>.</li><li>Cette valeur répond aux exigences de la <strong>norme NF P 98-351</strong>.</li></ul>" },
          { key: "produit_accessibilite_card3_image", label: "Carte 3 — Valeur clé (gros chiffre)", type: "texte", placeholder: "SRT > 78" },
          { key: "produit_accessibilite_card3_legende", label: "Carte 3 — Légende sous la valeur", type: "texte", placeholder: "Validé CERIB · NF P 98-351" },
        ],
      },
      {
        id: "configurations",
        label: "6. Configurations & typologies",
        description: "Eyebrow + titre + sous-titre + bloc Typologies (titre + texte + légende). Les diagrammes eux-mêmes (4 configs + grille typologies) sont rendus par les composants.",
        icon: "Grid3x3",
        sections: [
          { key: "produit_configurations_eyebrow", label: "Eyebrow", type: "texte", placeholder: "Configurations" },
          { key: "produit_configurations_titre", label: "Titre", type: "texte", placeholder: "4 configurations, toutes les situations" },
          { key: "produit_configurations_sous_titre", label: "Sous-titre", type: "texte", placeholder: "Chaque arrêt de bus est unique. URBAQUAI® s'adapte avec 4 configurations modulaires pour répondre à tous les cas de figure." },
          { key: "produit_typologies_titre", label: "Bloc Typologies — Titre", type: "texte", placeholder: "Typologies des points d'arrêt et des stationnements" },
          { key: "produit_typologies_sous_titre", label: "Bloc Typologies — Sous-titre (HTML)", type: "html", placeholder: "L'étendue de la gamme URBAQUAI® offre une multitude de possibilités avec plusieurs largeurs et longueurs de modules standardisés. La largeur des modules est adaptée pour s'intégrer dans l'alignement de tous les types de stationnement public configurés selon la norme <strong>NF P 91-100</strong>." },
          { key: "produit_typologies_legende", label: "Bloc Typologies — Légende sous les diagrammes", type: "texte", placeholder: "Conforme à la norme NF P 91-100 — Conception et dimensionnement des parcs de stationnement accessibles au public" },
          { key: "produit_configurer_cta_label", label: "Bouton — Libellé", type: "texte", placeholder: "Configurer mon quai en 3D" },
          { key: "produit_configurer_cta_url", label: "Bouton — URL", type: "texte", placeholder: "/configurateur" },
        ],
      },
      {
        id: "cta",
        label: "7. CTA contact (bas de page)",
        description: "Bandeau accent en bas de la page produit avec 2 boutons.",
        icon: "Send",
        sections: [
          { key: "produit_cta_titre", label: "Titre", type: "texte", placeholder: "Un projet d'accessibilité bus ?" },
          { key: "produit_cta_texte", label: "Texte", type: "texte", placeholder: "Décrivez-nous votre besoin. Notre équipe vous répond sous 24h avec une proposition technique et un chiffrage adaptés." },
          { key: "produit_cta_primaire", label: "Bouton principal — Libellé", type: "texte", placeholder: "Nous contacter" },
          { key: "produit_cta_primaire_url", label: "Bouton principal — URL", type: "texte", placeholder: "/contact" },
          { key: "produit_cta_secondaire", label: "Bouton secondaire — Libellé", type: "texte", placeholder: "Outil de configuration 3D" },
          { key: "produit_cta_secondaire_url", label: "Bouton secondaire — URL", type: "texte", placeholder: "/configurateur" },
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
        description: "Titre + sous-titre du haut de page",
        icon: "Download",
        sections: [
          { key: "titre", label: "Titre", type: "texte", placeholder: "Téléchargements" },
          { key: "sous_titre", label: "Sous-titre", type: "texte", placeholder: "Accédez à la documentation technique URBAQUAI : fiches produits, guide de pose, CCTP-BPU, plans CAO." },
        ],
      },
      {
        id: "labels",
        label: "Libellés de la page",
        description: "Petits textes affichés autour de la liste de documents et du formulaire de demande d'accès. Les documents eux-mêmes se gèrent depuis /admin/documents.",
        icon: "FileText",
        sections: [
          { key: "documents_disponibles", label: "Titre liste documents", type: "texte", placeholder: "Documents disponibles" },
          { key: "acces_documents", label: "Carte verrouillée — Titre", type: "texte", placeholder: "Accès aux documents" },
          { key: "remplissez_formulaire", label: "Carte verrouillée — Texte", type: "texte", placeholder: "Remplissez ce formulaire pour télécharger l'ensemble de notre documentation technique." },
          { key: "acces_debloque", label: "Carte déverrouillée — Titre", type: "texte", placeholder: "Accès débloqué !" },
          { key: "cliquez_telecharger", label: "Carte déverrouillée — Texte", type: "texte", placeholder: "Cliquez sur l'icône à côté de chaque document pour le télécharger." },
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
        description: "Titre et accroche en haut de page",
        icon: "Mail",
        sections: [
          { key: "titre", label: "Titre", type: "texte", placeholder: "Parlons de votre projet" },
          { key: "sous_titre", label: "Sous-titre", type: "texte", placeholder: "Notre équipe est à votre disposition pour analyser votre besoin et vous proposer une solution sur mesure." },
        ],
      },
      {
        id: "coordonnees",
        label: "Coordonnées (téléphone, email, adresse, horaires)",
        description: "Bloc latéral avec les 4 informations de contact. Chaque info a un libellé (devant) et une valeur (le contenu).",
        icon: "Phone",
        sections: [
          { key: "contact_formulaire_titre", label: "Titre du formulaire", type: "texte", placeholder: "Votre demande" },
          { key: "contact_coordonnees_titre", label: "Titre du bloc coordonnées", type: "texte", placeholder: "Nos coordonnées" },
          { key: "contact_telephone_label", label: "Bouton principal — Libellé téléphone", type: "texte", placeholder: "Téléphone" },
          { key: "contact_telephone", label: "Bouton principal — Numéro", type: "texte", placeholder: "+33 (0)3 88 01 09 61" },
          { key: "contact_email_label", label: "Bouton secondaire — Libellé email", type: "texte", placeholder: "Email" },
          { key: "contact_email", label: "Bouton secondaire — Adresse", type: "texte", placeholder: "contact@urbamat.fr" },
          { key: "contact_adresse_label", label: "Adresse — Libellé", type: "texte", placeholder: "Adresse" },
          { key: "contact_adresse", label: "Adresse — Valeur (multi-ligne, sépare avec retour à la ligne)", type: "html", placeholder: "URBAMAT Environnement\n4 rue d'Altenheim\n67490 Lupstein, France" },
          { key: "contact_horaires_label", label: "Horaires — Libellé", type: "texte", placeholder: "Horaires" },
          { key: "contact_horaires", label: "Horaires — Valeur", type: "texte", placeholder: "Lun.–Ven. 8h30–17h30" },
        ],
      },
      {
        id: "prescripteur",
        label: "Encadré prescripteur (CCTP/DWG)",
        description: "Bloc latéral en bas de la colonne droite : titre + texte + bouton vers les téléchargements.",
        icon: "FileText",
        sections: [
          { key: "prescripteur_titre", label: "Titre", type: "texte", placeholder: "Vous êtes prescripteur ?" },
          { key: "prescripteur_texte", label: "Texte (HTML)", type: "html", placeholder: "Téléchargez nos pièces écrites types (CCTP, BPU) et nos plans CAO/DWG pour intégrer URBAQUAI à votre dossier." },
          { key: "prescripteur_cta_label", label: "Bouton principal — Libellé", type: "texte", placeholder: "Accéder aux téléchargements" },
          { key: "prescripteur_cta_url", label: "Bouton principal — URL", type: "texte", placeholder: "/telechargements" },
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
