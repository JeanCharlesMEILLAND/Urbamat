/**
 * Schémas SVG des 3 typologies de stationnement (NF P 91-100)
 * avec un quai URBAQUAI intégré au milieu de la file de stationnement.
 *
 * Style : plans architecturaux épurés violet/gris, sans voiture ni bus,
 * cotes avec flèches doubles, marquages au sol sobres.
 * Inspiration : planches techniques URBAMAT.
 */

import { QuaiSchematicTopDown } from "./QuaiSchematicTopDown";

const PURPLE = "#7C3AED";          // accent violet (bordures + marquage perpendiculaire)
const PURPLE_LIGHT = "#A78BFA";    // marquage en épi plus doux
const DOT_GRAY = "#9CA3AF";        // pointillés délimitations zones
const TEXT = "#374151";            // texte cotes
const TEXT_LIGHT = "#6B7280";      // texte secondaire

/* ────── Cotation horizontale avec double flèches ↔ ────── */
function CoteH({ x1, x2, y, label, above = true }: { x1: number; x2: number; y: number; label: string; above?: boolean }) {
  return (
    <g stroke={TEXT_LIGHT} strokeWidth={0.7} fill={TEXT_LIGHT}>
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <path d={`M${x1} ${y - 3} L${x1 - 3} ${y} L${x1} ${y + 3} Z`} />
      <path d={`M${x2} ${y - 3} L${x2 + 3} ${y} L${x2} ${y + 3} Z`} />
      <text
        x={(x1 + x2) / 2}
        y={above ? y - 5 : y + 11}
        textAnchor="middle"
        fontSize={11}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={TEXT}
        stroke="none"
      >
        {label}
      </text>
    </g>
  );
}

/* ────── Cotation verticale avec double flèches ↕ ────── */
function CoteV({ x, y1, y2, label, right = true }: { x: number; y1: number; y2: number; label: string; right?: boolean }) {
  return (
    <g stroke={TEXT_LIGHT} strokeWidth={0.7} fill={TEXT_LIGHT}>
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <path d={`M${x - 3} ${y1} L${x} ${y1 - 3} L${x + 3} ${y1} Z`} />
      <path d={`M${x - 3} ${y2} L${x} ${y2 + 3} L${x + 3} ${y2} Z`} />
      <text
        x={right ? x + 6 : x - 6}
        y={(y1 + y2) / 2 + 4}
        textAnchor={right ? "start" : "end"}
        fontSize={11}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={TEXT}
        stroke="none"
      >
        {label}
      </text>
    </g>
  );
}

/* ────── Texte "Circulation" avec flèche directionnelle ────── */
function CirculationLabel({ x, y, length, direction = "right" }: { x: number; y: number; length: number; direction?: "left" | "right" | "both" }) {
  const arrow = direction === "right" || direction === "both";
  const arrowL = direction === "left" || direction === "both";
  return (
    <g stroke={TEXT_LIGHT} strokeWidth={0.7} fill={TEXT_LIGHT}>
      <line x1={x} y1={y} x2={x + length} y2={y} />
      {arrow && <path d={`M${x + length} ${y - 3} L${x + length + 4} ${y} L${x + length} ${y + 3} Z`} fill={TEXT_LIGHT} />}
      {arrowL && <path d={`M${x} ${y - 3} L${x - 4} ${y} L${x} ${y + 3} Z`} fill={TEXT_LIGHT} />}
      <text
        x={x + length / 2}
        y={y - 4}
        textAnchor="middle"
        fontSize={11}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={TEXT}
        stroke="none"
      >
        Circulation
      </text>
    </g>
  );
}

