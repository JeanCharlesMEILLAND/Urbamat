/**
 * 5 styles graphiques alternatifs pour les schémas de configurations URBAQUAI.
 *
 * Convention :
 * - Le trottoir existant n'est PAS modifié (URBAQUAI est provisoire/modulaire)
 * - Le quai est POSÉ SUR LA CHAUSSÉE (asphalte gris)
 * - Caniveau de 250 mm entre la bordure du trottoir et l'arrière du quai
 * - Plaque métal galvanisée 510 mm fait le pont au-dessus du caniveau
 *
 * Le QUAI est dessiné FIDÈLEMENT (D-004 + D-002 + D-003 avec rubans, rainures,
 * joints, plots d'ancrage) et identique dans les 5 styles. Seuls les éléments
 * autour (bus, voitures, voyageurs, arbres, palette) changent entre styles.
 */

import type { ReactElement } from "react";

/* Échelle 24 px/m — quai 10m × 3m = 240 × 72 px */
const QUAI_X = 70;
const QUAI_W = 240;
const QUAI_DEPTH = 72;            // 2 rangs de 1,5 m
const ROW_DEPTH = QUAI_DEPTH / 2; // 36 px = 1,5 m
const CANIVEAU_DEPTH = 6;         // 250 mm asphalte (invisible)
const METAL_PLATE_DEPTH = 5;      // plaque métal galvanisée 510 mm

/* Largeurs des modules dans chaque rang (à 24 px/m) — total 240 */
const MODULE_WIDTHS = [
  36, // D-004 / D-004a — 1500 mm
  72, // D-005 / D-002  — 3000 mm
  24, // D-007 / D-007a — 1000 mm (jonction)
  72, // D-005 / D-002  — 3000 mm
  36, // D-003 / D-003a — 1500 mm
];

/* ════════════════════════════════════════════════════════════════════════
 * QuaiSchematic — vue de dessus FIDÈLE du double quai démo (10m × 3m)
 *
 * Composition (template par défaut du configurateur) :
 *   Rang 1 (arrière, contre caniveau) : D-004a + D-005 + D-007a + D-005 + D-003a
 *   Rang 2 (avant, chaussée)          : D-004  + D-002 + D-007  + D-002 + D-003
 *
 * Détails reproduits :
 *   - Plaque métal galvanisée sur toute la longueur (au-dessus du rang 1)
 *   - Rubans clairs sur D-004a (1er module rang 1) — 4 bandes parallèles
 *   - Rainure de guidage horizontale traversant les deux rangs
 *   - Joints inter-modules (verticaux + horizontal entre rangs)
 *   - Plots d'ancrage : 4 dots par module (grille 2×2)
 *   - Chamfers sur D-004 et D-003 (fins de quai rang 2, côté chaussée)
 * ════════════════════════════════════════════════════════════════════════ */

interface QuaiSchematicProps {
  x: number;
  y: number;
  w?: number;
  d?: number;
  concrete?: string;
  joint?: string;
  ruban?: string;
  rainure?: string;
  pad?: string;
  metalPlate?: string;
  metalPlateStroke?: string;
  shadow?: boolean;
  withSideFace?: boolean;
  /** Ajoute 2 rampes acier aux extrémités gauche/droite du quai
   *  (config piste cyclable : permet aux vélos de transiter entre la chaussée
   *  et le trottoir au niveau du bus stop). */
  withEndRamps?: boolean;
  /** Mode "îlot" — le rang 1 est un miroir du rang 2 (biseaux sur les 4 coins
   *  extérieurs, pas de plaque métal arrière, pas de rubans). Pour les configs
   *  où le bus s'arrête des 2 côtés du quai. */
  islandMode?: boolean;
}

