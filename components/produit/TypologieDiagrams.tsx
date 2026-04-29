/**
 * Schémas SVG des 3 typologies de stationnement (NF P 91-100) avec un quai
 * URBAQUAI intégré. Vue de dessus (plan).
 *
 * Layout vertical pour chaque typologie :
 *   1. Trottoir (haut)
 *   2. Bordure (curb)
 *   3. Quai URBAQUAI (modules dessinés en concrete avec rubans/biseau) + stationnements adjacents
 *   4. Chaussée avec bus (bas)
 */

const ROAD_FILL = "#525a64";        // gris asphalte
const ROAD_LINE = "#f5e9b5";        // jaune marquage axial
const SIDEWALK_FILL = "#e8e4d6";    // beige trottoir
const CURB_FILL = "#a8a298";        // gris bordure
const CONCRETE_FILL = "#c8c2b5";    // gris béton URBAQUAI
const CONCRETE_DARK = "#9b9489";    // chanfrein/biseau
const RUBAN_FILL = "#1f1c19";       // rubans sombres sur D-004
const BUS_FILL = "#1f2937";
const BUS_WINDOW = "#cbd5e1";
const CAR_FILL = "#94a3b8";
const CAR_STROKE = "#475569";
const PARK_LINE = "#fff";

/* ────────── Bus (vue de dessus) ────────── */
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

/* ────────── Voiture (vue de dessus) ────────── */
function Car({
  x,
  y,
  rotation = 0,
  width = 22,
  height = 44,
}: {
  x: number;
  y: number;
  rotation?: number;
  width?: number;
  height?: number;
}) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={3}
        fill={CAR_FILL}
        stroke={CAR_STROKE}
        strokeWidth={0.7}
      />
      <rect
        x={-width / 2 + 2.5}
        y={-height / 2 + 6}
        width={width - 5}
        height={height - 16}
        rx={1.5}
        fill={CAR_STROKE}
        opacity={0.35}
      />
    </g>
  );
}

/* ────────── Quai URBAQUAI : succession de modules béton ────────── */
function QuaiUrbaquai({
  x,
  y,
  width,
  depth = 26, // ≈ 1.5m à l'échelle ~17px/m
}: {
  x: number;
  y: number;
  width: number;
  depth?: number;
}) {
  // Composition : D-004 (gauche, ~1.5m) + D-002 (centre, 3m) + D-003 (droite, ~1.5m)
  // Ratios approximatifs : 25% / 50% / 25%
  const leftW = width * 0.25;
  const midW = width * 0.50;
  const rightW = width * 0.25;
  const chamfer = 3;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* D-004 fin gauche : avec biseau côté chaussée + rubans */}
      <path
        d={`M0 0 L${leftW} 0 L${leftW} ${depth} L${chamfer} ${depth} L0 ${depth - chamfer} Z`}
        fill={CONCRETE_FILL}
        stroke={CONCRETE_DARK}
        strokeWidth={0.5}
      />
      {/* 4 rubans verticaux sur D-004 */}
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
      {/* Joint entre D-004 et D-002 */}
      <line x1={leftW} y1={0} x2={leftW} y2={depth} stroke={CONCRETE_DARK} strokeWidth={0.7} />
      {/* Joint entre D-002 et D-003 */}
      <line x1={leftW + midW} y1={0} x2={leftW + midW} y2={depth} stroke={CONCRETE_DARK} strokeWidth={0.7} />
      {/* 2 rainures de guidage centrales (simplifiées) côté chaussée */}
      <line
        x1={leftW + 6}
        y1={depth - 4}
        x2={leftW + midW - 6}
        y2={depth - 4}
        stroke={RUBAN_FILL}
        strokeWidth={0.7}
        opacity={0.6}
      />

      {/* D-003 fin droite : biseau symétrique */}
      <path
        d={`M${leftW + midW} 0 L${width} 0 L${width} ${depth - chamfer} L${width - chamfer} ${depth} L${leftW + midW} ${depth} Z`}
        fill={CONCRETE_FILL}
        stroke={CONCRETE_DARK}
        strokeWidth={0.5}
      />

      {/* Étiquette discrète */}
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

