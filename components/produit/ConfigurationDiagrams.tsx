/**
 * Schémas SVG des 4 configurations URBAQUAI : avancée trottoir, avancée + piste cyclable,
 * île, île + piste cyclable. Vue de dessus.
 *
 * Layout vertical commun pour chaque carte :
 *   - Trottoir en haut
 *   - (Piste cyclable si présente)
 *   - Quai URBAQUAI + bus
 *   - Chaussée principale
 *   - Trottoir / île si configuration en île
 */

const ROAD_FILL = "#525a64";
const ROAD_LINE = "#f5e9b5";
const SIDEWALK_FILL = "#e8e4d6";
const CURB_FILL = "#a8a298";
const CONCRETE_FILL = "#c8c2b5";
const CONCRETE_DARK = "#9b9489";
const RUBAN_FILL = "#1f1c19";
const BUS_FILL = "#1f2937";
const BUS_WINDOW = "#cbd5e1";
const BIKE_FILL = "#bbf7d0";       // vert clair piste cyclable
const BIKE_LINE = "#16a34a";        // vert ligne
const PEDESTRIAN_FILL = "#fde047";  // marquage piéton

function Bus({ x, y, width = 110, height = 28 }: { x: number; y: number; width?: number; height?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={width} height={height} rx={4} fill={BUS_FILL} />
      {[6, 26, 46, 66, 86].map((wx) => (
        <rect key={wx} x={wx} y={5} width={14} height={6} fill={BUS_WINDOW} />
      ))}
      <rect x={6} y={height - 11} width={width - 12} height={6} fill={BUS_WINDOW} opacity={0.4} />
      <circle cx={width - 6} cy={height / 2} r={2} fill="#fbbf24" />
    </g>
  );
}

function QuaiUrbaquai({
  x,
  y,
  width,
  depth = 26,
}: {
  x: number;
  y: number;
  width: number;
  depth?: number;
}) {
  const leftW = width * 0.25;
  const midW = width * 0.50;
  const rightW = width * 0.25;
  const chamfer = 3;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* D-004 fin gauche */}
      <path
        d={`M0 0 L${leftW} 0 L${leftW} ${depth} L${chamfer} ${depth} L0 ${depth - chamfer} Z`}
        fill={CONCRETE_FILL}
        stroke={CONCRETE_DARK}
        strokeWidth={0.5}
      />
      {[0.30, 0.45, 0.60, 0.75].map((rx) => (
        <line
          key={rx}
          x1={leftW * rx}
          y1={4}
          x2={leftW * rx}
          y2={depth - 4}
          stroke={RUBAN_FILL}
          strokeWidth={1.5}
        />
      ))}

      {/* D-002 central */}
      <rect
        x={leftW}
        y={0}
        width={midW}
        height={depth}
        fill={CONCRETE_FILL}
        stroke={CONCRETE_DARK}
        strokeWidth={0.5}
      />
      <line x1={leftW} y1={0} x2={leftW} y2={depth} stroke={CONCRETE_DARK} strokeWidth={0.7} />
      <line x1={leftW + midW} y1={0} x2={leftW + midW} y2={depth} stroke={CONCRETE_DARK} strokeWidth={0.7} />
      <line
        x1={leftW + 6}
        y1={depth - 4}
        x2={leftW + midW - 6}
        y2={depth - 4}
        stroke={RUBAN_FILL}
        strokeWidth={0.7}
        opacity={0.6}
      />

      {/* D-003 fin droite */}
      <path
        d={`M${leftW + midW} 0 L${width} 0 L${width} ${depth - chamfer} L${width - chamfer} ${depth} L${leftW + midW} ${depth} Z`}
        fill={CONCRETE_FILL}
        stroke={CONCRETE_DARK}
        strokeWidth={0.5}
      />

      <text
        x={width / 2}
        y={depth / 2 + 3}
        textAnchor="middle"
        fontSize={7}
        fontFamily="monospace"
        fill={CONCRETE_DARK}
        opacity={0.7}
      >
        URBAQUAI
      </text>
    </g>
  );
}