/* ────── Carte de typologie avec titre ────── */
function Diagram({
  title,
  subtitle,
  children,
  viewBox,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  viewBox: string;
}) {
  return (
    <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[11px] uppercase tracking-widest text-accent font-bold">{subtitle}</p>
        <h3 className="text-sm font-bold text-neutral-dark mt-0.5">{title}</h3>
      </div>
      <div className="bg-white p-4 lg:p-5">
        <svg viewBox={viewBox} xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" aria-hidden>
          {children}
        </svg>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. Bataille 90° — places perpendiculaires à la chaussée
 * Dimensions : 2,5m × 5m, voie circulation 6m double sens
 * ════════════════════════════════════════════════════════════════════════ */
export function BatailleDiagram() {
  // Échelle : 18 px / m
  // 1 place : 45 × 90 px (2,5m × 5m)
  // Voie circulation : 108 px (6m)
  // 8 places en haut, 8 en bas — total 360 px de large
  const PLACE_W = 45, PLACE_H = 90, CIRC_H = 108;
  const N_PLACES = 7;
  const QUAI_PLACES = 4; // le quai remplace 4 places consécutives au centre
  const VIEW_W = N_PLACES * PLACE_W + 40; // marge cotes
  const STRIP_TOP = 24;

  return (
    <Diagram title="Stationnement bataille" subtitle="Angle 90° · 2,5m × 5m" viewBox={`0 0 ${VIEW_W} 320`}>
      {/* Trottoir haut */}
      <rect x={20} y={0} width={N_PLACES * PLACE_W} height={STRIP_TOP - 10} fill={PURPLE} />
      {/* Pointillés délimitant zone parking haut / circulation */}
      <line x1={20} y1={STRIP_TOP + PLACE_H + 10} x2={20 + N_PLACES * PLACE_W} y2={STRIP_TOP + PLACE_H + 10} stroke={DOT_GRAY} strokeWidth={1} strokeDasharray="3 3" />
      {/* Lignes verticales de séparation des places HAUT */}
      {Array.from({ length: N_PLACES + 1 }).map((_, i) => (
        <line
          key={`top-${i}`}
          x1={20 + i * PLACE_W}
          y1={STRIP_TOP - 10}
          x2={20 + i * PLACE_W}
          y2={STRIP_TOP + PLACE_H + 10}
          stroke={PURPLE}
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />
      ))}
      {/* Quai URBAQUAI au milieu de la file haute (remplace QUAI_PLACES places) */}
      <QuaiSchematicTopDown
        x={20 + Math.floor((N_PLACES - QUAI_PLACES) / 2) * PLACE_W + 4}
        y={STRIP_TOP - 4}
        width={QUAI_PLACES * PLACE_W - 8}
        height={PLACE_H + 4}
      />
      {/* Voie circulation */}
      <CirculationLabel x={50} y={STRIP_TOP + PLACE_H + 35} length={120} direction="left" />
      <CirculationLabel x={VIEW_W - 170} y={STRIP_TOP + PLACE_H + 75} length={120} direction="right" />
      {/* Pointillés délimitant zone parking bas / circulation */}
      <line x1={20} y1={STRIP_TOP + PLACE_H + CIRC_H} x2={20 + N_PLACES * PLACE_W} y2={STRIP_TOP + PLACE_H + CIRC_H} stroke={DOT_GRAY} strokeWidth={1} strokeDasharray="3 3" />
      {/* Lignes verticales places BAS */}
      {Array.from({ length: N_PLACES + 1 }).map((_, i) => (
        <line
          key={`bot-${i}`}
          x1={20 + i * PLACE_W}
          y1={STRIP_TOP + PLACE_H + CIRC_H}
          x2={20 + i * PLACE_W}
          y2={STRIP_TOP + PLACE_H + CIRC_H + PLACE_H + 10}
          stroke={PURPLE}
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />
      ))}
      {/* Trottoir bas */}
      <rect x={20} y={STRIP_TOP + PLACE_H + CIRC_H + PLACE_H + 12} width={N_PLACES * PLACE_W} height={8} fill={PURPLE} />

      {/* ──── Cotes ──── */}
      <CoteH x1={20 + (N_PLACES - 1) * PLACE_W} x2={20 + N_PLACES * PLACE_W} y={STRIP_TOP - 17} label="2,5 m" />
      <CoteV x={VIEW_W - 18} y1={STRIP_TOP + PLACE_H + 12} y2={STRIP_TOP + PLACE_H + CIRC_H - 2} label="6 m" />
      <CoteV x={VIEW_W - 18} y1={STRIP_TOP + PLACE_H + CIRC_H + 4} y2={STRIP_TOP + PLACE_H + CIRC_H + PLACE_H - 2} label="5 m" />
    </Diagram>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. Épi 45° — places inclinées à 45°
 * Dimensions : 2,2m × 5m, voie circulation 3,5m sens unique
 * ════════════════════════════════════════════════════════════════════════ */
export function EpiDiagram() {
  const PLACE_W = 36, PLACE_H = 80, CIRC_H = 63; // 2m × 4,5m approximatif, 3,5m circulation
  const N_PLACES = 7;
  const QUAI_PLACES = 4;
  const VIEW_W = N_PLACES * PLACE_W + 40;
  const STRIP_TOP = 24;
  const SKEW = 50; // décalage 45°

  return (
    <Diagram title="Stationnement en épi" subtitle="Angle 45° · 2,2m × 5m" viewBox={`0 0 ${VIEW_W} 290`}>
      <rect x={20} y={0} width={N_PLACES * PLACE_W} height={STRIP_TOP - 10} fill={PURPLE} />
      {/* Lignes diagonales 45° pour places HAUT — on dessine les délimiteurs */}
      <line x1={20} y1={STRIP_TOP + PLACE_H + 10} x2={20 + N_PLACES * PLACE_W} y2={STRIP_TOP + PLACE_H + 10} stroke={DOT_GRAY} strokeWidth={1} strokeDasharray="3 3" />
      {Array.from({ length: N_PLACES + 1 }).map((_, i) => (
        <line
          key={`top-${i}`}
          x1={20 + i * PLACE_W + SKEW}
          y1={STRIP_TOP - 10}
          x2={20 + i * PLACE_W}
          y2={STRIP_TOP + PLACE_H + 10}
          stroke={PURPLE}
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />
      ))}
      {/* Indicateur d'angle 45° sur la 1ère place */}
      <path
        d={`M${20 + 1.5 * PLACE_W} ${STRIP_TOP + PLACE_H + 10} L${20 + 1.5 * PLACE_W + 14} ${STRIP_TOP + PLACE_H + 10} A 14 14 0 0 0 ${20 + 1.5 * PLACE_W + 9.9} ${STRIP_TOP + PLACE_H + 10 - 9.9} Z`}
        fill="none"
        stroke={TEXT}
        strokeWidth={0.7}
      />
      <text x={20 + 1.5 * PLACE_W + 14} y={STRIP_TOP + PLACE_H - 6} fontSize={10} fontFamily="ui-sans-serif" fill={TEXT}>45°</text>

      {/* Quai URBAQUAI au milieu de la file haute */}
      <QuaiSchematicTopDown
        x={20 + Math.floor((N_PLACES - QUAI_PLACES) / 2) * PLACE_W + SKEW * 0.5}
        y={STRIP_TOP - 4}
        width={QUAI_PLACES * PLACE_W - 8}
        height={PLACE_H + 4}
      />

      {/* Voie circulation */}
      <CirculationLabel x={50} y={STRIP_TOP + PLACE_H + 35} length={VIEW_W - 100} direction="right" />
      <line x1={20} y1={STRIP_TOP + PLACE_H + CIRC_H} x2={20 + N_PLACES * PLACE_W} y2={STRIP_TOP + PLACE_H + CIRC_H} stroke={DOT_GRAY} strokeWidth={1} strokeDasharray="3 3" />

      {/* Lignes diagonales places BAS — direction inversée */}
      {Array.from({ length: N_PLACES + 1 }).map((_, i) => (
        <line
          key={`bot-${i}`}
          x1={20 + i * PLACE_W - SKEW}
          y1={STRIP_TOP + PLACE_H + CIRC_H + PLACE_H + 10}
          x2={20 + i * PLACE_W}
          y2={STRIP_TOP + PLACE_H + CIRC_H}
          stroke={PURPLE}
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />
      ))}
      <rect x={20} y={STRIP_TOP + PLACE_H + CIRC_H + PLACE_H + 12} width={N_PLACES * PLACE_W} height={8} fill={PURPLE} />

      {/* Cotes */}
      <CoteV x={VIEW_W - 18} y1={STRIP_TOP - 5} y2={STRIP_TOP + PLACE_H + 5} label="5 m" />
      <CoteV x={VIEW_W - 18} y1={STRIP_TOP + PLACE_H + 15} y2={STRIP_TOP + PLACE_H + CIRC_H - 2} label="3,5 m" />
      <CoteH x1={20 + 5 * PLACE_W + SKEW * 0.5 + 6} x2={20 + 6 * PLACE_W + SKEW * 0.5 + 6} y={STRIP_TOP - 17} label="2,2 m" />
    </Diagram>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. Longitudinal — places parallèles à la chaussée
 * Dimensions : 2,5m × 5m (en longueur), voie circulation 3,5m
 * ════════════════════════════════════════════════════════════════════════ */
export function LongitudinalDiagram() {
  const PLACE_W = 60, PLACE_H = 30; // 5m × 2,5m (longitudinal = 5m sur l'axe X)
  const CIRC_H = 42; // 3,5m
  const N_PLACES = 6;
  const QUAI_PLACES = 3; // le quai remplace 3 places longitudinales (15m)
  const VIEW_W = N_PLACES * PLACE_W + 40;
  const STRIP_TOP = 22;

  return (
    <Diagram title="Stationnement longitudinal" subtitle="Parallèle · 2,5m × 5m" viewBox={`0 0 ${VIEW_W} 230`}>
      {/* Trottoir haut */}
      <rect x={20} y={0} width={N_PLACES * PLACE_W} height={STRIP_TOP - 10} fill={PURPLE} />

      {/* Limites parking haut (lignes pleines violettes en haut + bas) */}
      <line x1={20} y1={STRIP_TOP - 10} x2={20 + N_PLACES * PLACE_W} y2={STRIP_TOP - 10} stroke={PURPLE} strokeWidth={1.2} />
      <line x1={20} y1={STRIP_TOP + PLACE_H} x2={20 + N_PLACES * PLACE_W} y2={STRIP_TOP + PLACE_H} stroke={DOT_GRAY} strokeWidth={1} strokeDasharray="3 3" />
      {/* Séparations entre places HAUT */}
      {Array.from({ length: N_PLACES + 1 }).map((_, i) => (
        <line
          key={`top-${i}`}
          x1={20 + i * PLACE_W}
          y1={STRIP_TOP - 10}
          x2={20 + i * PLACE_W}
          y2={STRIP_TOP + PLACE_H}
          stroke={PURPLE}
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />
      ))}
      {/* Quai URBAQUAI au milieu de la file haute */}
      <QuaiSchematicTopDown
        x={20 + Math.floor((N_PLACES - QUAI_PLACES) / 2) * PLACE_W + 4}
        y={STRIP_TOP - 6}
        width={QUAI_PLACES * PLACE_W - 8}
        height={PLACE_H + 6}
      />

      {/* Voie circulation */}
      <CirculationLabel x={VIEW_W / 2 - 60} y={STRIP_TOP + PLACE_H + CIRC_H / 2} length={120} direction="right" />

      {/* Limites parking bas */}
      <line x1={20} y1={STRIP_TOP + PLACE_H + CIRC_H} x2={20 + N_PLACES * PLACE_W} y2={STRIP_TOP + PLACE_H + CIRC_H} stroke={DOT_GRAY} strokeWidth={1} strokeDasharray="3 3" />
      {/* Séparations entre places BAS */}
      {Array.from({ length: N_PLACES + 1 }).map((_, i) => (
        <line
          key={`bot-${i}`}
          x1={20 + i * PLACE_W}
          y1={STRIP_TOP + PLACE_H + CIRC_H}
          x2={20 + i * PLACE_W}
          y2={STRIP_TOP + PLACE_H + CIRC_H + PLACE_H}
          stroke={PURPLE}
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />
      ))}
      <line x1={20} y1={STRIP_TOP + PLACE_H + CIRC_H + PLACE_H} x2={20 + N_PLACES * PLACE_W} y2={STRIP_TOP + PLACE_H + CIRC_H + PLACE_H} stroke={PURPLE} strokeWidth={1.2} />

      {/* Cotes */}
      <CoteV x={VIEW_W - 18} y1={STRIP_TOP - 5} y2={STRIP_TOP + PLACE_H - 2} label="2,5 m" right={false} />
      <CoteV x={VIEW_W - 18} y1={STRIP_TOP + PLACE_H + 4} y2={STRIP_TOP + PLACE_H + CIRC_H - 2} label="3,5 m" right={false} />
      <CoteH x1={20 + 1 * PLACE_W} x2={20 + 2 * PLACE_W} y={STRIP_TOP + PLACE_H + CIRC_H + PLACE_H + 18} label="5 m" />
      <CoteH x1={20 + 2 * PLACE_W} x2={20 + 3 * PLACE_W} y={STRIP_TOP + PLACE_H + CIRC_H + PLACE_H + 18} label="5 m" />
    </Diagram>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * Composant principal — grille des 3 typologies
 * ════════════════════════════════════════════════════════════════════════ */
export function TypologieDiagrams() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      <BatailleDiagram />
      <EpiDiagram />
      <LongitudinalDiagram />
    </div>
  );
}
