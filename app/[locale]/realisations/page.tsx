import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RealisationsGrid } from "@/components/realisations/RealisationsGrid";
import { prisma } from "@/lib/prisma";
import type { Realisation } from "@/lib/types";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "realisations" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const DEMO_REALISATIONS: Realisation[] = [
  { id: "demo-1", titre: "Carquefou (44) — Mobilité autonome", ville: "Carquefou", departement: "44", annee: 2025, typologieQuai: "6 stations — 9ml à 16ml", contexte: "Service expérimental mobilité autonome.", longueurMl: 72, nbStations: 6, slug: "carquefou-44-mobilite-autonome" },
  { id: "demo-2", titre: "Strasbourg (67) — Réseau CTS", ville: "Strasbourg", departement: "67", annee: 2024, typologieQuai: "12 arrêts — 12ml", contexte: "Mise en accessibilité de 12 arrêts.", longueurMl: 144, nbStations: 12, slug: "strasbourg-67-cts-accessibilite" },
  { id: "demo-3", titre: "Uckange (57) — Quai provisoire", ville: "Uckange", departement: "57", annee: 2024, typologieQuai: "2 stations — 12ml", contexte: "Quais provisoires centre-ville.", longueurMl: 24, nbStations: 2, slug: "uckange-57-quai-provisoire" },
  { id: "demo-4", titre: "Lyon (69) — BHNS C3", ville: "Lyon", departement: "69", annee: 2023, typologieQuai: "8 stations — 15ml", contexte: "Quais en île ligne C3 BHNS.", longueurMl: 120, nbStations: 8, slug: "lyon-69-bhns-c3" },
  { id: "demo-5", titre: "Nantes (44) — Place du Commerce", ville: "Nantes", departement: "44", annee: 2024, typologieQuai: "6 arrêts — 12ml", contexte: "Quais modulaires multimodaux.", longueurMl: 72, nbStations: 6, slug: "nantes-44-place-commerce" },
];

async function getRealisations(): Promise<Realisation[]> {
  try {
    const db = await prisma.realisation.findMany({ orderBy: { annee: "desc" } });
    if (db.length > 0) return db;
  } catch {}
  return DEMO_REALISATIONS;
}

export default async function RealisationsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("realisations");
  const realisations = await getRealisations();
  const totalMl = realisations.reduce((s, r) => s + r.longueurMl, 0);
  const totalStations = realisations.reduce((s, r) => s + r.nbStations, 0);

  return (
    <div>
      <section className="bg-neutral-light py-16 lg:py-24">
        <Container>
          <SectionHeader titre={t("titre")} sousTitre={t("sousTitre")} />
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{realisations.length}</div>
              <div className="text-sm text-gray-500">{t("projets")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalStations}</div>
              <div className="text-sm text-gray-500">{t("stations")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{Math.round(totalMl)} ml</div>
              <div className="text-sm text-gray-500">{t("quaisPoses")}</div>
            </div>
          </div>
        </Container>
      </section>
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <RealisationsGrid realisations={realisations} />
        </Container>
      </section>
    </div>
  );
}