function QuaiSchematic({
  x,
  y,
  w = QUAI_W,
  d = QUAI_DEPTH,
  concrete = "#B8B2A4",
  joint = "#7A7363",
  ruban = "#E8E2D2",      // CLAIR — comme sur le 3D granit-gris (contraste)
  rainure = "#4A453E",
  pad = "#2A2624",
  metalPlate = "#A8AAB0",
  metalPlateStroke,
  shadow = false,
  withSideFace = false,
  withEndRamps = false,
  islandMode = false,
}: QuaiSchematicProps) {
  const rowD = d / 2;
  const chamferSize = 3;

  // Calcule les positions X cumulatives des modules
  const positions: number[] = [0];
  for (let i = 0; i < MODULE_WIDTHS.length - 1; i++) {
    positions.push(positions[i] + MODULE_WIDTHS[i]);
  }

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Ombre portée optionnelle (style marketing) */}
      {shadow && <rect x={1.5} y={1.5} width={w} height={d} rx={1} fill="#000" opacity={0.18} />}

      {/* Face latérale isométrique droite */}
      {withSideFace && (
        <polygon points={`${w},0 ${w + 4},-2 ${w + 4},${d - 2} ${w},${d}`} fill={joint} />
      )}

      {/* ─── Plaque métal galvanisée (toute la longueur, au-dessus du rang 1) ───
       *   Cachée en config piste cyclable (la piste joue le rôle de plate-forme)
       *   ET en mode îlot (pas de trottoir derrière, le quai est au milieu de la route). */}
      {!withEndRamps && !islandMode && (
        <>
          <rect
            x={-1}
            y={-METAL_PLATE_DEPTH}
            width={w + 2}
            height={METAL_PLATE_DEPTH + 1}
            fill={metalPlate}
            stroke={metalPlateStroke}
            strokeWidth={metalPlateStroke ? 0.4 : 0}
          />
          <line x1={0} y1={-METAL_PLATE_DEPTH + 1} x2={w} y2={-METAL_PLATE_DEPTH + 1} stroke="#FFFFFF" strokeWidth={0.4} opacity={0.5} />
          <line x1={0} y1={-1} x2={w} y2={-1} stroke="#000000" strokeWidth={0.3} opacity={0.25} />
        </>
      )}

      {/* ═══ RANG 1 ═══════════════════════════════════════════════════════════
       *   Mode normal : rectangle plat avec rubans D-004a sur le côté gauche
       *   Mode îlot   : MIROIR du rang 2 (biseaux aux 2 coins TOP, pas de rubans) */}
      {islandMode ? (
        <>
          {/* D-004 mirroir (top-gauche) avec chamfer côté chaussée externe (top) */}
          <path
            d={`M0 ${chamferSize} L${chamferSize} 0 L${MODULE_WIDTHS[0]} 0 L${MODULE_WIDTHS[0]} ${rowD} L0 ${rowD} Z`}
            fill={concrete}
          />
          {/* Centre rectangulaire */}
          <rect x={MODULE_WIDTHS[0]} y={0} width={w - MODULE_WIDTHS[0] - MODULE_WIDTHS[4]} height={rowD} fill={concrete} />
          {/* D-003 mirroir (top-droite) avec chamfer */}
          <path
            d={`M${w - MODULE_WIDTHS[4]} 0 L${w - chamferSize} 0 L${w} ${chamferSize} L${w} ${rowD} L${w - MODULE_WIDTHS[4]} ${rowD} Z`}
            fill={concrete}
          />
          {/* Bordures rang 1 (sans top-line continue, à cause des biseaux) */}
          <line x1={0} y1={chamferSize} x2={0} y2={rowD} stroke={joint} strokeWidth={0.6} />
          <line x1={0} y1={chamferSize} x2={chamferSize} y2={0} stroke={joint} strokeWidth={0.6} />
          <line x1={chamferSize} y1={0} x2={w - chamferSize} y2={0} stroke={joint} strokeWidth={0.6} />
          <line x1={w - chamferSize} y1={0} x2={w} y2={chamferSize} stroke={joint} strokeWidth={0.6} />
          <line x1={w} y1={chamferSize} x2={w} y2={rowD} stroke={joint} strokeWidth={0.6} />
        </>
      ) : (
        <>
          {/* Rang 1 standard — rectangle plat avec rubans D-004a sur la gauche */}
          <rect x={0} y={0} width={w} height={rowD} fill={concrete} />
          {/* Rubans clairs verticaux — 4 traits clusterisés (D-004a + D-004 alignés) */}
          {[0.32, 0.40, 0.48, 0.56].map((rx, i) => (
            <line
              key={`ruban-${i}`}
              x1={MODULE_WIDTHS[0] * rx}
              y1={3}
              x2={MODULE_WIDTHS[0] * rx}
              y2={d - 3}
              stroke={ruban}
              strokeWidth={0.8}
              strokeLinecap="round"
            />
          ))}
          {/* Bordure rang 1 standard */}
          <rect x={0} y={0} width={w} height={rowD} fill="none" stroke={joint} strokeWidth={0.6} />
        </>
      )}

      {/* Joints verticaux entre modules du rang 1 (commun aux deux modes) */}
      {positions.slice(1).map((px, i) => (
        <line
          key={`r1-joint-${i}`}
          x1={px}
          y1={islandMode && (i === 0 || i === positions.length - 2) ? chamferSize : 0}
          x2={px}
          y2={rowD}
          stroke={joint}
          strokeWidth={0.7}
          opacity={0.6}
        />
      ))}

      {/* ═══ RANG 2 (avant — chaussée) ═══════════════════════════════════════ */}
      {/* Fond béton — D-004 (gauche) avec chamfer chaussée */}
      <path
        d={`M0 ${rowD}
            L${MODULE_WIDTHS[0]} ${rowD}
            L${MODULE_WIDTHS[0]} ${d}
            L${chamferSize} ${d}
            L0 ${d - chamferSize} Z`}
        fill={concrete}
      />
      {/* Modules centraux du rang 2 (rectangulaires) */}
      <rect x={MODULE_WIDTHS[0]} y={rowD} width={w - MODULE_WIDTHS[0] - MODULE_WIDTHS[4]} height={rowD} fill={concrete} />
      {/* D-003 (droite) avec chamfer chaussée */}
      <path
        d={`M${w - MODULE_WIDTHS[4]} ${rowD}
            L${w} ${rowD}
            L${w} ${d - chamferSize}
            L${w - chamferSize} ${d}
            L${w - MODULE_WIDTHS[4]} ${d} Z`}
        fill={concrete}
      />

      {/* Joints verticaux du rang 2 */}
      {positions.slice(1).map((px, i) => (
        <line
          key={`r2-joint-${i}`}
          x1={px}
          y1={rowD}
          x2={px}
          y2={d}
          stroke={joint}
          strokeWidth={0.7}
          opacity={0.6}
        />
      ))}

      {/* Bordure rang 2 (sans la ligne supérieure qui est le joint inter-rangs) */}
      <line x1={0} y1={d - chamferSize} x2={chamferSize} y2={d} stroke={joint} strokeWidth={0.6} />
      <line x1={chamferSize} y1={d} x2={w - chamferSize} y2={d} stroke={joint} strokeWidth={0.6} />
      <line x1={w - chamferSize} y1={d} x2={w} y2={d - chamferSize} stroke={joint} strokeWidth={0.6} />
      <line x1={w} y1={d - chamferSize} x2={w} y2={rowD} stroke={joint} strokeWidth={0.6} />
      <line x1={0} y1={d - chamferSize} x2={0} y2={rowD} stroke={joint} strokeWidth={0.6} />

      {/* ─── Joint inter-rangs (horizontal) ─── */}
      <line x1={0} y1={rowD} x2={w} y2={rowD} stroke={joint} strokeWidth={0.8} opacity={0.7} />

      {/* ─── Rainure de guidage qui traverse les deux rangs (au milieu) ─── */}
      <line x1={4} y1={rowD - 0.5} x2={w - 4} y2={rowD - 0.5} stroke={rainure} strokeWidth={0.5} opacity={0.7} />
      <line x1={4} y1={rowD + 0.5} x2={w - 4} y2={rowD + 0.5} stroke={rainure} strokeWidth={0.5} opacity={0.7} />

      {/* ─── Plots d'ancrage : 4 par module dans chaque rang (grille 2×2) ─── */}
      {[0, 1].map((rowIdx) => {
        const yOffset = rowIdx * rowD;
        return positions.map((px, i) => {
          const modW = MODULE_WIDTHS[i];
          const isJonction = modW === 24;
          // 2 plots si jonction (étroit), sinon 4 plots aux 4 angles
          if (isJonction) {
            return (
              <g key={`pads-r${rowIdx}-${i}`}>
                <rect x={px + modW * 0.30} y={yOffset + 5} width={1.8} height={1.8} fill={pad} />
                <rect x={px + modW * 0.30} y={yOffset + rowD - 7} width={1.8} height={1.8} fill={pad} />
              </g>
            );
          }
          return (
            <g key={`pads-r${rowIdx}-${i}`}>
              <rect x={px + modW * 0.18} y={yOffset + 5} width={1.8} height={1.8} fill={pad} />
              <rect x={px + modW * 0.82} y={yOffset + 5} width={1.8} height={1.8} fill={pad} />
              <rect x={px + modW * 0.18} y={yOffset + rowD - 7} width={1.8} height={1.8} fill={pad} />
              <rect x={px + modW * 0.82} y={yOffset + rowD - 7} width={1.8} height={1.8} fill={pad} />
            </g>
          );
        });
      })}

      {/* ─── Rampes latérales D-009 + D-009s — config piste cyclable ───
       *   D-009  : rampe latérale gauche, HAUT à droite (touche le quai), BAS à gauche
       *            + plaque métal galvanisée 510 mm prolongeant la pente jusqu'à la chaussée
       *   D-009s : miroir de D-009 (HAUT à gauche, BAS à droite + plaque métal)
       *   Catalogue : 1500×1500×180mm → 36×36 px à 24px/m. Plaque ≈ 12px de large. */}
      {withEndRamps && (
        <>
          {/* D-009 (gauche) */}
          <g transform={`translate(-36, 0)`}>
            {/* Plaque métal galvanisée 510 mm en EXTENSION du BAS (côté chaussée, à gauche) */}
            <rect x={-12} y={1} width={12} height={rowD - 2} fill={metalPlate} stroke={metalPlateStroke ?? joint} strokeWidth={0.4} />
            {/* Effet brushed sur la plaque */}
            <line x1={-12} y1={2} x2={0} y2={2} stroke="#FFFFFF" strokeWidth={0.4} opacity={0.5} />
            <line x1={-12} y1={rowD - 2} x2={0} y2={rowD - 2} stroke="#000000" strokeWidth={0.3} opacity={0.25} />

            {/* Module D-009 béton */}
            <rect width={36} height={rowD} fill={concrete} stroke={joint} strokeWidth={0.5} />
            {/* Hachures de pente : haut à droite, bas à gauche */}
            {[2, 6, 10, 14, 18, 22, 26, 30].map((i) => (
              <line
                key={`d009-l-${i}`}
                x1={i + 4}
                y1={3}
                x2={i - 4}
                y2={rowD - 3}
                stroke={joint}
                strokeWidth={0.5}
                opacity={0.55}
              />
            ))}
            {/* 4 plots d'ancrage */}
            <rect x={6} y={5} width={1.8} height={1.8} fill={pad} />
            <rect x={28} y={5} width={1.8} height={1.8} fill={pad} />
            <rect x={6} y={rowD - 7} width={1.8} height={1.8} fill={pad} />
            <rect x={28} y={rowD - 7} width={1.8} height={1.8} fill={pad} />
            <text x={18} y={rowD / 2 + 2} textAnchor="middle" fontSize={5.5} fontFamily="ui-monospace" fill={pad} opacity={0.55}>
              D-009
            </text>
          </g>

          {/* D-009s (droite) — miroir avec plaque métal côté droit */}
          <g transform={`translate(${w}, 0)`}>
            {/* Module D-009s béton */}
            <rect width={36} height={rowD} fill={concrete} stroke={joint} strokeWidth={0.5} />
            {[2, 6, 10, 14, 18, 22, 26, 30].map((i) => (
              <line
                key={`d009-r-${i}`}
                x1={i - 4}
                y1={3}
                x2={i + 4}
                y2={rowD - 3}
                stroke={joint}
                strokeWidth={0.5}
                opacity={0.55}
              />
            ))}
            <rect x={6} y={5} width={1.8} height={1.8} fill={pad} />
            <rect x={28} y={5} width={1.8} height={1.8} fill={pad} />
            <rect x={6} y={rowD - 7} width={1.8} height={1.8} fill={pad} />
            <rect x={28} y={rowD - 7} width={1.8} height={1.8} fill={pad} />
            <text x={18} y={rowD / 2 + 2} textAnchor="middle" fontSize={5.5} fontFamily="ui-monospace" fill={pad} opacity={0.55}>
              D-009s
            </text>

            {/* Plaque métal galvanisée 510 mm en EXTENSION du BAS (côté chaussée, à droite) */}
            <rect x={36} y={1} width={12} height={rowD - 2} fill={metalPlate} stroke={metalPlateStroke ?? joint} strokeWidth={0.4} />
            <line x1={36} y1={2} x2={48} y2={2} stroke="#FFFFFF" strokeWidth={0.4} opacity={0.5} />
            <line x1={36} y1={rowD - 2} x2={48} y2={rowD - 2} stroke="#000000" strokeWidth={0.3} opacity={0.25} />
          </g>
        </>
      )}
    </g>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Plaque métal galvanisée — pont 510mm au-dessus du caniveau
 * (le caniveau lui-même est juste de l'asphalte, donc INVISIBLE car
 *  même couleur que le reste de la chaussée — la route reste continue)
 * ════════════════════════════════════════════════════════════════════════ */

