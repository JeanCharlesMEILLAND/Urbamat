import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { EDITABLE_PAGES } from "@/lib/content";

// GET — Liste tous les contenus éditables
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const contents = await prisma.pageContent.findMany({
    orderBy: [{ page: "asc" }, { ordre: "asc" }],
  });

  return NextResponse.json({ pages: EDITABLE_PAGES, contents });
}

// PUT — Met à jour un ou plusieurs contenus
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { updates } = body as {
    updates: { page: string; section: string; contenu: string }[];
  };

  if (!updates || !Array.isArray(updates)) {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 });
  }

  const results = [];
  for (const u of updates) {
    const result = await prisma.pageContent.upsert({
      where: { page_section: { page: u.page, section: u.section } },
      update: { contenu: u.contenu },
      create: {
        page: u.page,
        section: u.section,
        contenu: u.contenu,
        type: "texte",
      },
    });
    results.push(result);
  }

  return NextResponse.json({ ok: true, count: results.length });
}
