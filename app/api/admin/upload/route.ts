import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — Upload image
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
  }

  // Validate file type
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/gif",
  ];
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: "Type de fichier non autorisé" },
      { status: 400 }
    );
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 5 Mo)" },
      { status: 400 }
    );
  }

  try {
    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url: blob.url,
        alt: file.name.replace(/\.[^.]+$/, ""),
        size: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json({ ok: true, media });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Erreur d'upload" }, { status: 500 });
  }
}

// GET — List all media
export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const medias = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: medias });
}

// DELETE — Delete a media
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await req.json();
  const media = await prisma.media.findUnique({ where: { id } });

  if (!media) {
    return NextResponse.json({ error: "Média introuvable" }, { status: 404 });
  }

  try {
    await del(media.url);
  } catch {
    // Blob deletion may fail if already deleted
  }

  await prisma.media.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