/** Pictogramme vélo (simplifié) sur la piste cyclable */
function BikeIcon({ x, y, size = 14 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx={-size / 2.5} cy={0} r={size / 4} fill="none" stroke={BIKE_LINE} strokeWidth={1.2} />
      <circle cx={size / 2.5} cy={0} r={size / 4} fill="none" stroke={BIKE_LINE} strokeWidth={1.2} />
      <path
        d={`M${-size / 2.5} 0 L0 -${size / 3} L${size / 2.5} 0`}
        fill="none"
        stroke={BIKE_LINE}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <line x1={-size / 6} y1={-size / 3} x2={size / 6} y2={-size / 3} stroke={BIKE_LINE} strokeWidth={1.2} strokeLinecap="round" />
    </g>
  );
}

/** Marquage passage piéton */
function CrossWalk({ x, y, width, height = 14, vertical = false }: { x: number; y: number; width: number; height?: number; vertical?: boolean }) {
  if (vertical) {
    const stripes = Math.floor(height / 4);
    return (
      <g transform={`translate(${x}, ${y})`}>
        {Array.from({ length: stripes }).map((_, i) => (
          <rect key={i} x={0} y={i * 4} width={width} height={2} fill={PEDESTRIAN_FILL} />
        ))}
      </g>
    );
  }
  const stripes = Math.floor(width / 4);
  return (
    <g transform={`translate(${x}, ${y})`}>
      {Array.from({ length: stripes }).map((_, i) => (
        <rect key={i} x={i * 4} y={0} width={2} height={height} fill={PEDESTRIAN_FILL} />
      ))}
    </g>
  );
}

function Diagram({
  title,
  subtitle,
  children,
  viewBox = "0 0 380 220",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  viewBox?: string;
}) {
  return (
    <div className="bg-white rounded-xl ring-1 ring-black/5 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[11px] uppercase tracking-widest text-accent font-bold">
          {subtitle}
        </p>
        <h3 className="text-sm font-bold text-neutral-dark mt-0.5">{title}</h3>
      </div>
      <div className="bg-gray-50 p-3">
        <svg viewBox={viewBox} xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" aria-hidden>
          {children}
        </svg>
      </div>
    </div>
  );
}