function MetalPlate({
  y,
  color,
  stroke,
}: {
  y: number;
  color: string;
  stroke?: string;
}) {
  return (
    <rect
      x={QUAI_X + QUAI_W / 2 - 25}
      y={y + 1}
      width={50}
      height={CANIVEAU_DEPTH - 2}
      fill={color}
      stroke={stroke}
      strokeWidth={stroke ? 0.4 : 0}
      rx={1}
    />
  );
}

/** @deprecated alias rétrocompat pour ne pas casser les call-sites — délègue à MetalPlate */
function CaniveauStrip({
  y,
  metalColor,
  metalStroke,
}: {
  y: number;
  fromX?: number;
  toX?: number;
  caniveauColor?: string;
  metalColor: string;
  metalStroke?: string;
}) {
  return <MetalPlate y={y} color={metalColor} stroke={metalStroke} />;
}

/* ════════════════════════════════════════════════════════════════════════
 * STYLE A — "Plan technique CERTU"
 * Sobre, pas de bus/voitures, rectangles cotés numérotés
 * ════════════════════════════════════════════════════════════════════════ */

const A = {
  trottoir: "#F4EFE3",
  chaussee: "#D8D2C2",
  caniveau: "#9B9489",
  metalPlate: "#B8B8B8",
  trait: "#1F2937",
  marquage: "#FFFFFF",
  velo: "#F0E7C8",
  concrete: "#BDB6A6",
  joint: "#7E7768",
  ruban: "#1F2937",
  rainure: "#3D3A37",
  pad: "#1F2937",
};

