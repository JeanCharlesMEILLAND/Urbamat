import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const documentSchema = z.object({
  titre: z.string().min(1),
  type: z.enum(["fiche", "guide", "cctp", "plan"]),
  fichierUrl: z.string().min(1),
  description: z.string().optional(),
});

async function requireAuth() {
  const ok = await getSession();
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return null;
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const documents = await prisma.document.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, data: documents });
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = documentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Données invalides" }, { status: 400 });
    }

    const doc = await prisma.document.create({ data: parsed.data });
    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
