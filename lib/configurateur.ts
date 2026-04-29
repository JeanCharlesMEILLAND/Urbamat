// ─── Catalogue des modules URBAQUAI 140+50 ──────────────────────
//
// Tous les modules sont côté chaussée (voirie).
// Les rangées sont numérotées (1, 2, 3) et tout module peut être
// placé sur n'importe quelle rangée. Le nombre de rangées (2 ou 3)
// détermine la profondeur totale du quai.

export type ModuleRef =
  | "D-009"   // Rampe latérale + plaque métal galvanisé
  | "D-009a"  // Rampe arrière (avec encoche)
  | "D-009s"  // Rampe latérale "suite" — comme D-009 mais sans plaque métal
  | "D-005"   // Central standard (3000mm)
  | "D-002"   // Central standard (3000mm)
  | "D-006"   // Central (variante, 3000mm)
  | "D-007"   // Jonction 1500×1000 (chanfrein/rainures sur le côté 1m)
  | "D-007a"  // Jonction 1500×1000 nue
  | "D-008"   // Jonction 1500×1000 (chanfrein/rainures sur le côté 1.5m, gauche)
  | "D-008a"  // Miroir de D-008 (chanfrein/rainures sur le côté 1.5m, droite)
  | "D-003"   // Fin de quai droit (angle)
  | "D-003a"  // Latéral simple 1500x1500 (style central)
  | "D-004"   // Fin de quai gauche (miroir de D-003)
  | "D-004a"  // Latéral simple 1500x1500 + 4 rubans
  | "VIDE";   // Espaceur 1500mm

export type ModuleRow = 1 | 2 | 3 | 4;
export type NbRangees = 1 | 2 | 3 | 4;
export type RampeType = "laterale" | "arriere";

export interface EnvironmentConfig {
  trottoir: number;   // largeur trottoir en m (ex: 3.0)
  parking: number;    // largeur parking en m (0 = pas de parking)
  cyclable: number;   // largeur piste cyclable en m (0 = pas de piste)
  voie: number;       // largeur voie de circulation en m (ex: 3.5)
}
export type ModuleRole = "rampe" | "lateral" | "central" | "jonction" | "fin" | "vide";

export interface ModuleSpec {
  ref: ModuleRef;
  nom: string;
  longueur: number;   // mm
  largeur: number;    // mm (toujours 1500)
  hauteur: number;    // mm
  poids: number;      // kg estimé
  rang: ModuleRow;    // rangée par défaut (tout module peut aller sur n'importe quelle rangée)
  role: ModuleRole;
  description: string;
  rampeType?: RampeType;
}

