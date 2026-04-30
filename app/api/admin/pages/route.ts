import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { EDITABLE_PAGES } from "@/lib/content";

/** Mapping section.key (admin CMS) → chemin dans les fichiers messages/{locale}.json
 *  (ex. "hero_titre" → "hero.titre"). Permet de retrouver le texte par défaut
 *  pour la locale active dans l'admin. */
const I18N_KEY_MAP: Record<string, string> = {
  // Hero
  hero_titre: "hero.titre",
  hero_sous_titre: "hero.sousTitre",
  hero_description: "hero.description",
  // Concept (sur la home)
  concept_titre: "concept.titre",
  concept_description: "concept.description",
  concept_legende: "concept.visuelLegende",
  // Configurations (section + 4 cartes)
  configs_titre: "configurationsGrid.titre",
  configs_sous_titre: "configurationsGrid.sousTitre",
  config_avancee_titre: "configurations.avancee.titre",
  config_avancee_sous_titre: "configurations.avancee.sousTitre",
  config_avancee_description: "configurations.avancee.description",
  config_avancee_velo_titre: "configurations.avancee_velo.titre",
  config_avancee_velo_sous_titre: "configurations.avancee_velo.sousTitre",
  config_avancee_velo_description: "configurations.avancee_velo.description",
  config_ile_titre: "configurations.ile.titre",
  config_ile_sous_titre: "configurations.ile.sousTitre",
  config_ile_description: "configurations.ile.description",
  config_ile_velo_titre: "configurations.ile_velo.titre",
  config_ile_velo_sous_titre: "configurations.ile_velo.sousTitre",
  config_ile_velo_description: "configurations.ile_velo.description",
  // CTA Contact
  cta_titre: "ctaContact.titre",
  cta_description: "ctaContact.sousTitre",
  // Contact page
  prescripteur_titre: "contact.prescripteur.titre",
  prescripteur_texte: "contact.prescripteur.texte",
  // Layout
  navbar_concept: "nav.concept",
  navbar_produit: "nav.produit",
  navbar_configurateur: "nav.configurateur",
  navbar_apropos: "nav.apropos",
  navbar_telechargements: "nav.telechargements",
  navbar_contact: "nav.contact",
  navbar_devis_cta: "nav.devis",
  footer_description: "footer.description",
};

function resolvePath(obj: unknown, path: string): string {
  return path.split(".").reduce<unknown>(
    (acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined),
    obj
  ) as string;
}

// GET — Liste tous les contenus éditables (+ defaults i18n pour la locale)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const locale = req.nextUrl.searchParams.get("locale") || "fr";

  const [contents, messages] = await Promise.all([
    prisma.pageContent.findMany({
      where: { locale },
      orderBy: [{ page: "asc" }, { ordre: "asc" }],
    }),
    import(`@/messages/${locale}.json`)
      .then((m) => m.default ?? m)
      .catch(() => ({})),
  ]);

  // Résout les valeurs par défaut depuis les messages/{locale}.json pour chaque
  // section connue (par mapping I18N_KEY_MAP). Le client utilise ces défauts pour
  // pré-remplir les inputs même quand aucune valeur CMS n'existe.
  const defaults: Record<string, string> = {};
  for (const sectionKey of Object.keys(I18N_KEY_MAP)) {
    const value = resolvePath(messages, I18N_KEY_MAP[sectionKey]);
    if (typeof value === "string" && value.length) {
      defaults[sectionKey] = value;
    }
  }

  return NextResponse.json({ pages: EDITABLE_PAGES, contents, defaults });
}

// PUT — Met à jour un ou plusieurs contenus
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { updates, locale = "fr" } = body as {
    updates: { page: string; section: string; contenu: string; type?: string }[];
    locale?: string;
  };

  if (!updates || !Array.isArray(updates)) {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 });
  }

  const results = [];
  for (const u of updates) {
    const result = await prisma.pageContent.upsert({
      where: {
        page_section_locale: { page: u.page, section: u.section, locale },
      },
      update: { contenu: u.contenu },
      create: {
        page: u.page,
        section: u.section,
        locale,
        contenu: u.contenu,
        type: (u.type as any) || "texte",
      },
    });
    results.push(result);
  }

  return NextResponse.json({ ok: true, count: results.length });
}
