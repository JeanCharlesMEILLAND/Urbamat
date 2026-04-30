import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

async function requireAuth() {
  const ok = await getSession();
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return null;
}

const patchSchema = z.object({
  titre: z.string().min(1).optional(),
  type: z.enum(["fiche", "guide", "cctp", "plan"]).optional(),
  fichierUrl: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  featured: z.boolean().optional(),
});

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAuth();
  if (authError) return authError;

  await prisma.document.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAuth();
  if (authError) return authError;

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Données invalides" }, { status: 400 });
  }

  const updated = await prisma.document.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json({ success: true, data: updated });
}
