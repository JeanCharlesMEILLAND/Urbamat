// ─── Catalogue des modules URBAQUAI 140+50 ──────────────────────
//
// Basé sur le plan technique réel : 2 rangées de 1500mm = quai 3000mm
// Rangée haute = côté voirie (bus)
// Rangée basse = côté trottoir

export type ModuleRef =
  | "D-009"   // Rampe haute gauche
  | "D-009a"  // Rampe PMR basse gauche
  | "D-004e"  // Latéral gauche haut
  | "D-012"   // Latéral gauche bas
  | "D-005"   // Central standard haut (3000mm)
  | "D-002"   // Central standard bas (3000mm)
  | "D-006"   // Central haut (3000mm, variante)
  | "D-007e"  // Jonction étroit haut (1000mm)
  | "D-037"   // Jonction étroit bas (1000mm)
  | "D-003e"  // Fin de quai droit haut
  | "D-003"   // Fin de quai droit bas
  | "VIDE-H"  // Espaceur haut 1500mm
  | "VIDE-B"; // Espaceur bas 1500mm

export type ModuleRow = "haut" | "bas";
export type ModuleRole = "rampe" | "lateral" | "central" | "jonction" | "fin" | "vide";

export interface ModuleSpec {
  ref: ModuleRef;
  nom: string;
  longueur: number;   // mm
  largeur: number;    // mm (toujours 1500)
  hauteur: number;    // mm
  poids: number;      // kg estimé
  rang: ModuleRow;
  role: ModuleRole;
  description: string;
}

export const MODULE_CATALOG: Record<ModuleRef, ModuleSpec> = {
  // ─── Rangée haute (côté voirie) ─────────────
  "D-009": {
    ref: "D-009",
    nom: "Rampe d'accès haute",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 700,
    rang: "haut",
    role: "rampe",
    description: "Rampe biseau 40→180mm, caniveau 510mm, côté voirie",
  },
  "D-004e": {
    ref: "D-004e",
    nom: "Latéral gauche haut",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 700,
    rang: "haut",
    role: "lateral",
    description: "Module latéral gauche, rangée haute",
  },
  "D-005": {
    ref: "D-005",
    nom: "Central standard haut",
    longueur: 3000,
    largeur: 1500,
    hauteur: 180,
    poids: 1400,
    rang: "haut",
    role: "central",
    description: "Module central standard 3m, rangée haute",
  },
  "D-006": {
    ref: "D-006",
    nom: "Central haut (variante)",
    longueur: 3000,
    largeur: 1500,
    hauteur: 180,
    poids: 1400,
    rang: "haut",
    role: "central",
    description: "Module central 3m variante, rangée haute",
  },
  "D-007e": {
    ref: "D-007e",
    nom: "Jonction haute",
    longueur: 1000,
    largeur: 1500,
    hauteur: 180,
    poids: 470,
    rang: "haut",
    role: "jonction",
    description: "Module de jonction étroit 1m, rangée haute",
  },
  "D-003e": {
    ref: "D-003e",
    nom: "Fin de quai droit haut",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 700,
    rang: "haut",
    role: "fin",
    description: "Module de terminaison droite, rangée haute",
  },

  // ─── Rangée basse (côté trottoir) ───────────
  "D-009a": {
    ref: "D-009a",
    nom: "Rampe PMR béton",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 700,
    rang: "bas",
    role: "rampe",
    description: "Rampe PMR biseau 40→180mm, caniveau 510mm, côté trottoir",
  },
  "D-012": {
    ref: "D-012",
    nom: "Latéral gauche bas",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 700,
    rang: "bas",
    role: "lateral",
    description: "Module latéral gauche, rangée basse",
  },
  "D-002": {
    ref: "D-002",
    nom: "Central standard bas",
    longueur: 3000,
    largeur: 1500,
    hauteur: 180,
    poids: 1400,
    rang: "bas",
    role: "central",
    description: "Module central standard 3m, rangée basse",
  },
  "D-037": {
    ref: "D-037",
    nom: "Jonction basse",
    longueur: 1000,
    largeur: 1500,
    hauteur: 180,
    poids: 470,
    rang: "bas",
    role: "jonction",
    description: "Module de jonction étroit 1m, rangée basse",
  },
  "D-003": {
    ref: "D-003",
    nom: "Fin de quai droit bas",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 700,
    rang: "bas",
    role: "fin",
    description: "Module de terminaison droite, rangée basse",
  },

  // ─── Espaceurs (modules vides) ──────────
  "VIDE-H": {
    ref: "VIDE-H",
    nom: "Vide (espaceur haut)",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 0,
    rang: "haut",
    role: "vide",
    description: "Espace vide 1.5m pour décaler les modules, rangée haute",
  },
  "VIDE-B": {
    ref: "VIDE-B",
    nom: "Vide (espaceur bas)",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 0,
    rang: "bas",
    role: "vide",
    description: "Espace vide 1.5m pour décaler les modules, rangée basse",
  },
};

