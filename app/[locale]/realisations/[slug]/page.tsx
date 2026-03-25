import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { MapPin, Calendar, ArrowLeft, ArrowRight, Ruler, Building2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

async function getRealisation(slug: string) {
  try {
    return await prisma.realisation.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const real = await getRealisation(slug);
  if (!real) return { title: "Réalisation introuvable" };

  return {
    title: `${real.titre} — Réalisation URBAQUAI`,
    description: `${real.contexte} — ${real.typologieQuai}, ${real.longueurMl} ml de quai.`,
  };
}

export default async function RealisationDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const real = await getRealisation(slug);

  if (!real) {
    notFound();
  }

  return (
    <div>
      {/* Breadcrumb */}
      <section className="bg-neutral-light py-4 border-b border-gray-200">
        <Container>
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/realisations" className="hover:text-primary transition-colors">Réalisations</Link>
            <span>/</span>
            <span className="text-neutral-dark font-medium">{real.ville}</span>
          </nav>
        </Container>
      </section>

      {/* Hero */}
      <section className="bg-neutral-light py-12 lg:py-20">
        <Container>
          <div className="max-w-3xl">
            <Badge variant="info" className="mb-4">{real.typologieQuai}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-dark">{real.titre}</h1>
            <div className="flex flex-wrap items-center gap-6 mt-4 text-gray-500">
              <span className="flex items-center gap-1.5"><MapPin size={16} />{real.ville} ({real.departement})</span>
              <span className="flex items-center gap-1.5"><Calendar size={16} />{real.annee}</span>
              <span className="flex items-center gap-1.5"><Ruler size={16} />{real.longueurMl} ml</span>
              <span className="flex items-center gap-1.5"><Building2 size={16} />{real.nbStations} station{real.nbStations > 1 ? "s" : ""}</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Contenu */}
      <section className="py-12 lg:py-20 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-neutral-dark mb-4">Le projet</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{real.contexte}</p>
            </div>
            <div className="bg-neutral-light rounded-lg p-6 border border-gray-200 h-fit">
              <h3 className="font-bold text-neutral-dark mb-4">Fiche technique</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Ville</dt><dd className="font-medium text-neutral-dark">{real.ville}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Département</dt><dd className="font-medium text-neutral-dark">{real.departement}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Année</dt><dd className="font-mono font-medium text-neutral-dark">{real.annee}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Typologie</dt><dd className="font-medium text-neutral-dark text-right">{real.typologieQuai}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Longueur totale</dt><dd className="font-mono font-medium text-primary">{real.longueurMl} ml</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Stations</dt><dd className="font-mono font-medium text-primary">{real.nbStations}</dd></div>
              </dl>
              <Button href="/contact" variant="outline" size="sm" className="mt-6 w-full">
                Un projet similaire ?
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Navigation */}
      <section className="py-8 bg-neutral-light border-t border-gray-200">
        <Container>
          <div className="flex items-center justify-between">
            <Link href="/realisations" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:text-primary-600 transition-colors">
              <ArrowLeft size={16} />
              Toutes les réalisations
            </Link>
            <Button href="/contact" size="sm">
              Nous contacter
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
