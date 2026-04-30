import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Endpoints pour les presets caméra de l'animation 3D du concept (home).
// GET (public) : tous les visiteurs lisent les keyframes pour avoir la même
//                séquence cinématique.
// PUT (admin)  : sauve ou met à jour un preset (un seul) ou un set complet.
//                Aussi utilisé pour la migration localStorage → BDD.

type CamPhase = "assembly" | "arrival" | "hold" | "departure";

const KEYFRAME_SCHEMA = z.object({
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  target: z.object({ x: z.number(), y: z.number(), z: z.number() }),
});

const PUT_SCHEMA = z.object({
  // Soit on sauve une seule phase, soit on push un batch (utile pour la migration)
  phase: z.enum(["assembly", "arrival", "hold", "departure"]).optional(),
  keyframe: KEYFRAME_SCHEMA.optional(),
  // Migration : push de l'ensemble depuis localStorage
  batch: z
    .object({
      assembly: KEYFRAME_SCHEMA.nullable().optional(),
      arrival: KEYFRAME_SCHEMA.nullable().optional(),
      hold: KEYFRAME_SCHEMA.nullable().optional(),
      departure: KEYFRAME_SCHEMA.nullable().optional(),
    })
    .optional(),
});

export async function GET() {
  const rows = await prisma.camPreset.findMany();
  // Renvoie un objet { phase: { position, target } | null } pour les 4 phases
  const out: Record<CamPhase, { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } } | null> = {
    assembly: null,
    arrival: null,
    hold: null,
    departure: null,
  };
  for (const r of rows) {
    if (r.phase === "assembly" || r.phase === "arrival" || r.phase === "hold" || r.phase === "departure") {
      out[r.phase] = {
        position: { x: r.posX, y: r.posY, z: r.posZ },
        target: { x: r.tgtX, y: r.tgtY, z: r.tgtZ },
      };
    }
  }
  return NextResponse.json(out, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = PUT_SCHEMA.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Format invalide", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Mode 1 : update / insert d'une seule phase
  if (parsed.data.phase && parsed.data.keyframe) {
    const { phase, keyframe } = parsed.data;
    await prisma.camPreset.upsert({
      where: { phase },
      update: {
        posX: keyframe.position.x,
        posY: keyframe.position.y,
        posZ: keyframe.position.z,
        tgtX: keyframe.target.x,
        tgtY: keyframe.target.y,
        tgtZ: keyframe.target.z,
      },
      create: {
        phase,
        posX: keyframe.position.x,
        posY: keyframe.position.y,
        posZ: keyframe.position.z,
        tgtX: keyframe.target.x,
        tgtY: keyframe.target.y,
        tgtZ: keyframe.target.z,
      },
    });
    return NextResponse.json({ ok: true });
  }

  // Mode 2 : migration batch (depuis localStorage → BDD)
  if (parsed.data.batch) {
    const ops = [];
    for (const phase of ["assembly", "arrival", "hold", "departure"] as const) {
      const kf = parsed.data.batch[phase];
      if (kf) {
        ops.push(
          prisma.camPreset.upsert({
            where: { phase },
            update: {
              posX: kf.position.x,
              posY: kf.position.y,
              posZ: kf.position.z,
              tgtX: kf.target.x,
              tgtY: kf.target.y,
              tgtZ: kf.target.z,
            },
            create: {
              phase,
              posX: kf.position.x,
              posY: kf.position.y,
              posZ: kf.position.z,
              tgtX: kf.target.x,
              tgtY: kf.target.y,
              tgtZ: kf.target.z,
            },
          })
        );
      }
    }
    await prisma.$transaction(ops);
    return NextResponse.json({ ok: true, count: ops.length });
  }

  return NextResponse.json({ error: "Aucune donnée" }, { status: 400 });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  await prisma.camPreset.deleteMany();
  return NextResponse.json({ ok: true });
}
