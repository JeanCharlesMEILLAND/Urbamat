import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RealisationsGrid } from "@/components/realisations/RealisationsGrid";
import { prisma } from "@/lib/prisma";
import type { Realisation } from "@/lib/types";

export const metadata: Metadata = {
  title: "Réalisations — Nos chantiers URBAQUAI en France",
  description:
    "Découvrez nos réalisations URBAQUAI à travers la France : fiches détaillées de nos quais bus modulaires, stations et longueurs déployées.",
};

const DEMO_REALISATIONS: Realisation[] = [
  {
    id: "demo-1",
    titre: "Carquefou (44) — Mobilité autonome",
    ville: "Carquefou",
    departement: "44",
    annee: 2025,
    typologieQuai: "6 stations — 9ml à 16ml",
    contexte: "Service expérimental mobilité autonome. Déploiement de quais modulaires pour véhicules autonomes sur un circuit dédié.",
    longueurMl: 72,
    nbStations: 6,
    slug: "carquefou-44-mobilite-autonome",
  },
  {
    id: "demo-2",
    titre: "Strasbourg (67) — Réseau CTS",
    ville: "Strasbourg",
    departement: "67",
    annee: 2024,
    typologieQuai: "12 arrêts — 12ml",
    contexte: "Mise en accessibilité de 12 arrêts sur l'axe Route du Rhin dans le cadre du renouvellement du réseau CTS.",
    longueurMl: 144,
    nbStations: 12,
    slug: "strasbourg-67-cts-accessibilite",
  },
  {
    id: "demo-3",
    titre: "Uckange (57) — Quai provisoire",
    ville: "Uckange",
    departement: "57",
    annee: 2024,
    typologieQuai: "2 stations — 12ml",
    contexte: "Installation de quais provisoires pendant les travaux de réaménagement du centre-ville. Configuration réversible.",
    longueurMl: 24,
    nbStations: 2,
    slug: "uckange-57-quai-provisoire",
  },
  {
    id: "demo-4",
    titre: "Lyon (69) — BHNS C3",
    ville: "Lyon",
    departement: "69",
    annee: 2023,
    typologieQuai: "8 stations — 15ml",
    contexte: "Quais en île pour la ligne C3 BHNS, en site propre. Configuration île bidirectionnelle avec intégration paysagère.",
    longueurMl: 120,
    nbStations: 8,
    slug: "lyon-69-bhns-c3",
  },
  {
    id: "demo-5",
    titre: "Nantes (44) — Place du Commerce",
    ville: "Nantes",
    departement: "44",
    annee: 2024,
    typologieQuai: "6 arrêts — 12ml",
    contexte: "Quais modulaires sur axe à fort trafic multimodal. Cohabitation bus-vélo sécurisée.",
    longueurMl: 72,
    nbStations: 6,
    slug: "nantes-44-place-commerce",
  },
];

async function getRealisations(): Promise<Realisation[]> {
  try {
    const dbRealisations = await prisma.realisation.findMany({
      orderBy: { annee: "desc" },
    });
    if (dbRealisations.length > 0) return dbRealisations;
  } catch {
    // BDD non disponible ou vide
  }
  return DEMO_REALISATIONS;
}

export default async function RealisationsPage() {
  const realisations = await getRealisations();

  const totalMl = realisations.reduce((sum, r) => sum + r.longueurMl, 0);
  const totalStations = realisations.reduce((sum, r) => sum + r.nbStations, 0);

  return (
    <div>
      {/* Hero */}
      <section className="bg-neutral-light py-16 lg:py-24">
        <Container>
          <SectionHeader
            titre="Nos réalisations"
            sousTitre="Quais modulaires URBAQUAI déployés à travers la France. Chaque projet est une réponse sur-mesure aux enjeux locaux d'accessibilité."
          />
          {/* Totaux */}
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{realisations.length}</div>
              <div className="text-sm text-gray-500">projets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalStations}</div>
              <div className="text-sm text-gray-500">stations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{Math.round(totalMl)} ml</div>
              <div className="text-sm text-gray-500">de quais posés</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Grille filtrable */}
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <RealisationsGrid realisations={realisations} />
        </Container>
      </section>
    </div>
  );
}
