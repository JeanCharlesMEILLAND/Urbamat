import { NextResponse } from "next/server";

// Génère côté serveur les schémas SVG des 4 configurations URBAQUAI
// (avancée trottoir, avancée + vélo, île, île + vélo) en string pur.
// Pas d'import de composant React → compatible Route Handler standard.
// Utilisé par l'admin pour montrer le visuel par défaut quand aucune
// image custom n'est uploadée pour une carte.

const C = {
  road: "#525a64",
  roadLine: "#f5e9b5",
  sidewalk: "#e8e4d6",
  curb: "#a8a298",
  concrete: "#c8c2b5",
  concreteDark: "#9b9489",
  ruban: "#1f1c19",
  bus: "#1f2937",
  busWindow: "#cbd5e1",
  bike: "#bbf7d0",
  bikeLine: "#16a34a",
  crosswalk: "#fde047",
};

const QUAI_X = 130;
const QUAI_W = 120;
const QUAI_DEPTH = 26;

function bus(x: number, y: number): string {
  const w = 110;
  const h = 28;
  const windows = [6, 26, 46, 66, 86]
    .map((wx) => `<rect x="${wx}" y="5" width="14" height="6" fill="${C.busWindow}"/>`)
    .join("");
  return `<g transform="translate(${x},${y})"><rect width="${w}" height="${h}" rx="4" fill="${C.bus}"/>${windows}<rect x="6" y="${h - 11}" width="${w - 12}" height="6" fill="${C.busWindow}" opacity="0.4"/><circle cx="${w - 6}" cy="${h / 2}" r="2" fill="#fbbf24"/></g>`;
}

function quai(x: number, y: number): string {
  const w = QUAI_W;
  const d = QUAI_DEPTH;
  const leftW = w * 0.25;
  const midW = w * 0.5;
  const c = 3;
  const rubans = [0.3, 0.45, 0.6, 0.75]
    .map(
      (rx) =>
        `<line x1="${leftW * rx}" y1="4" x2="${leftW * rx}" y2="${d - 4}" stroke="${C.ruban}" stroke-width="1.5"/>`
    )
    .join("");
  return `<g transform="translate(${x},${y})"><path d="M0 0 L${leftW} 0 L${leftW} ${d} L${c} ${d} L0 ${d - c} Z" fill="${C.concrete}" stroke="${C.concreteDark}" stroke-width="0.5"/>${rubans}<rect x="${leftW}" y="0" width="${midW}" height="${d}" fill="${C.concrete}" stroke="${C.concreteDark}" stroke-width="0.5"/><line x1="${leftW}" y1="0" x2="${leftW}" y2="${d}" stroke="${C.concreteDark}" stroke-width="0.7"/><line x1="${leftW + midW}" y1="0" x2="${leftW + midW}" y2="${d}" stroke="${C.concreteDark}" stroke-width="0.7"/><line x1="${leftW + 6}" y1="${d - 4}" x2="${leftW + midW - 6}" y2="${d - 4}" stroke="${C.ruban}" stroke-width="0.7" opacity="0.6"/><path d="M${leftW + midW} 0 L${w} 0 L${w} ${d - c} L${w - c} ${d} L${leftW + midW} ${d} Z" fill="${C.concrete}" stroke="${C.concreteDark}" stroke-width="0.5"/><text x="${w / 2}" y="${d / 2 + 3}" text-anchor="middle" font-size="7" font-family="monospace" fill="${C.concreteDark}" opacity="0.7">URBAQUAI</text></g>`;
}

function bikeIcon(x: number, y: number): string {
  const s = 14;
  return `<g transform="translate(${x},${y})"><circle cx="${-s / 2.5}" cy="0" r="${s / 4}" fill="none" stroke="${C.bikeLine}" stroke-width="1.2"/><circle cx="${s / 2.5}" cy="0" r="${s / 4}" fill="none" stroke="${C.bikeLine}" stroke-width="1.2"/><path d="M${-s / 2.5} 0 L0 ${-s / 3} L${s / 2.5} 0" fill="none" stroke="${C.bikeLine}" stroke-width="1.2" stroke-linecap="round"/><line x1="${-s / 6}" y1="${-s / 3}" x2="${s / 6}" y2="${-s / 3}" stroke="${C.bikeLine}" stroke-width="1.2" stroke-linecap="round"/></g>`;
}

function crossWalkVertical(x: number, y: number, w: number, h: number): string {
  const stripes = Math.floor(h / 4);
  const bars = Array.from({ length: stripes })
    .map((_, i) => `<rect x="0" y="${i * 4}" width="${w}" height="2" fill="${C.crosswalk}"/>`)
    .join("");
  return `<g transform="translate(${x},${y})">${bars}</g>`;
}

function svgWrap(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 220" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
}

function avancee(): string {
  return svgWrap(
    `<rect x="0" y="0" width="380" height="50" fill="${C.sidewalk}"/>` +
      `<rect x="${QUAI_X - 10}" y="50" width="${QUAI_W + 20}" height="${QUAI_DEPTH + 8}" fill="${C.sidewalk}"/>` +
      `<rect x="0" y="48.5" width="${QUAI_X - 10}" height="1.5" fill="${C.curb}"/>` +
      `<rect x="${QUAI_X + QUAI_W + 10}" y="48.5" width="${380 - (QUAI_X + QUAI_W + 10)}" height="1.5" fill="${C.curb}"/>` +
      `<rect x="${QUAI_X - 10}" y="${50 + QUAI_DEPTH + 6.5}" width="${QUAI_W + 20}" height="1.5" fill="${C.curb}"/>` +
      quai(QUAI_X, 56) +
      `<rect x="0" y="${50 + QUAI_DEPTH + 8}" width="380" height="${220 - (50 + QUAI_DEPTH + 8)}" fill="${C.road}"/>` +
      `<line x1="0" y1="140" x2="380" y2="140" stroke="${C.roadLine}" stroke-width="1" stroke-dasharray="8 6"/>` +
      bus(QUAI_X + 5, 50 + QUAI_DEPTH + 18)
  );
}

