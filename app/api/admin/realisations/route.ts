import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const realisationSchema = z.object({
  titre: z.string().min(1),
  ville: z.string().min(1),
  departement: z.string().min(1),
  annee: z.number().int().min(2000).max(2100),
  typologieQuai: z.string().min(1),
  contexte: z.string().min(1),
  longueurMl: z.number().positive(),
  nbStations: z.number().int().positive(),
});

async function requireAuth() {
  const ok = await getSession();
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return null;
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const realisations = await prisma.realisation.findMany({
    orderBy: { annee: "desc" },
  });
  return NextResponse.json({ success: true, data: realisations });
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = realisationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const slug = slugify(parsed.data.ville + "-" + parsed.data.departement + "-" + parsed.data.titre);

    const realisation = await prisma.realisation.create({
      data: { ...parsed.data, slug },
    });

    return NextResponse.json({ success: true, data: realisation }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ success: false, error: "Ce slug existe déjà" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
