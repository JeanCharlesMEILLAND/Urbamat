import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const statSchema = z.object({
  label: z.string().min(1),
  valeur: z.string().min(1),
  ordre: z.number().int(),
});

async function requireAuth() {
  const ok = await getSession();
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return null;
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const stats = await prisma.stat.findMany({ orderBy: { ordre: "asc" } });
  return NextResponse.json({ success: true, data: stats });
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = statSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Données invalides" }, { status: 400 });
    }

    const stat = await prisma.stat.create({ data: parsed.data });
    return NextResponse.json({ success: true, data: stat }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { stats } = body as { stats: { id: string; label: string; valeur: string; ordre: number }[] };

    await Promise.all(
      stats.map((s) =>
        prisma.stat.update({
          where: { id: s.id },
          data: { label: s.label, valeur: s.valeur, ordre: s.ordre },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
