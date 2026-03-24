import type { NavItem, ConfigurationType } from "./types";

// ─── Navigation ─────────────────────────────────────────────────

export const NAV_ITEMS: NavItem[] = [
  { label: "URBAQUAI", href: "/produit" },
  { label: "URBATERRA", href: "/urbaterra" },
  { label: "Configurateur", href: "/configurateur" },
  { label: "Réalisations", href: "/realisations" },
  { label: "Réglementation", href: "/reglementation" },
  { label: "Téléchargements", href: "/telechargements" },
  { label: "Contact", href: "/contact" },
];

// ─── Configurations produit ─────────────────────────────────────

export const CONFIGURATIONS: ConfigurationType[] = [
  {
    id: "avancee",
    titre: "Avancée de trottoir",
    sousTitre: "Boarding bulb",
    description:
      "Extension du trottoir au niveau de l'arrêt de bus, permettant un accostage optimal du véhicule et un accès de plain-pied pour les PMR.",
    avantages: [
      "Accostage précis du bus",
      "Accès de plain-pied PMR",
      "Maintien de la voie de circulation",
      "Pose rapide sans terrassement lourd",
    ],
    casUsage: [
      "Arrêts en ligne droite",
      "Rues à stationnement latéral",
      "Zones urbaines denses",
    ],
    icon: "/images/configs/avancee.svg",
  },
  {
    id: "avancee_velo",
    titre: "Avancée avec piste cyclable",
    sousTitre: "Boarding bulb + cycle lane",
    description:
      "Configuration avancée intégrant une piste cyclable sécurisée à l'arrière du quai, permettant la cohabitation bus-vélo.",
    avantages: [
      "Cohabitation bus-vélo sécurisée",
      "Piste cyclable intégrée",
      "Continuité du réseau cyclable",
      "Signalétique intégrée",
    ],
    casUsage: [
      "Axes avec piste cyclable existante",
      "Projets de mobilité douce",
      "Aménagements multimodaux",
    ],
    icon: "/images/configs/avancee-velo.svg",
  },
  {
    id: "ile",
    titre: "Configuration en île",
    sousTitre: "Island platform",
    description:
      "Quai central isolé de la circulation, desservant une ou deux directions. Idéal pour les couloirs bus et BHNS.",
    avantages: [
      "Sécurité maximale des voyageurs",
      "Desserte bidirectionnelle possible",
      "Adapté aux BHNS",
      "Emprise au sol optimisée",
    ],
    casUsage: [
      "Couloirs bus en site propre",
      "BHNS et tramways",
      "Arrêts à fort trafic",
    ],
    icon: "/images/configs/ile.svg",
  },
  {
    id: "ile_velo",
    titre: "Île avec piste cyclable",
    sousTitre: "Island platform + cycle lane",
    description:
      "Configuration en île avec intégration d'une piste cyclable, assurant la continuité des itinéraires vélo à travers l'arrêt.",
    avantages: [
      "Sécurité voyageurs + cyclistes",
      "Continuité cyclable maintenue",
      "Signalisation intégrée",
      "Modularité complète",
    ],
    casUsage: [
      "BHNS avec réseau cyclable",
      "Projets Plan Vélo",
      "Aménagements urbains complets",
    ],
    icon: "/images/configs/ile-velo.svg",
  },
];

// ─── Départements français ──────────────────────────────────────