function NumberedTagA({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r={8} fill="#FFFFFF" stroke={A.trait} strokeWidth={1} />
      <text textAnchor="middle" y={3} fontSize={10} fontWeight="bold" fontFamily="ui-sans-serif" fill={A.trait}>{n}</text>
    </g>
  );
}

const quaiThemeA = {
  concrete: A.concrete, joint: A.joint, ruban: A.ruban, rainure: A.rainure, pad: A.pad,
};

/* viewBox 380×260 pour accommoder le double quai 72px + bus + axial sous-jacents */
const VBOX_AVANCEE = "0 0 380 260";
const VBOX_ILE = "0 0 380 280";

export function StyleA_Avancee() {
  return (
    <svg viewBox={VBOX_AVANCEE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={30} fill={A.trottoir} />
      <line x1={0} y1={30} x2={380} y2={30} stroke={A.trait} strokeWidth={0.8} />
      <rect x={0} y={30} width={380} height={230} fill={A.chaussee} />
      <QuaiSchematic x={QUAI_X} y={36} {...quaiThemeA} metalPlate={A.metalPlate} metalPlateStroke={A.trait} />
      <line x1={0} y1={200} x2={380} y2={200} stroke={A.marquage} strokeWidth={1.2} strokeDasharray="8 6" />
      <NumberedTagA x={50} y={15} n={1} />
      <NumberedTagA x={350} y={33} n={2} />
      <NumberedTagA x={190} y={72} n={3} />
      <NumberedTagA x={350} y={150} n={4} />
    </svg>
  );
}

export function StyleA_AvanceeVelo() {
  // Piste cyclable = 36px (= 1 rang = 1,5m). Quai se pose dessus : rang 1 overlap la piste.
  const sidewalkY = 30, bikeY = sidewalkY, bikeH = ROW_DEPTH; // 36
  return (
    <svg viewBox={VBOX_AVANCEE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={A.trottoir} />
      <line x1={0} y1={sidewalkY} x2={380} y2={sidewalkY} stroke={A.trait} strokeWidth={0.6} />
      <rect x={0} y={bikeY} width={380} height={bikeH} fill={A.velo} />
      <line x1={0} y1={bikeY + bikeH} x2={380} y2={bikeY + bikeH} stroke={A.trait} strokeWidth={0.4} />
      <rect x={0} y={bikeY + bikeH} width={380} height={260 - (bikeY + bikeH)} fill={A.chaussee} />
      {/* Quai posé sur la piste cyclable : son rang 1 occupe la piste */}
      <QuaiSchematic x={QUAI_X} y={bikeY} {...quaiThemeA} metalPlate={A.metalPlate} metalPlateStroke={A.trait} withEndRamps />
      <line x1={0} y1={210} x2={380} y2={210} stroke={A.marquage} strokeWidth={1.2} strokeDasharray="8 6" />
      <NumberedTagA x={50} y={15} n={1} />
      <NumberedTagA x={50} y={48} n={2} />
      <NumberedTagA x={350} y={48} n={3} />
      <NumberedTagA x={190} y={92} n={4} />
      <NumberedTagA x={350} y={160} n={5} />
    </svg>
  );
}

export function StyleA_Ile() {
  const sidewalkY = 24, busLaneH = 36, quaiY = sidewalkY + busLaneH + 6, otherLaneY = quaiY + QUAI_DEPTH + 6;
  return (
    <svg viewBox={VBOX_ILE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={A.trottoir} />
      <line x1={0} y1={sidewalkY} x2={380} y2={sidewalkY} stroke={A.trait} strokeWidth={0.8} />
      <rect x={0} y={sidewalkY} width={380} height={280 - sidewalkY} fill={A.chaussee} />
      <QuaiSchematic x={QUAI_X} y={quaiY} {...quaiThemeA} metalPlate={A.metalPlate} metalPlateStroke={A.trait} islandMode />
      {[26, 32, 38, 44, 50].map((y) => (
        <rect key={y} x={QUAI_X + QUAI_W / 2 - 6} y={y} width={12} height={3} fill={A.marquage} stroke={A.trait} strokeWidth={0.3} />
      ))}
      <line x1={0} y1={otherLaneY + 30} x2={380} y2={otherLaneY + 30} stroke={A.marquage} strokeWidth={1.2} strokeDasharray="8 6" />
      <NumberedTagA x={50} y={12} n={1} />
      <NumberedTagA x={50} y={42} n={2} />
      <NumberedTagA x={190} y={150} n={3} />
      <NumberedTagA x={50} y={210} n={4} />
    </svg>
  );
}

export function StyleA_IleVelo() {
  const sidewalkY = 22, bikeH = ROW_DEPTH, busLaneH = 36, curbY = sidewalkY + bikeH;
  const quaiY = curbY + busLaneH + 6, otherLaneY = quaiY + QUAI_DEPTH + 6;
  return (
    <svg viewBox={VBOX_ILE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={A.trottoir} />
      <rect x={0} y={sidewalkY} width={380} height={bikeH} fill={A.velo} />
      <line x1={0} y1={curbY} x2={380} y2={curbY} stroke={A.trait} strokeWidth={0.8} />
      <rect x={0} y={curbY} width={380} height={280 - curbY} fill={A.chaussee} />
      <QuaiSchematic x={QUAI_X} y={quaiY} {...quaiThemeA} metalPlate={A.metalPlate} metalPlateStroke={A.trait} islandMode />
      {[24, 30, 36, 42, 48, 54, 60, 66].map((y) => (
        <rect key={y} x={QUAI_X + QUAI_W / 2 - 6} y={y} width={12} height={3} fill={A.marquage} stroke={A.trait} strokeWidth={0.3} />
      ))}
      <line x1={0} y1={otherLaneY + 30} x2={380} y2={otherLaneY + 30} stroke={A.marquage} strokeWidth={1.2} strokeDasharray="8 6" />
      <NumberedTagA x={50} y={11} n={1} />
      <NumberedTagA x={50} y={29} n={2} />
      <NumberedTagA x={50} y={50} n={3} />
      <NumberedTagA x={190} y={155} n={4} />
      <NumberedTagA x={50} y={215} n={5} />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * STYLE B — "Plan illustré IDFM"
 * Bus simplifié, palette CEREMA
 * ════════════════════════════════════════════════════════════════════════ */

const B = {
  trottoir: "#EFE9D9",
  chaussee: "#5C636E",
  caniveau: "#3A4048",
  metalPlate: "#A8A8A8",
  velo: "#BBF7D0",
  veloLine: "#16A34A",
  marquage: "#F5E9B5",
  bus: "#0F172A",
  busWindow: "#94A3B8",
};

const quaiThemeB = { concrete: "#C8C2B5", joint: "#8E867A", ruban: "#1F1C19", rainure: "#3D3A37", pad: "#2A2624" };

function BusB({ x, y, w = 100, h = 24 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={w} height={h} rx={3} fill={B.bus} />
      <rect x={5} y={5} width={w - 10} height={5} fill={B.busWindow} opacity={0.7} />
    </g>
  );
}

export function StyleB_Avancee() {
  // Le quai remplace une portion de la file de stationnement le long du trottoir.
  // Les places de parking restent visibles avant ET après le quai.
  return (
    <svg viewBox={VBOX_AVANCEE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={30} fill={B.trottoir} />
      <rect x={0} y={30} width={380} height={230} fill={B.chaussee} />

      {/* Places de parking le long du trottoir, de chaque côté du quai
       *  (1 place ≈ 5m × 2m → 120 × 48 px ; on en met 1 à gauche et 1 à droite). */}
      {/* Place gauche */}
      <rect x={6} y={36} width={58} height={48} fill="none" stroke={"#FFFFFF"} strokeWidth={1} />
      <line x1={6} y1={36} x2={6} y2={84} stroke={"#FFFFFF"} strokeWidth={1} />
      {/* Place droite */}
      <rect x={QUAI_X + QUAI_W + 6} y={36} width={58} height={48} fill="none" stroke={"#FFFFFF"} strokeWidth={1} />
      <line x1={374} y1={36} x2={374} y2={84} stroke={"#FFFFFF"} strokeWidth={1} />

      <QuaiSchematic x={QUAI_X} y={36} {...quaiThemeB} metalPlate={B.metalPlate} />

      {/* Ligne axiale au milieu de la chaussée visible (entre voie bus et voie inverse) */}
      <line x1={0} y1={170} x2={380} y2={170} stroke={B.marquage} strokeWidth={1.2} strokeDasharray="8 6" />
    </svg>
  );
}

export function StyleB_AvanceeVelo() {
  const sidewalkY = 30, bikeY = sidewalkY, bikeH = ROW_DEPTH;
  return (
    <svg viewBox={VBOX_AVANCEE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={B.trottoir} />
      <rect x={0} y={bikeY} width={380} height={bikeH} fill={B.velo} />
      <line x1={0} y1={bikeY} x2={380} y2={bikeY} stroke={B.veloLine} strokeWidth={0.6} strokeDasharray="3 3" />
      <line x1={0} y1={bikeY + bikeH} x2={380} y2={bikeY + bikeH} stroke={B.veloLine} strokeWidth={0.6} strokeDasharray="3 3" />
      <rect x={0} y={bikeY + bikeH} width={380} height={260 - (bikeY + bikeH)} fill={B.chaussee} />
      <QuaiSchematic x={QUAI_X} y={bikeY} {...quaiThemeB} metalPlate={B.metalPlate} withEndRamps />
      <line x1={0} y1={210} x2={380} y2={210} stroke={B.marquage} strokeWidth={1.2} strokeDasharray="8 6" />
    </svg>
  );
}

export function StyleB_Ile() {
  const sidewalkY = 24, busLaneH = 36, quaiY = sidewalkY + busLaneH + 6, otherLaneY = quaiY + QUAI_DEPTH + 6;
  return (
    <svg viewBox={VBOX_ILE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={B.trottoir} />
      <rect x={0} y={sidewalkY} width={380} height={280 - sidewalkY} fill={B.chaussee} />
      <QuaiSchematic x={QUAI_X} y={quaiY} {...quaiThemeB} metalPlate={B.metalPlate} islandMode />
      {[26, 32, 38, 44, 50].map((y) => (
        <rect key={y} x={QUAI_X + QUAI_W / 2 - 6} y={y} width={12} height={3} fill={B.marquage} />
      ))}
      <line x1={0} y1={otherLaneY + 30} x2={380} y2={otherLaneY + 30} stroke={B.marquage} strokeWidth={1.2} strokeDasharray="8 6" />
    </svg>
  );
}

export function StyleB_IleVelo() {
  const sidewalkY = 22, bikeH = ROW_DEPTH, busLaneH = 36, curbY = sidewalkY + bikeH;
  const quaiY = curbY + busLaneH + 6, otherLaneY = quaiY + QUAI_DEPTH + 6;
  return (
    <svg viewBox={VBOX_ILE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={B.trottoir} />
      <rect x={0} y={sidewalkY} width={380} height={bikeH} fill={B.velo} />
      <rect x={0} y={curbY} width={380} height={280 - curbY} fill={B.chaussee} />
      <QuaiSchematic x={QUAI_X} y={quaiY} {...quaiThemeB} metalPlate={B.metalPlate} islandMode />
      {[24, 30, 36, 42, 48, 54, 60, 66].map((y) => (
        <rect key={y} x={QUAI_X + QUAI_W / 2 - 6} y={y} width={12} height={3} fill={B.marquage} />
      ))}
      <line x1={0} y1={otherLaneY + 30} x2={380} y2={otherLaneY + 30} stroke={B.marquage} strokeWidth={1.2} strokeDasharray="8 6" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * STYLE C — "Isométrique léger"
 * Quai avec face latérale visible (relief 16cm)
 * ════════════════════════════════════════════════════════════════════════ */

const C = {
  trottoir: "#F5EFE0",
  chaussee: "#6B7280",
  caniveau: "#3F4754",
  metalPlate: "#A0A0A0",
  velo: "#86C09A",
  bus: "#1F2937",
  busSide: "#0F172A",
  busWindow: "#CBD5E1",
  arbre: "#4ADE80",
  arbreTrunk: "#7C2D12",
  marquage: "#F5E9B5",
};

const quaiThemeC = { concrete: "#C8C2B5", joint: "#8E867A", ruban: "#1F1C19", rainure: "#3D3A37", pad: "#2A2624", withSideFace: true };

function IsoBus({ x, y, w = 90, h = 22 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <polygon points={`${w},0 ${w + 4},-2 ${w + 4},${h - 2} ${w},${h}`} fill={C.busSide} />
      <rect width={w} height={h} rx={2} fill={C.bus} />
      <rect x={4} y={4} width={w - 8} height={4} fill={C.busWindow} />
    </g>
  );
}

export function StyleC_Avancee() {
  return (
    <svg viewBox={VBOX_AVANCEE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={28} fill={C.trottoir} />
      <circle cx={50} cy={16} r={9} fill={C.arbre} />
      <rect x={48} y={16} width={4} height={10} fill={C.arbreTrunk} />
      <circle cx={330} cy={16} r={9} fill={C.arbre} />
      <rect x={328} y={16} width={4} height={10} fill={C.arbreTrunk} />
      <rect x={0} y={28} width={380} height={232} fill={C.chaussee} />
      <QuaiSchematic x={QUAI_X} y={34} {...quaiThemeC} metalPlate={C.metalPlate} />
      <line x1={0} y1={195} x2={380} y2={195} stroke={C.marquage} strokeWidth={1.2} strokeDasharray="8 6" />
    </svg>
  );
}

export function StyleC_AvanceeVelo() {
  const sidewalkY = 30, bikeY = sidewalkY, bikeH = ROW_DEPTH;
  return (
    <svg viewBox={VBOX_AVANCEE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={C.trottoir} />
      <rect x={0} y={bikeY} width={380} height={bikeH} fill={C.velo} />
      <rect x={0} y={bikeY + bikeH} width={380} height={260 - (bikeY + bikeH)} fill={C.chaussee} />
      <QuaiSchematic x={QUAI_X} y={bikeY} {...quaiThemeC} metalPlate={C.metalPlate} withEndRamps />
      <line x1={0} y1={210} x2={380} y2={210} stroke={C.marquage} strokeWidth={1.2} strokeDasharray="8 6" />
    </svg>
  );
}

export function StyleC_Ile() {
  const sidewalkY = 22, busLaneH = 36, quaiY = sidewalkY + busLaneH + 6, otherLaneY = quaiY + QUAI_DEPTH + 6;
  return (
    <svg viewBox={VBOX_ILE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={C.trottoir} />
      <rect x={0} y={sidewalkY} width={380} height={280 - sidewalkY} fill={C.chaussee} />
      <QuaiSchematic x={QUAI_X} y={quaiY} {...quaiThemeC} metalPlate={C.metalPlate} islandMode />
      {[24, 30, 36, 42, 48].map((y) => (
        <rect key={y} x={QUAI_X + QUAI_W / 2 - 6} y={y} width={12} height={3} fill="#FDE047" />
      ))}
      <line x1={0} y1={otherLaneY + 30} x2={380} y2={otherLaneY + 30} stroke={C.marquage} strokeWidth={1.2} strokeDasharray="8 6" />
    </svg>
  );
}

export function StyleC_IleVelo() {
  const sidewalkY = 20, bikeH = ROW_DEPTH, busLaneH = 36, curbY = sidewalkY + bikeH;
  const quaiY = curbY + busLaneH + 6, otherLaneY = quaiY + QUAI_DEPTH + 6;
  return (
    <svg viewBox={VBOX_ILE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={C.trottoir} />
      <rect x={0} y={sidewalkY} width={380} height={bikeH} fill={C.velo} />
      <rect x={0} y={curbY} width={380} height={280 - curbY} fill={C.chaussee} />
      <QuaiSchematic x={QUAI_X} y={quaiY} {...quaiThemeC} metalPlate={C.metalPlate} islandMode />
      {[22, 28, 34, 40, 46, 52, 58, 64].map((y) => (
        <rect key={y} x={QUAI_X + QUAI_W / 2 - 6} y={y} width={12} height={3} fill="#FDE047" />
      ))}
      <line x1={0} y1={otherLaneY + 30} x2={380} y2={otherLaneY + 30} stroke={C.marquage} strokeWidth={1.2} strokeDasharray="8 6" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * STYLE D — "Marketing illustré"
 * Voyageurs, arbres, ombre portée
 * ════════════════════════════════════════════════════════════════════════ */

const D = {
  trottoir: "#FAF6E8",
  chaussee: "#3F4754",
  caniveau: "#1F2937",
  metalPlate: "#C8C8C8",
  velo: "#86EFAC",
  veloLine: "#14532D",
  bus: "#0F172A",
  busAccent: "#3B82F6",
  busWindow: "#DBEAFE",
  arbre: "#4ADE80",
  arbreShadow: "#16A34A",
  arbreTrunk: "#7C2D12",
  passager: "#FEF3C7",
  passagerHair: "#1F2937",
  marquage: "#FEF3C7",
};

const quaiThemeD = { concrete: "#D4CCB8", joint: "#9B9180", ruban: "#1F1C19", rainure: "#4A4640", pad: "#2A2624", shadow: true };

function ArbreD({ x, y, r = 10 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <ellipse cx={0} cy={2} rx={r * 0.9} ry={r * 0.4} fill="#000" opacity={0.15} />
      <circle r={r} fill={D.arbreShadow} />
      <circle r={r - 2} cx={-1.5} cy={-1.5} fill={D.arbre} />
      <rect x={-2} y={r * 0.6} width={4} height={r * 0.7} fill={D.arbreTrunk} />
    </g>
  );
}

function PassagerD({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r={3} fill={D.passagerHair} />
      <ellipse cx={0} cy={5} rx={4} ry={3} fill={D.passager} stroke={D.passagerHair} strokeWidth={0.5} />
    </g>
  );
}

function BusD({ x, y, w = 105, h = 26 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={2} y={2} width={w} height={h} fill="#000" opacity={0.2} rx={3} />
      <rect width={w} height={h} fill={D.bus} rx={3} />
      <rect y={3} width={w} height={4} fill={D.busAccent} />
      <rect x={6} y={9} width={w - 12} height={6} fill={D.busWindow} rx={1} />
      <circle cx={w - 8} cy={h / 2 + 3} r={2} fill="#FBBF24" />
    </g>
  );
}

export function StyleD_Avancee() {
  return (
    <svg viewBox={VBOX_AVANCEE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={28} fill={D.trottoir} />
      <ArbreD x={50} y={16} />
      <ArbreD x={335} y={16} />
      <rect x={0} y={28} width={380} height={232} fill={D.chaussee} />
      <QuaiSchematic x={QUAI_X} y={34} {...quaiThemeD} metalPlate={D.metalPlate} />
      <PassagerD x={QUAI_X + 60} y={50} />
      <PassagerD x={QUAI_X + 110} y={50} />
      <PassagerD x={QUAI_X + 170} y={50} />
      <line x1={0} y1={205} x2={380} y2={205} stroke={D.marquage} strokeWidth={1.2} strokeDasharray="10 8" />
    </svg>
  );
}

export function StyleD_AvanceeVelo() {
  const sidewalkY = 30, bikeY = sidewalkY, bikeH = ROW_DEPTH;
  return (
    <svg viewBox={VBOX_AVANCEE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={D.trottoir} />
      <ArbreD x={50} y={16} r={9} />
      <ArbreD x={335} y={16} r={9} />
      <rect x={0} y={bikeY} width={380} height={bikeH} fill={D.velo} />
      <rect x={0} y={bikeY + bikeH} width={380} height={260 - (bikeY + bikeH)} fill={D.chaussee} />
      <QuaiSchematic x={QUAI_X} y={bikeY} {...quaiThemeD} metalPlate={D.metalPlate} withEndRamps />
      <PassagerD x={QUAI_X + 60} y={bikeY + bikeH + 16} />
      <PassagerD x={QUAI_X + 110} y={bikeY + bikeH + 16} />
      <PassagerD x={QUAI_X + 170} y={bikeY + bikeH + 16} />
      <line x1={0} y1={215} x2={380} y2={215} stroke={D.marquage} strokeWidth={1.2} strokeDasharray="10 8" />
    </svg>
  );
}

export function StyleD_Ile() {
  const sidewalkY = 22, busLaneH = 36, quaiY = sidewalkY + busLaneH + 6, otherLaneY = quaiY + QUAI_DEPTH + 6;
  return (
    <svg viewBox={VBOX_ILE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={D.trottoir} />
      <ArbreD x={50} y={12} r={6} />
      <rect x={0} y={sidewalkY} width={380} height={280 - sidewalkY} fill={D.chaussee} />
      <QuaiSchematic x={QUAI_X} y={quaiY} {...quaiThemeD} metalPlate={D.metalPlate} islandMode />
      <PassagerD x={QUAI_X + 60} y={quaiY + 16} />
      <PassagerD x={QUAI_X + 110} y={quaiY + 16} />
      <PassagerD x={QUAI_X + 170} y={quaiY + 16} />
      {[24, 30, 36, 42, 48].map((y) => (
        <rect key={y} x={QUAI_X + QUAI_W / 2 - 6} y={y} width={12} height={3} fill={D.marquage} />
      ))}
      <line x1={0} y1={otherLaneY + 30} x2={380} y2={otherLaneY + 30} stroke={D.marquage} strokeWidth={1.2} strokeDasharray="10 8" />
    </svg>
  );
}

export function StyleD_IleVelo() {
  const sidewalkY = 20, bikeH = ROW_DEPTH, busLaneH = 36, curbY = sidewalkY + bikeH;
  const quaiY = curbY + busLaneH + 6, otherLaneY = quaiY + QUAI_DEPTH + 6;
  return (
    <svg viewBox={VBOX_ILE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={D.trottoir} />
      <rect x={0} y={sidewalkY} width={380} height={bikeH} fill={D.velo} />
      <rect x={0} y={curbY} width={380} height={280 - curbY} fill={D.chaussee} />
      <QuaiSchematic x={QUAI_X} y={quaiY} {...quaiThemeD} metalPlate={D.metalPlate} islandMode />
      <PassagerD x={QUAI_X + 60} y={quaiY + 16} />
      <PassagerD x={QUAI_X + 110} y={quaiY + 16} />
      <PassagerD x={QUAI_X + 170} y={quaiY + 16} />
      {[22, 28, 34, 40, 46, 52, 58, 64].map((y) => (
        <rect key={y} x={QUAI_X + QUAI_W / 2 - 6} y={y} width={12} height={3} fill={D.marquage} />
      ))}
      <line x1={0} y1={otherLaneY + 30} x2={380} y2={otherLaneY + 30} stroke={D.marquage} strokeWidth={1.2} strokeDasharray="10 8" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * STYLE E — "Minimaliste flat"
 * Pictogrammes bus/vélo, palette épurée
 * ════════════════════════════════════════════════════════════════════════ */

const E = {
  base: "#FFFFFF",
  surface: "#F1F5F9",
  surfaceAlt: "#E2E8F0",
  caniveau: "#94A3B8",
  metalPlate: "#CBD5E1",
  trait: "#0F172A",
};

const quaiThemeE = { concrete: "#CBD5E1", joint: "#0F172A", ruban: "#0F172A", rainure: "#475569", pad: "#0F172A" };

function PictoBus({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-12} y={-7} width={24} height={14} rx={2} fill="none" stroke={E.trait} strokeWidth={1.2} />
      <line x1={-12} y1={0} x2={12} y2={0} stroke={E.trait} strokeWidth={0.8} />
      <circle cx={-7} cy={7} r={1.5} fill={E.trait} />
      <circle cx={7} cy={7} r={1.5} fill={E.trait} />
    </g>
  );
}

function PictoVelo({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} stroke={E.trait} strokeWidth={1} fill="none">
      <circle cx={-5} cy={2} r={3} />
      <circle cx={5} cy={2} r={3} />
      <path d="M-5 2 L0 -3 L5 2" />
    </g>
  );
}

export function StyleE_Avancee() {
  return (
    <svg viewBox={VBOX_AVANCEE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={28} fill={E.surface} />
      <line x1={0} y1={28} x2={380} y2={28} stroke={E.trait} strokeWidth={1} />
      <rect x={0} y={28} width={380} height={232} fill={E.base} />
      <QuaiSchematic x={QUAI_X} y={34} {...quaiThemeE} metalPlate={E.metalPlate} metalPlateStroke={E.trait} />
      <line x1={0} y1={205} x2={380} y2={205} stroke={E.trait} strokeWidth={0.8} strokeDasharray="6 6" />
    </svg>
  );
}

export function StyleE_AvanceeVelo() {
  const sidewalkY = 30, bikeY = sidewalkY, bikeH = ROW_DEPTH;
  return (
    <svg viewBox={VBOX_AVANCEE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={E.surface} />
      <line x1={0} y1={sidewalkY} x2={380} y2={sidewalkY} stroke={E.trait} strokeWidth={1} />
      <rect x={0} y={bikeY} width={380} height={bikeH} fill={E.surfaceAlt} />
      <PictoVelo x={30} y={bikeY + bikeH / 2} />
      <PictoVelo x={350} y={bikeY + bikeH / 2} />
      <line x1={0} y1={bikeY + bikeH} x2={380} y2={bikeY + bikeH} stroke={E.trait} strokeWidth={1} />
      <rect x={0} y={bikeY + bikeH} width={380} height={260 - (bikeY + bikeH)} fill={E.base} />
      <QuaiSchematic x={QUAI_X} y={bikeY} {...quaiThemeE} metalPlate={E.metalPlate} metalPlateStroke={E.trait} withEndRamps />
      <line x1={0} y1={210} x2={380} y2={210} stroke={E.trait} strokeWidth={0.8} strokeDasharray="6 6" />
    </svg>
  );
}

export function StyleE_Ile() {
  const sidewalkY = 22, busLaneH = 36, quaiY = sidewalkY + busLaneH + 6, otherLaneY = quaiY + QUAI_DEPTH + 6;
  return (
    <svg viewBox={VBOX_ILE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={E.surface} />
      <line x1={0} y1={sidewalkY} x2={380} y2={sidewalkY} stroke={E.trait} strokeWidth={1} />
      <rect x={0} y={sidewalkY} width={380} height={280 - sidewalkY} fill={E.base} />
      <QuaiSchematic x={QUAI_X} y={quaiY} {...quaiThemeE} metalPlate={E.metalPlate} metalPlateStroke={E.trait} islandMode />
      <line x1={184} y1={sidewalkY} x2={184} y2={quaiY} stroke={E.trait} strokeDasharray="2 2" />
      <line x1={196} y1={sidewalkY} x2={196} y2={quaiY} stroke={E.trait} strokeDasharray="2 2" />
      <line x1={0} y1={otherLaneY + 30} x2={380} y2={otherLaneY + 30} stroke={E.trait} strokeWidth={0.8} strokeDasharray="6 6" />
    </svg>
  );
}

export function StyleE_IleVelo() {
  const sidewalkY = 20, bikeH = ROW_DEPTH, busLaneH = 36, curbY = sidewalkY + bikeH;
  const quaiY = curbY + busLaneH + 6, otherLaneY = quaiY + QUAI_DEPTH + 6;
  return (
    <svg viewBox={VBOX_ILE} className="w-full h-auto">
      <rect x={0} y={0} width={380} height={sidewalkY} fill={E.surface} />
      <rect x={0} y={sidewalkY} width={380} height={bikeH} fill={E.surfaceAlt} />
      <PictoVelo x={50} y={26} />
      <line x1={0} y1={curbY} x2={380} y2={curbY} stroke={E.trait} strokeWidth={1} />
      <rect x={0} y={curbY} width={380} height={280 - curbY} fill={E.base} />
      <QuaiSchematic x={QUAI_X} y={quaiY} {...quaiThemeE} metalPlate={E.metalPlate} metalPlateStroke={E.trait} islandMode />
      <line x1={184} y1={sidewalkY} x2={184} y2={quaiY} stroke={E.trait} strokeDasharray="2 2" />
      <line x1={196} y1={sidewalkY} x2={196} y2={quaiY} stroke={E.trait} strokeDasharray="2 2" />
      <line x1={0} y1={otherLaneY + 30} x2={380} y2={otherLaneY + 30} stroke={E.trait} strokeWidth={0.8} strokeDasharray="6 6" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Map des styles
 * ════════════════════════════════════════════════════════════════════════ */

export type StyleId = "A" | "B" | "C" | "D" | "E";

export const STYLE_VARIANTS: Record<StyleId, {
  name: string;
  tagline: string;
  description: string;
  badge: string;
  accent: string;
  configs: {
    avancee: () => ReactElement;
    avancee_velo: () => ReactElement;
    ile: () => ReactElement;
    ile_velo: () => ReactElement;
  };
}> = {
  A: {
    name: "Plan technique CERTU",
    tagline: "Sobre · Normatif · Numéroté",
    description: "Style des planches CERTU/CEREMA officielles. Quai démo fidèle (D-004 + D-002 + D-003 avec rubans, rainures, joints, plots) en gris béton. Pas de bus/voitures, juste des numéros ① ② ③ avec une légende. Pour les acheteurs publics.",
    badge: "Style A",
    accent: "#1F2937",
    configs: {
      avancee: StyleA_Avancee,
      avancee_velo: StyleA_AvanceeVelo,
      ile: StyleA_Ile,
      ile_velo: StyleA_IleVelo,
    },
  },
  B: {
    name: "Plan illustré IDFM",
    tagline: "Équilibré · Recommandé",
    description: "Compromis rigueur normative et lisibilité moderne. Quai démo fidèle en gris béton + bus simplifié sombre. Caniveau dark + plaque métal galvanisée. Inspiration directe des guides aménagements voirie IDFM et Nice Côte d'Azur.",
    badge: "Style B",
    accent: "#5C636E",
    configs: {
      avancee: StyleB_Avancee,
      avancee_velo: StyleB_AvanceeVelo,
      ile: StyleB_Ile,
      ile_velo: StyleB_IleVelo,
    },
  },
  C: {
    name: "Isométrique léger",
    tagline: "Volumétrique · 3D simplifié",
    description: "Vue isométrique 30° avec face latérale du quai visible (donne le relief 16cm béton). Volumes simples bas-poly pour bus. Arbres décoratifs sur le trottoir. Plus visuel mais peut faire 'stock illustration'.",
    badge: "Style C",
    accent: "#6B7280",
    configs: {
      avancee: StyleC_Avancee,
      avancee_velo: StyleC_AvanceeVelo,
      ile: StyleC_Ile,
      ile_velo: StyleC_IleVelo,
    },
  },
  D: {
    name: "Marketing illustré",
    tagline: "Coloré · Atmosphère · Voyageurs",
    description: "Plus chaleureux : voyageurs visibles sur le quai, arbres avec ombres portées, bandeau bleu sur le bus. Quai démo fidèle avec ombre portée subtile. Pour donner une vibe 'projet vivant'.",
    badge: "Style D",
    accent: "#3B82F6",
    configs: {
      avancee: StyleD_Avancee,
      avancee_velo: StyleD_AvanceeVelo,
      ile: StyleD_Ile,
      ile_velo: StyleD_IleVelo,
    },
  },
  E: {
    name: "Minimaliste flat",
    tagline: "Épuré · Pictogrammes · Bauhaus",
    description: "Très contrasté, palette à 2 niveaux + traits noirs. Bus et vélo en pictogrammes (lignes uniquement). Quai démo en bleu-gris pâle pour rester dans la palette monochrome. Look design system / iconographie.",
    badge: "Style E",
    accent: "#0F172A",
    configs: {
      avancee: StyleE_Avancee,
      avancee_velo: StyleE_AvanceeVelo,
      ile: StyleE_Ile,
      ile_velo: StyleE_IleVelo,
    },
  },
};
