import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const updateSchema = z.object({
  titre: z.string().min(1).optional(),
  ville: z.string().min(1).optional(),
  departement: z.string().min(1).optional(),
  annee: z.number().int().min(2000).max(2100).optional(),
  typologieQuai: z.string().min(1).optional(),
  contexte: z.string().min(1).optional(),
  longueurMl: z.number().positive().optional(),
  nbStations: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
});

async function requireAuth() {
  const ok = await getSession();
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return null;
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAuth();
  if (authError) return authError;

  const realisation = await prisma.realisation.findUnique({ where: { id: params.id } });
  if (!realisation) {
    return NextResponse.json({ success: false, error: "Introuvable" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: realisation });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data: any = { ...parsed.data };
    if (data.titre || data.ville || data.departement) {
      const current = await prisma.realisation.findUnique({ where: { id: params.id } });
      if (current) {
        data.slug = slugify(
          (data.ville || current.ville) + "-" +
          (data.departement || current.departement) + "-" +
          (data.titre || current.titre)
        );
      }
    }

    const realisation = await prisma.realisation.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, data: realisation });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAuth();
  if (authError) return authError;

  await prisma.realisation.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
