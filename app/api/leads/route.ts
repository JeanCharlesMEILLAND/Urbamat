import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        prenom: parsed.data.prenom,
        nom: parsed.data.nom,
        societe: parsed.data.societe,
        email: parsed.data.email,
        profil: parsed.data.profil,
        departement: parsed.data.departement,
        message: parsed.data.message ?? null,
      },
    });

    // TODO: envoyer email de notification (Resend / Nodemailer)

    return NextResponse.json({ success: true, data: { id: lead.id } }, { status: 201 });
  } catch (error) {
    console.error("Erreur création lead:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