export const MODULE_CATALOG: Record<ModuleRef, ModuleSpec> = {
  // ─── Rampes ────────────────────────────────────
  "D-009": {
    ref: "D-009",
    nom: "Rampe latérale",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 746,
    rang: 1,
    role: "rampe",
    rampeType: "laterale",
    description: "Rampe latérale 180→100mm (5,3%), placée en extrémité de quai",
  },
  "D-009a": {
    ref: "D-009a",
    nom: "Module de transition",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 700,
    rang: 1,
    role: "rampe",
    rampeType: "arriere",
    description: "Module de transition entre la rampe latérale (D-009s) et un central (D-002/D-005)",
  },
  "D-009s": {
    ref: "D-009s",
    nom: "Rampe latérale suite",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 746,
    rang: 1,
    role: "rampe",
    rampeType: "laterale",
    description: "Rampe latérale à biseau inversé (100→180mm), continuité de D-009",
  },


  // ─── Centraux (3000mm) ─────────────────────────
  "D-005": {
    ref: "D-005",
    nom: "Central nu",
    longueur: 3000,
    largeur: 1500,
    hauteur: 180,
    poids: 1400,
    rang: 1,
    role: "central",
    description: "Module central 3m sans chanfrein ni rainures",
  },
  "D-002": {
    ref: "D-002",
    nom: "Central standard",
    longueur: 3000,
    largeur: 1500,
    hauteur: 180,
    poids: 1400,
    rang: 1,
    role: "central",
    description: "Module central standard 3m",
  },
  "D-006": {
    ref: "D-006",
    nom: "Fin de quai (angle) 1500×1500",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 700,
    rang: 1,
    role: "fin",
    description: "Module d'angle (fin de quai) 1500x1500, comme D-003",
  },

  // ─── Jonctions (1000mm) ────────────────────────
  "D-007": {
    ref: "D-007",
    nom: "Jonction",
    longueur: 1500,
    largeur: 1000,
    hauteur: 180,
    poids: 470,
    rang: 1,
    role: "jonction",
    description: "Module de jonction 1.5×1m",
  },
  "D-007a": {
    ref: "D-007a",
    nom: "Jonction nue",
    longueur: 1500,
    largeur: 1000,
    hauteur: 180,
    poids: 470,
    rang: 1,
    role: "jonction",
    description: "Module de jonction 1.5×1m sans chanfrein ni rainures",
  },
  "D-008": {
    ref: "D-008",
    nom: "Jonction (côté long, gauche)",
    longueur: 1500,
    largeur: 1000,
    hauteur: 180,
    poids: 470,
    rang: 1,
    role: "jonction",
    description: "Jonction 1.5×1m, chanfrein/rainures côté 1.5m gauche",
  },
  "D-008a": {
    ref: "D-008a",
    nom: "Jonction (côté long, droite)",
    longueur: 1500,
    largeur: 1000,
    hauteur: 180,
    poids: 470,
    rang: 1,
    role: "jonction",
    description: "Jonction 1.5×1m, chanfrein/rainures côté 1.5m droite (miroir D-008)",
  },
  // ─── Fin de quai droit ─────────────────────────
  "D-003": {
    ref: "D-003",
    nom: "Fin de quai droit",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 700,
    rang: 1,
    role: "fin",
    description: "Module de terminaison droite (angle)",
  },
  "D-003a": {
    ref: "D-003a",
    nom: "Latéral simple",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 700,
    rang: 1,
    role: "central",
    description: "Module style central 1500x1500 (rainures de guidage simples)",
  },
  "D-004": {
    ref: "D-004",
    nom: "Fin de quai gauche",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 700,
    rang: 1,
    role: "fin",
    description: "Module de terminaison gauche (angle, miroir de D-003)",
  },
  "D-004a": {
    ref: "D-004a",
    nom: "Latéral simple avec rubans",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 700,
    rang: 1,
    role: "central",
    description: "Module style central 1500x1500 + 4 rubans partant du côté droit",
  },

  // ─── Espaceur (module vide) ────────────────────
  "VIDE": {
    ref: "VIDE",
    nom: "Vide (espaceur)",
    longueur: 1500,
    largeur: 1500,
    hauteur: 180,
    poids: 0,
    rang: 1,
    role: "vide",
    description: "Espace vide 1.5m pour décaler les modules",
  },
};

// ─── Types de résultat ──────────────────────────────────────────

export interface PlacedModule {
  ref: ModuleRef;
  spec: ModuleSpec;
  x: number;       // position X en mm depuis la gauche
  rang: ModuleRow;  // numéro de rangée (1, 2 ou 3)
}

export interface QuaiConfig {
  longueurDemandee: number; // mm
  longueurReelle: number;   // mm (calculée)
  nbRangees: NbRangees;
  rampeGauche: boolean;
  rampeDroite: boolean;
  rampeArriere: boolean;
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
  nbRangees: NbRangees;
  rampeGauche: boolean;
  rampeDroite: boolean;
  rampeArriere: boolean;
  coloris: string;
}

// ─── Algorithme de construction ─────────────────────────────────