export function ConfigurationDiagrams() {
  const QUAI_X = 130;
  const QUAI_W = 120;
  const QUAI_DEPTH = 26;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">

      {/* ─── 1. Avancée de trottoir ─────────────────────────────── */}
      <Diagram title="Avancée de trottoir" subtitle="Configuration 1">
        {/* Trottoir principal en haut */}
        <rect x={0} y={0} width={380} height={50} fill={SIDEWALK_FILL} />
        {/* Avancée du trottoir : extension dans la chaussée à l'emplacement du quai */}
        <rect x={QUAI_X - 10} y={50} width={QUAI_W + 20} height={QUAI_DEPTH + 8} fill={SIDEWALK_FILL} />
        {/* Bordure */}
        <rect x={0} y={48.5} width={QUAI_X - 10} height={1.5} fill={CURB_FILL} />
        <rect x={QUAI_X + QUAI_W + 10} y={48.5} width={380 - (QUAI_X + QUAI_W + 10)} height={1.5} fill={CURB_FILL} />
        {/* Bordure de l'avancée (côté chaussée) */}
        <rect x={QUAI_X - 10} y={50 + QUAI_DEPTH + 6.5} width={QUAI_W + 20} height={1.5} fill={CURB_FILL} />

        {/* Quai URBAQUAI au bord de l'avancée */}
        <QuaiUrbaquai x={QUAI_X} y={56} width={QUAI_W} />

        {/* Chaussée */}
        <rect x={0} y={50 + QUAI_DEPTH + 8} width={380} height={220 - (50 + QUAI_DEPTH + 8)} fill={ROAD_FILL} />
        <line
          x1={0}
          y1={140}
          x2={380}
          y2={140}
          stroke={ROAD_LINE}
          strokeWidth={1}
          strokeDasharray="8 6"
        />

        {/* Bus stationné contre le quai */}
        <Bus x={QUAI_X + 5} y={50 + QUAI_DEPTH + 18} />

        {/* Légende */}
        <text x={5} y={20} fontSize={8} fontFamily="monospace" fill="#374151">Trottoir</text>
        <text x={QUAI_X + QUAI_W / 2} y={42} textAnchor="middle" fontSize={7} fontFamily="monospace" fill="#374151" opacity={0.7}>↓ avancée</text>
      </Diagram>

      {/* ─── 2. Avancée + piste cyclable ────────────────────────── */}
      <Diagram title="Avancée + piste cyclable" subtitle="Configuration 2">
        {/* Trottoir */}
        <rect x={0} y={0} width={380} height={40} fill={SIDEWALK_FILL} />

        {/* Piste cyclable contournant l'avancée par l'arrière (passe SOUS le quai côté trottoir) */}
        <rect x={0} y={40} width={380} height={14} fill={BIKE_FILL} />
        <line x1={0} y1={40} x2={380} y2={40} stroke={BIKE_LINE} strokeWidth={1} strokeDasharray="4 3" />
        <line x1={0} y1={54} x2={380} y2={54} stroke={BIKE_LINE} strokeWidth={1} strokeDasharray="4 3" />
        <BikeIcon x={50} y={47} />
        <BikeIcon x={310} y={47} />

        {/* Avancée + quai derrière la piste */}
        <rect x={QUAI_X - 10} y={54} width={QUAI_W + 20} height={QUAI_DEPTH + 8} fill={SIDEWALK_FILL} />
        <rect x={QUAI_X - 10} y={54 + QUAI_DEPTH + 6.5} width={QUAI_W + 20} height={1.5} fill={CURB_FILL} />
        <QuaiUrbaquai x={QUAI_X} y={60} width={QUAI_W} />

        {/* Chaussée */}
        <rect x={0} y={54 + QUAI_DEPTH + 8} width={380} height={220 - (54 + QUAI_DEPTH + 8)} fill={ROAD_FILL} />
        <line
          x1={0}
          y1={148}
          x2={380}
          y2={148}
          stroke={ROAD_LINE}
          strokeWidth={1}
          strokeDasharray="8 6"
        />

        <Bus x={QUAI_X + 5} y={54 + QUAI_DEPTH + 18} />

        <text x={5} y={20} fontSize={8} fontFamily="monospace" fill="#374151">Trottoir</text>
        <text x={5} y={51} fontSize={7} fontFamily="monospace" fill={BIKE_LINE}>Vélo</text>
      </Diagram>

      {/* ─── 3. Configuration en île ────────────────────────────── */}
      <Diagram title="Configuration en île" subtitle="Configuration 3">
        {/* Trottoir principal en haut */}
        <rect x={0} y={0} width={380} height={36} fill={SIDEWALK_FILL} />
        <rect x={0} y={34.5} width={380} height={1.5} fill={CURB_FILL} />

        {/* Voie de bus (entre trottoir et île) */}
        <rect x={0} y={36} width={380} height={32} fill={ROAD_FILL} />
        {/* Bus circulant côté trottoir */}
        <Bus x={QUAI_X + 5} y={42} />

        {/* Île : quai URBAQUAI au milieu de la chaussée */}
        <rect x={QUAI_X - 12} y={70} width={QUAI_W + 24} height={QUAI_DEPTH + 14} fill={SIDEWALK_FILL} />
        <rect x={QUAI_X - 12} y={68.5} width={QUAI_W + 24} height={1.5} fill={CURB_FILL} />
        <rect x={QUAI_X - 12} y={70 + QUAI_DEPTH + 12.5} width={QUAI_W + 24} height={1.5} fill={CURB_FILL} />
        <QuaiUrbaquai x={QUAI_X} y={76} width={QUAI_W} />

        {/* Passage piéton qui mène à l'île depuis le trottoir principal */}
        <CrossWalk x={QUAI_X + QUAI_W / 2 - 6} y={36} width={12} height={32} vertical />

        {/* Voie de circulation (autre sens) sous l'île */}
        <rect x={0} y={70 + QUAI_DEPTH + 14} width={380} height={220 - (70 + QUAI_DEPTH + 14)} fill={ROAD_FILL} />
        <line
          x1={0}
          y1={70 + QUAI_DEPTH + 14 + 30}
          x2={380}
          y2={70 + QUAI_DEPTH + 14 + 30}
          stroke={ROAD_LINE}
          strokeWidth={1}
          strokeDasharray="8 6"
        />

        <text x={5} y={20} fontSize={8} fontFamily="monospace" fill="#374151">Trottoir</text>
        <text x={QUAI_X + QUAI_W / 2} y={66} textAnchor="middle" fontSize={7} fontFamily="monospace" fill="#374151">↓ île ↓</text>
      </Diagram>

      {/* ─── 4. Île + piste cyclable ────────────────────────────── */}
      <Diagram title="Île + piste cyclable" subtitle="Configuration 4">
        {/* Trottoir */}
        <rect x={0} y={0} width={380} height={30} fill={SIDEWALK_FILL} />
        <rect x={0} y={28.5} width={380} height={1.5} fill={CURB_FILL} />

        {/* Piste cyclable (entre trottoir et voie bus) */}
        <rect x={0} y={30} width={380} height={14} fill={BIKE_FILL} />
        <line x1={0} y1={30} x2={380} y2={30} stroke={BIKE_LINE} strokeWidth={1} strokeDasharray="4 3" />
        <line x1={0} y1={44} x2={380} y2={44} stroke={BIKE_LINE} strokeWidth={1} strokeDasharray="4 3" />
        <BikeIcon x={50} y={37} />
        <BikeIcon x={310} y={37} />

        {/* Voie bus (entre piste cyclable et île) */}
        <rect x={0} y={44} width={380} height={32} fill={ROAD_FILL} />
        <Bus x={QUAI_X + 5} y={50} />

        {/* Île + quai URBAQUAI */}
        <rect x={QUAI_X - 12} y={78} width={QUAI_W + 24} height={QUAI_DEPTH + 14} fill={SIDEWALK_FILL} />
        <rect x={QUAI_X - 12} y={76.5} width={QUAI_W + 24} height={1.5} fill={CURB_FILL} />
        <rect x={QUAI_X - 12} y={78 + QUAI_DEPTH + 12.5} width={QUAI_W + 24} height={1.5} fill={CURB_FILL} />
        <QuaiUrbaquai x={QUAI_X} y={84} width={QUAI_W} />

        {/* Passage piéton trottoir → piste vélo → voie bus → île */}
        <CrossWalk x={QUAI_X + QUAI_W / 2 - 6} y={30} width={12} height={46} vertical />

        {/* Voie de circulation sous l'île */}
        <rect x={0} y={78 + QUAI_DEPTH + 14} width={380} height={220 - (78 + QUAI_DEPTH + 14)} fill={ROAD_FILL} />
        <line
          x1={0}
          y1={78 + QUAI_DEPTH + 14 + 28}
          x2={380}
          y2={78 + QUAI_DEPTH + 14 + 28}
          stroke={ROAD_LINE}
          strokeWidth={1}
          strokeDasharray="8 6"
        />

        <text x={5} y={20} fontSize={7} fontFamily="monospace" fill="#374151">Trottoir</text>
        <text x={5} y={42} fontSize={7} fontFamily="monospace" fill={BIKE_LINE}>Vélo</text>
      </Diagram>
    </div>
  );
}