/* ────────── Carte de typologie ────────── */
function Diagram({
  title,
  subtitle,
  children,
  viewBox = "0 0 380 240",
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
        <svg
          viewBox={viewBox}
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          aria-hidden
        >
          {children}
        </svg>
      </div>
    </div>
  );
}

/* ────────── Composant principal ────────── */
export function TypologieDiagrams() {
  // Constantes communes — quai centré horizontalement, attaché au trottoir
  const QUAI_X = 130;
  const QUAI_W = 120;
  const QUAI_DEPTH = 26;
  const SIDEWALK_Y = 30;          // hauteur trottoir
  const QUAI_Y = SIDEWALK_Y;      // quai colle au trottoir
  const QUAI_BOTTOM = QUAI_Y + QUAI_DEPTH;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">

      {/* ─── 1. Bataille 90° ─────────────────────────────────────── */}
      <Diagram title="Stationnement bataille" subtitle="Angle 90°">
        {/* Trottoir */}
        <rect x={0} y={0} width={380} height={SIDEWALK_Y} fill={SIDEWALK_FILL} />
        {/* Bordure */}
        <rect x={0} y={SIDEWALK_Y - 1.5} width={380} height={1.5} fill={CURB_FILL} />

        {/* Stationnements à gauche du quai (perpendiculaires) */}
        {[15, 50, 90].map((cx) => (
          <g key={cx}>
            <rect x={cx - 12} y={QUAI_Y} width={24} height={90} fill="none" stroke={PARK_LINE} strokeWidth={1} strokeDasharray="2 2" />
            <Car x={cx} y={QUAI_Y + 30} rotation={0} width={20} height={42} />
          </g>
        ))}

        {/* Quai URBAQUAI attaché au trottoir */}
        <QuaiUrbaquai x={QUAI_X} y={QUAI_Y} width={QUAI_W} />

        {/* Stationnements à droite du quai (perpendiculaires) */}
        {[290, 325, 365].map((cx) => (
          <g key={cx}>
            <rect x={cx - 12} y={QUAI_Y} width={24} height={90} fill="none" stroke={PARK_LINE} strokeWidth={1} strokeDasharray="2 2" />
            <Car x={cx} y={QUAI_Y + 30} rotation={0} width={20} height={42} />
          </g>
        ))}

        {/* Chaussée en bas */}
        <rect x={0} y={QUAI_Y + 90} width={380} height={120} fill={ROAD_FILL} />
        <line
          x1={0}
          y1={QUAI_Y + 90 + 60}
          x2={380}
          y2={QUAI_Y + 90 + 60}
          stroke={ROAD_LINE}
          strokeWidth={1}
          strokeDasharray="8 6"
        />
        {/* Bus arrêté devant le quai */}
        <Bus x={QUAI_X + 5} y={QUAI_BOTTOM + 22} />

        {/* Cotes */}
        <text x={50} y={QUAI_Y + 95} fontSize={8} fill="#374151" fontFamily="monospace">
          5,00 × 2,50 m
        </text>
      </Diagram>

      {/* ─── 2. Épi 45° ──────────────────────────────────────────── */}
      <Diagram title="Stationnement en épi" subtitle="Angle 45°">
        <rect x={0} y={0} width={380} height={SIDEWALK_Y} fill={SIDEWALK_FILL} />
        <rect x={0} y={SIDEWALK_Y - 1.5} width={380} height={1.5} fill={CURB_FILL} />

        {/* Stationnements en épi à gauche */}
        {[5, 50, 95].map((cx, i) => (
          <g key={cx}>
            <line
              x1={cx}
              y1={QUAI_Y}
              x2={cx + 70}
              y2={QUAI_Y + 90}
              stroke={PARK_LINE}
              strokeWidth={1}
              strokeDasharray="2 2"
            />
            {i < 3 && <Car x={cx + 20} y={QUAI_Y + 35} rotation={26} width={20} height={42} />}
          </g>
        ))}
        <line
          x1={0}
          y1={QUAI_Y + 90}
          x2={QUAI_X - 5}
          y2={QUAI_Y + 90}
          stroke={PARK_LINE}
          strokeWidth={1}
        />

        <QuaiUrbaquai x={QUAI_X} y={QUAI_Y} width={QUAI_W} />

        {/* Stationnements en épi à droite */}
        {[285, 330, 375].map((cx, i) => (
          <g key={cx}>
            <line
              x1={cx}
              y1={QUAI_Y}
              x2={cx + 70}
              y2={QUAI_Y + 90}
              stroke={PARK_LINE}
              strokeWidth={1}
              strokeDasharray="2 2"
            />
            {i < 3 && <Car x={cx + 20} y={QUAI_Y + 35} rotation={26} width={20} height={42} />}
          </g>
        ))}
        <line
          x1={QUAI_X + QUAI_W + 5}
          y1={QUAI_Y + 90}
          x2={380}
          y2={QUAI_Y + 90}
          stroke={PARK_LINE}
          strokeWidth={1}
        />

        <rect x={0} y={QUAI_Y + 90} width={380} height={120} fill={ROAD_FILL} />
        <line
          x1={0}
          y1={QUAI_Y + 90 + 60}
          x2={380}
          y2={QUAI_Y + 90 + 60}
          stroke={ROAD_LINE}
          strokeWidth={1}
          strokeDasharray="8 6"
        />
        <Bus x={QUAI_X + 5} y={QUAI_BOTTOM + 22} />

        <text x={45} y={QUAI_Y + 95} fontSize={8} fill="#374151" fontFamily="monospace">
          5,00 × 2,50 m
        </text>
      </Diagram>

      {/* ─── 3. Longitudinal ─────────────────────────────────────── */}
      <Diagram title="Stationnement longitudinal" subtitle="Parallèle à la chaussée">
        <rect x={0} y={0} width={380} height={SIDEWALK_Y} fill={SIDEWALK_FILL} />
        <rect x={0} y={SIDEWALK_Y - 1.5} width={380} height={1.5} fill={CURB_FILL} />

        {/* Stationnements parallèles à gauche du quai */}
        <rect x={0} y={QUAI_Y} width={QUAI_X - 5} height={36} fill="none" stroke={PARK_LINE} strokeWidth={1} />
        {[35, 90].map((cx) => (
          <Car key={cx} x={cx} y={QUAI_Y + 18} rotation={90} width={24} height={42} />
        ))}
        {/* Crochets verticaux entre places */}
        {[60, 115].map((x) => (
          <g key={x}>
            <line x1={x} y1={QUAI_Y} x2={x} y2={QUAI_Y + 6} stroke={PARK_LINE} strokeWidth={1} />
            <line x1={x} y1={QUAI_Y + 30} x2={x} y2={QUAI_Y + 36} stroke={PARK_LINE} strokeWidth={1} />
          </g>
        ))}

        <QuaiUrbaquai x={QUAI_X} y={QUAI_Y} width={QUAI_W} />

        {/* Stationnements parallèles à droite */}
        <rect x={QUAI_X + QUAI_W + 5} y={QUAI_Y} width={380 - (QUAI_X + QUAI_W + 5)} height={36} fill="none" stroke={PARK_LINE} strokeWidth={1} />
        {[295, 350].map((cx) => (
          <Car key={cx} x={cx} y={QUAI_Y + 18} rotation={90} width={24} height={42} />
        ))}
        {[265, 320].map((x) => (
          <g key={x}>
            <line x1={x} y1={QUAI_Y} x2={x} y2={QUAI_Y + 6} stroke={PARK_LINE} strokeWidth={1} />
            <line x1={x} y1={QUAI_Y + 30} x2={x} y2={QUAI_Y + 36} stroke={PARK_LINE} strokeWidth={1} />
          </g>
        ))}

        {/* Chaussée commence plus haut puisque parking longitudinal moins profond */}
        <rect x={0} y={QUAI_Y + 36} width={380} height={120} fill={ROAD_FILL} />
        <line
          x1={0}
          y1={QUAI_Y + 36 + 50}
          x2={380}
          y2={QUAI_Y + 36 + 50}
          stroke={ROAD_LINE}
          strokeWidth={1}
          strokeDasharray="8 6"
        />
        <Bus x={QUAI_X + 5} y={QUAI_BOTTOM + 14} />

        <text x={5} y={QUAI_Y + 50} fontSize={8} fill="#374151" fontFamily="monospace">
          5,00 × 2,00 m
        </text>
      </Diagram>
    </div>
  );
}
