/**
 * Représentation simplifiée du quai URBAQUAI à intégrer dans les schémas de
 * typologie de stationnement. Style cohérent avec les planches purple/blanc
 * (bordure violette pleine, couleur béton, label brand au centre).
 */

interface QuaiSchematicTopDownProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function QuaiSchematicTopDown({ x, y, width, height }: QuaiSchematicTopDownProps) {
  const PURPLE = "#7C3AED";
  const PURPLE_LIGHT = "#E9D5FF"; // violet très clair pour l'intérieur
  const CONCRETE = "#C8C2B5";
  const TEXT_DARK = "#1F2937";
  const RUBAN = "#1F1C19";

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Fond béton */}
      <rect width={width} height={height} fill={CONCRETE} stroke={PURPLE} strokeWidth={1.5} rx={2} />

      {/* Surlignage violet doux à l'intérieur (cohérence brand) */}
      <rect x={1.5} y={1.5} width={width - 3} height={height - 3} fill="none" stroke={PURPLE_LIGHT} strokeWidth={0.6} opacity={0.6} />

      {/* Joints inter-modules verticaux (3 joints = 4 modules visuels) */}
      {[0.25, 0.50, 0.75].map((rx) => (
        <line
          key={rx}
          x1={width * rx}
          y1={2}
          x2={width * rx}
          y2={height - 2}
          stroke={PURPLE}
          strokeWidth={0.6}
          opacity={0.4}
          strokeDasharray="2 2"
        />
      ))}

      {/* Rubans clairs côté gauche (D-004a) — 3 traits compacts */}
      {[0.06, 0.10, 0.14].map((rx, i) => (
        <line
          key={`ruban-${i}`}
          x1={width * rx}
          y1={3}
          x2={width * rx}
          y2={height - 3}
          stroke={RUBAN}
          strokeWidth={1}
          opacity={0.8}
        />
      ))}

      {/* Label URBAQUAI */}
      <text
        x={width / 2 + 6}
        y={height / 2 + 4}
        textAnchor="middle"
        fontSize={Math.min(11, height * 0.18)}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight={700}
        fill={TEXT_DARK}
        letterSpacing={0.5}
      >
        URBAQUAI
      </text>
    </g>
  );
}