// ─── Types de résultat ──────────────────────────────────────────

export interface PlacedModule {
  ref: ModuleRef;
  spec: ModuleSpec;
  x: number;       // position X en mm depuis la gauche
  rang: ModuleRow;
}

export interface QuaiConfig {
  longueurDemandee: number; // mm
  longueurReelle: number;   // mm (calculée)
  rampeGauche: boolean;
  rampeDroite: boolean;
  coloris: string;
  modules: PlacedModule[];
  bom: BomLine[];
  poidsTotal: number;
  nbModulesTotal: number;
}

export interface BomLine {
  ref: ModuleRef;
  nom: string;
  quantite: number;
  longueur: number;
  poids: number;
  poidsTotal: number;
}

// ─── Options du configurateur ───────────────────────────────────

export interface ConfigOptions {
  longueurMm: number;
  rampeGauche: boolean;
  rampeDroite: boolean;
  coloris: string;
}

// ─── Algorithme de construction ─────────────────────────────────

/**
 * Construit un quai URBAQUAI à partir d'une longueur cible.
 *
 * Structure fixe :
 * - Extrémité gauche : rampe (D-009 + D-009a) + latéral (D-004e + D-012)
 * - Extrémité droite : fin (D-003e + D-003)
 * - Zone centrale : remplie par modules de 3000mm (D-005/D-002)
 * - Ajustement : jonction de 1000mm (D-007e/D-037) si nécessaire
 */