/**
 * Construit un quai URBAQUAI à partir d'une longueur cible.
 *
 * Le quai est composé de N rangées identiques (2 ou 3), chacune côté chaussée.
 * Chaque rangée suit la même structure :
 *   - Extrémité gauche : rampe latérale (D-009) + latéral (D-003a)
 *   - Zone centrale : modules de 3000mm (D-005, D-002, D-006)
 *   - Ajustement : jonction de 1000mm (D-007) si nécessaire
 *   - Extrémité droite : fin de quai (D-003)
 *
 * Si rampeArriere est activée, des rampes D-009a sont ajoutées sur la
 * dernière rangée pour la transition quai vers trottoir.
 */
export function buildQuai(options: ConfigOptions): QuaiConfig {
  const { longueurMm, nbRangees, rampeGauche, rampeDroite, rampeArriere, coloris } = options;
  const modules: PlacedModule[] = [];

  // ─── Séquence de modules pour une rangée ──────

  /**
   * Construit la liste de refs pour une rangée donnée.
   * Chaque rangée possède la même structure linéaire :
   * [rampe?] [latéral] [centraux...] [jonction?] [fin] [rampe?]
   *
   * On alterne les variantes entre rangées pour le réalisme visuel.
   */
  function buildRowRefs(row: ModuleRow): ModuleRef[] {
    const refs: ModuleRef[] = [];
    const isVariante = row % 2 === 0; // rangées paires utilisent les variantes

    // Extrémité gauche
    if (rampeGauche) refs.push("D-009");
    refs.push("D-003a");

    // Calculer l'espace occupé par les extrémités
    const fixeGauche = refs.reduce((sum, r) => sum + MODULE_CATALOG[r].longueur, 0);

    const fixeDroiteRefs: ModuleRef[] = [];
    fixeDroiteRefs.push("D-003");
    if (rampeDroite) fixeDroiteRefs.push("D-009");
    const fixeDroite = fixeDroiteRefs.reduce((sum, r) => sum + MODULE_CATALOG[r].longueur, 0);

    // Espace central à remplir
    const espaceDisponible = longueurMm - fixeGauche - fixeDroite;
    let restant = Math.max(espaceDisponible, 0);

    const nbModules3m = Math.floor(restant / 3000);
    restant -= nbModules3m * 3000;

    // Si le reste est >= 500mm, ajouter une jonction de 1000mm
    const besoinJonction = restant >= 500;

    // Modules centraux
    for (let i = 0; i < nbModules3m; i++) {
      // Alterner les variantes centrales
      // Alterne D-002 (rangées paires) et D-005 (rangées impaires) pour le réalisme
      refs.push(isVariante ? "D-002" : "D-005");
    }

    // Jonction si nécessaire
    if (besoinJonction) {
      refs.push("D-007");
    }

    // Extrémité droite
    refs.push(...fixeDroiteRefs);

    return refs;
  }

  // ─── Construire chaque rangée ──────────────────

  let longueurReelle = 0;

  for (let row = 1; row <= nbRangees; row++) {
    const rowNum = row as ModuleRow;
    const rowRefs = buildRowRefs(rowNum);

    let x = 0;
    for (const ref of rowRefs) {
      const spec = MODULE_CATALOG[ref];
      modules.push({ ref, spec, x, rang: rowNum });
      x += spec.longueur;
    }

    // Ajouter les rampes arrière sur la dernière rangée si demandé
    if (rampeArriere && row === nbRangees) {
      // Les rampes arrière sont placées le long de la rangée arrière
      // pour la transition vers le trottoir
      const spec = MODULE_CATALOG["D-009a"];
      modules.push({ ref: "D-009a", spec, x: 0, rang: rowNum });
    }

    // La longueur réelle est le maximum de toutes les rangées
    if (x > longueurReelle) {
      longueurReelle = x;
    }
  }

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
    nbRangees,
    rampeGauche,
    rampeDroite,
    rampeArriere,
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