function avanceeVelo(): string {
  return svgWrap(
    `<rect x="0" y="0" width="380" height="40" fill="${C.sidewalk}"/>` +
      `<rect x="0" y="40" width="380" height="14" fill="${C.bike}"/>` +
      `<line x1="0" y1="40" x2="380" y2="40" stroke="${C.bikeLine}" stroke-width="1" stroke-dasharray="4 3"/>` +
      `<line x1="0" y1="54" x2="380" y2="54" stroke="${C.bikeLine}" stroke-width="1" stroke-dasharray="4 3"/>` +
      bikeIcon(50, 47) +
      bikeIcon(310, 47) +
      `<rect x="${QUAI_X - 10}" y="54" width="${QUAI_W + 20}" height="${QUAI_DEPTH + 8}" fill="${C.sidewalk}"/>` +
      `<rect x="${QUAI_X - 10}" y="${54 + QUAI_DEPTH + 6.5}" width="${QUAI_W + 20}" height="1.5" fill="${C.curb}"/>` +
      quai(QUAI_X, 60) +
      `<rect x="0" y="${54 + QUAI_DEPTH + 8}" width="380" height="${220 - (54 + QUAI_DEPTH + 8)}" fill="${C.road}"/>` +
      `<line x1="0" y1="148" x2="380" y2="148" stroke="${C.roadLine}" stroke-width="1" stroke-dasharray="8 6"/>` +
      bus(QUAI_X + 5, 54 + QUAI_DEPTH + 18)
  );
}

function ile(): string {
  return svgWrap(
    `<rect x="0" y="0" width="380" height="36" fill="${C.sidewalk}"/>` +
      `<rect x="0" y="34.5" width="380" height="1.5" fill="${C.curb}"/>` +
      `<rect x="0" y="36" width="380" height="32" fill="${C.road}"/>` +
      bus(QUAI_X + 5, 42) +
      `<rect x="${QUAI_X - 12}" y="70" width="${QUAI_W + 24}" height="${QUAI_DEPTH + 14}" fill="${C.sidewalk}"/>` +
      `<rect x="${QUAI_X - 12}" y="68.5" width="${QUAI_W + 24}" height="1.5" fill="${C.curb}"/>` +
      `<rect x="${QUAI_X - 12}" y="${70 + QUAI_DEPTH + 12.5}" width="${QUAI_W + 24}" height="1.5" fill="${C.curb}"/>` +
      quai(QUAI_X, 76) +
      crossWalkVertical(QUAI_X + QUAI_W / 2 - 6, 36, 12, 32) +
      `<rect x="0" y="${70 + QUAI_DEPTH + 14}" width="380" height="${220 - (70 + QUAI_DEPTH + 14)}" fill="${C.road}"/>` +
      `<line x1="0" y1="${70 + QUAI_DEPTH + 14 + 30}" x2="380" y2="${70 + QUAI_DEPTH + 14 + 30}" stroke="${C.roadLine}" stroke-width="1" stroke-dasharray="8 6"/>`
  );
}

function ileVelo(): string {
  return svgWrap(
    `<rect x="0" y="0" width="380" height="30" fill="${C.sidewalk}"/>` +
      `<rect x="0" y="28.5" width="380" height="1.5" fill="${C.curb}"/>` +
      `<rect x="0" y="30" width="380" height="14" fill="${C.bike}"/>` +
      `<line x1="0" y1="30" x2="380" y2="30" stroke="${C.bikeLine}" stroke-width="1" stroke-dasharray="4 3"/>` +
      `<line x1="0" y1="44" x2="380" y2="44" stroke="${C.bikeLine}" stroke-width="1" stroke-dasharray="4 3"/>` +
      bikeIcon(50, 37) +
      bikeIcon(310, 37) +
      `<rect x="0" y="44" width="380" height="32" fill="${C.road}"/>` +
      bus(QUAI_X + 5, 50) +
      `<rect x="${QUAI_X - 12}" y="78" width="${QUAI_W + 24}" height="${QUAI_DEPTH + 14}" fill="${C.sidewalk}"/>` +
      `<rect x="${QUAI_X - 12}" y="76.5" width="${QUAI_W + 24}" height="1.5" fill="${C.curb}"/>` +
      `<rect x="${QUAI_X - 12}" y="${78 + QUAI_DEPTH + 12.5}" width="${QUAI_W + 24}" height="1.5" fill="${C.curb}"/>` +
      quai(QUAI_X, 84) +
      crossWalkVertical(QUAI_X + QUAI_W / 2 - 6, 30, 12, 46) +
      `<rect x="0" y="${78 + QUAI_DEPTH + 14}" width="380" height="${220 - (78 + QUAI_DEPTH + 14)}" fill="${C.road}"/>` +
      `<line x1="0" y1="${78 + QUAI_DEPTH + 14 + 28}" x2="380" y2="${78 + QUAI_DEPTH + 14 + 28}" stroke="${C.roadLine}" stroke-width="1" stroke-dasharray="8 6"/>`
  );
}

const DIAGRAMS: Record<string, () => string> = {
  avancee,
  avancee_velo: avanceeVelo,
  ile,
  ile_velo: ileVelo,
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const gen = DIAGRAMS[id];
  if (!gen) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(gen(), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