export const DEPARTEMENTS = [
  "01 - Ain", "02 - Aisne", "03 - Allier", "04 - Alpes-de-Haute-Provence",
  "05 - Hautes-Alpes", "06 - Alpes-Maritimes", "07 - Ardèche", "08 - Ardennes",
  "09 - Ariège", "10 - Aube", "11 - Aude", "12 - Aveyron",
  "13 - Bouches-du-Rhône", "14 - Calvados", "15 - Cantal", "16 - Charente",
  "17 - Charente-Maritime", "18 - Cher", "19 - Corrèze", "2A - Corse-du-Sud",
  "2B - Haute-Corse", "21 - Côte-d'Or", "22 - Côtes-d'Armor", "23 - Creuse",
  "24 - Dordogne", "25 - Doubs", "26 - Drôme", "27 - Eure",
  "28 - Eure-et-Loir", "29 - Finistère", "30 - Gard", "31 - Haute-Garonne",
  "32 - Gers", "33 - Gironde", "34 - Hérault", "35 - Ille-et-Vilaine",
  "36 - Indre", "37 - Indre-et-Loire", "38 - Isère", "39 - Jura",
  "40 - Landes", "41 - Loir-et-Cher", "42 - Loire", "43 - Haute-Loire",
  "44 - Loire-Atlantique", "45 - Loiret", "46 - Lot", "47 - Lot-et-Garonne",
  "48 - Lozère", "49 - Maine-et-Loire", "50 - Manche", "51 - Marne",
  "52 - Haute-Marne", "53 - Mayenne", "54 - Meurthe-et-Moselle", "55 - Meuse",
  "56 - Morbihan", "57 - Moselle", "58 - Nièvre", "59 - Nord",
  "60 - Oise", "61 - Orne", "62 - Pas-de-Calais", "63 - Puy-de-Dôme",
  "64 - Pyrénées-Atlantiques", "65 - Hautes-Pyrénées", "66 - Pyrénées-Orientales",
  "67 - Bas-Rhin", "68 - Haut-Rhin", "69 - Rhône", "70 - Haute-Saône",
  "71 - Saône-et-Loire", "72 - Sarthe", "73 - Savoie", "74 - Haute-Savoie",
  "75 - Paris", "76 - Seine-Maritime", "77 - Seine-et-Marne", "78 - Yvelines",
  "79 - Deux-Sèvres", "80 - Somme", "81 - Tarn", "82 - Tarn-et-Garonne",
  "83 - Var", "84 - Vaucluse", "85 - Vendée", "86 - Vienne",
  "87 - Haute-Vienne", "88 - Vosges", "89 - Yonne", "90 - Territoire de Belfort",
  "91 - Essonne", "92 - Hauts-de-Seine", "93 - Seine-Saint-Denis",
  "94 - Val-de-Marne", "95 - Val-d'Oise",
  "971 - Guadeloupe", "972 - Martinique", "973 - Guyane",
  "974 - La Réunion", "976 - Mayotte",
] as const;

// ─── Labels des enums ───────────────────────────────────────────

export const PROFIL_LABELS: Record<string, string> = {
  moe: "Maître d'Œuvre",
  moa: "Maître d'Ouvrage",
  tp: "Entreprise de Travaux Publics",
  collectivite: "Collectivité / AOT",
  autre: "Autre",
};

export const CONFIG_LABELS: Record<string, string> = {
  avancee: "Avancée de trottoir",
  avancee_velo: "Avancée + piste cyclable",
  ile: "Configuration en île",
  ile_velo: "Île + piste cyclable",
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  fiche: "Fiche technique",
  guide: "Guide de pose",
  cctp: "Extrait CCTP / BPU",
  plan: "Plan DWG",
};

// ─── Infos société ──────────────────────────────────────────────

export const SITE_CONFIG = {
  name: "URBAQUAI",
  company: "URBAMAT Environnement",
  tagline: "Le quai bus accessible. En 48h.",
  address: "4 rue d'Altenheim, 67490 Lupstein, France",
  email: "info@urbamat.fr",
  tel: "03 88 01 09 61",
  url: "https://urbaquai.fr",
};

// ─── Specs techniques réelles URBAQUAI 140+50 ──────────────────

export const PRODUCT_SPECS = {
  gamme: "URBAQUAI 140+50",
  modules: [
    { ref: "M 1.18", nom: "Module Central", dimensions: "3000 × 1500 × 180 mm", poids: "~1 400 kg" },
    { ref: "M BF18", nom: "Module Latéral Droit", dimensions: "1500 × 1500 × 180 mm", poids: "~700 kg" },
    { ref: "M AF18", nom: "Module Latéral Gauche", dimensions: "1500 × 1500 × 180 mm", poids: "~700 kg" },
  ],
  hauteurs: ["180 mm", "210 mm"],
  beton: {
    classe: "C40/50",
    exposition: "XC4 – XF4 – XD3",
    ciment: "NF bas carbone",
    composition: "Béton monolithique haute résistance",
  },
  finition: {
    type: "Antidérapante sablé (B24)",
    srtNeuf: "≥ 78 (neuf et humide)",
    srtUse: "≥ 66 (sali, usé et humide)",
  },
  resistances: {
    gelDegel: "< 0.3 kg/m² (sels de déneigement)",
    abrasion: "Classe 4 / GI",
    chocs: "P4 / U4",
    taches: "C3 (potasse)",
  },
  tests: "CERIB validés selon EN 1339",
  coloris: [
    { nom: "Quartz Blanc", hex: "#F5F0E8" },
    { nom: "Basalte Noir", hex: "#2C2C2A" },
    { nom: "Granit Gris", hex: "#8B8B85" },
    { nom: "Calcaire Jaune", hex: "#D4C590" },
  ],
  rampes: {
    beton: "Rampe PMR béton D-009a — pente intégrée de 7.9%",
    metal: "Rampe acier galvanisé — réglage automatique en hauteur, visserie anti-effraction",
  },
  pose: {
    methode: "Élingues (capacité 1 800 kg)",
    fixation: "Chevilles Ø12 mm à 15 cm de profondeur",
    bandeGuidage: "Bande de guidage tactile contrastée conforme NF P 98-352",
  },
};