export function buildQuai(options: ConfigOptions): QuaiConfig {
  const { longueurMm, rampeGauche, rampeDroite, coloris } = options;
  const modules: PlacedModule[] = [];

  // ─── Éléments fixes gauche ──────────
  const fixeGaucheHaut: ModuleRef[] = rampeGauche ? ["D-009", "D-004e"] : ["D-004e"];
  const fixeGaucheBas: ModuleRef[] = rampeGauche ? ["D-009a", "D-012"] : ["D-012"];

  // ─── Éléments fixes droite ──────────
  const fixeDroiteHaut: ModuleRef[] = rampeDroite ? ["D-003e", "D-009"] : ["D-003e"];
  const fixeDroiteBas: ModuleRef[] = rampeDroite ? ["D-003", "D-009a"] : ["D-003"];

  // Calculer longueur occupée par les fixes
  const longueurFixeGauche = fixeGaucheHaut.reduce(
    (sum, ref) => sum + MODULE_CATALOG[ref].longueur, 0
  );
  const longueurFixeDroite = fixeDroiteHaut.reduce(
    (sum, ref) => sum + MODULE_CATALOG[ref].longueur, 0
  );

  // Espace central à remplir
  const espaceDisponible = longueurMm - longueurFixeGauche - longueurFixeDroite;

  // Remplir avec des modules de 3000mm + ajustement 1000mm
  let restant = Math.max(espaceDisponible, 0);
  const nbModules3m = Math.floor(restant / 3000);
  restant -= nbModules3m * 3000;

  // Si le reste est >= 500mm, ajouter une jonction de 1000mm
  const besoinJonction = restant >= 500;
  if (besoinJonction) {
    restant -= 1000;
  }

  // ─── Placer les modules — rangée haute ──────
  let xHaut = 0;

  // Gauche haut
  for (const ref of fixeGaucheHaut) {
    const spec = MODULE_CATALOG[ref];
    modules.push({ ref, spec, x: xHaut, rang: "haut" });
    xHaut += spec.longueur;
  }

  // Centraux haut
  for (let i = 0; i < nbModules3m; i++) {
    // Alterner D-005 et D-006 pour le réalisme
    const ref: ModuleRef = i === 0 ? "D-006" : "D-005";
    const spec = MODULE_CATALOG[ref];
    modules.push({ ref, spec, x: xHaut, rang: "haut" });
    xHaut += spec.longueur;
  }

  // Jonction haut si nécessaire
  if (besoinJonction) {
    const spec = MODULE_CATALOG["D-007e"];
    modules.push({ ref: "D-007e", spec, x: xHaut, rang: "haut" });
    xHaut += spec.longueur;
  }

  // Droite haut
  for (const ref of fixeDroiteHaut) {
    const spec = MODULE_CATALOG[ref];
    modules.push({ ref, spec, x: xHaut, rang: "haut" });
    xHaut += spec.longueur;
  }

  // ─── Placer les modules — rangée basse ──────
  let xBas = 0;

  // Gauche bas
  for (const ref of fixeGaucheBas) {
    const spec = MODULE_CATALOG[ref];
    modules.push({ ref, spec, x: xBas, rang: "bas" });
    xBas += spec.longueur;
  }

  // Centraux bas
  for (let i = 0; i < nbModules3m; i++) {
    const spec = MODULE_CATALOG["D-002"];
    modules.push({ ref: "D-002", spec, x: xBas, rang: "bas" });
    xBas += spec.longueur;
  }

  // Jonction bas si nécessaire
  if (besoinJonction) {
    const spec = MODULE_CATALOG["D-037"];
    modules.push({ ref: "D-037", spec, x: xBas, rang: "bas" });
    xBas += spec.longueur;
  }

  // Droite bas
  for (const ref of fixeDroiteBas) {
    const spec = MODULE_CATALOG[ref];
    modules.push({ ref, spec, x: xBas, rang: "bas" });
    xBas += spec.longueur;
  }

  // ─── Calculer la longueur réelle ────────────
  const longueurReelle = Math.max(xHaut, xBas);

  // ─── Générer le BOM ─────────────────────────
  const bomMap = new Map<ModuleRef, BomLine>();
  for (const m of modules) {
    const existing = bomMap.get(m.ref);
    if (existing) {
      existing.quantite += 1;
      existing.poidsTotal += m.spec.poids;
    } else {
      bomMap.set(m.ref, {
        ref: m.ref,
        nom: m.spec.nom,
        quantite: 1,
        longueur: m.spec.longueur,
        poids: m.spec.poids,
        poidsTotal: m.spec.poids,
      });
    }
  }

  const bom = Array.from(bomMap.values()).sort((a, b) => a.ref.localeCompare(b.ref));
  const poidsTotal = modules.reduce((sum, m) => sum + m.spec.poids, 0);

  return {
    longueurDemandee: longueurMm,
    longueurReelle,
    rampeGauche,
    rampeDroite,
    coloris,
    modules,
    bom,
    poidsTotal,
    nbModulesTotal: modules.length,
  };
}

// ─── Longueurs prédéfinies pour le slider ───────────────────────

export const LONGUEURS_DISPONIBLES = [
  6000, 7500, 9000, 10500, 12000, 13500,
  15000, 16500, 18000, 19500, 21000, 22500,
  24000, 25500, 27000, 28500, 30000,
];

// ─── Coloris disponibles ────────────────────────────────────────

export const COLORIS = [
  { id: "quartz-blanc", nom: "Quartz Blanc", hex: "#F5F0E8", fill: "#EDE8DD" },
  { id: "basalte-noir", nom: "Basalte Noir", hex: "#2C2C2A", fill: "#3A3A38" },
  { id: "granit-gris", nom: "Granit Gris", hex: "#8B8B85", fill: "#9E9E97" },
  { id: "calcaire-jaune", nom: "Calcaire Jaune", hex: "#D4C590", fill: "#DDD0A0" },
];
