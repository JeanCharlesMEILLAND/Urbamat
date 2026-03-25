import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Download, Ruler, Weight, Palette, Truck, UtensilsCrossed, Store } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { TechnicalAccordion } from "@/components/produit/TechnicalAccordion";
import { PRODUCT_SPECS } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "urbaterra" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const FEATURES = [
  { icon: Ruler, label: "Surface", value: "9 à 18 m²" },
  { icon: Weight, label: "Béton", value: "C40/50" },
  { icon: Store, label: "Usage", value: "Commercial" },
  { icon: Palette, label: "Coloris", value: "4 naturels" },
  { icon: Truck, label: "Pose", value: "48h" },
  { icon: UtensilsCrossed, label: "Capacité", value: "Jusqu'à 36 couverts" },
];

const CONFIGS = [
  {
    titre: "Configuration 9 m²",
    modules: "1 central + 2 latéraux",
    surface: "9 m²",
    capacite: {
      optimise: "6 à 9 tables de 2 (12-18 couverts)",
      confortable: "4 tables de 2 ou 3 tables de 4 (8-10 couverts)",
    },
  },
  {
    titre: "Configuration 18 m²",
    modules: "2 centraux + 2 latéraux",
    surface: "18 m²",
    capacite: {
      optimise: "12 à 18 tables de 2 (24-36 couverts)",
      confortable: "8 tables de 2 ou 5-6 tables de 4 (16-24 couverts)",
    },
  },
];

const ACCORDION_ITEMS = [
  {
    titre: "Dimensions et poids des modules",
    contenu: (
      <div className="space-y-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-500">Module</th>
              <th className="text-right py-2 font-medium text-gray-500">Dimensions</th>
              <th className="text-right py-2 font-medium text-gray-500">Poids</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {PRODUCT_SPECS.modules.map((m) => (
              <tr key={m.ref}>
                <td className="py-2 font-medium">{m.nom} <span className="font-mono text-xs text-gray-400">({m.ref})</span></td>
                <td className="py-2 text-right font-mono text-sm">{m.dimensions}</td>
                <td className="py-2 text-right font-mono text-sm">{m.poids}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-sm text-gray-500">Même gamme de modules que URBAQUAI 140+50 — technologie identique.</p>
      </div>
    ),
  },
  {
    titre: "Caractéristiques techniques",
    contenu: (
      <ul className="space-y-2 list-disc list-inside text-sm">
        <li>Béton : <strong>{PRODUCT_SPECS.beton.classe}</strong>, {PRODUCT_SPECS.beton.exposition}</li>
        <li>Ciment <strong>{PRODUCT_SPECS.beton.ciment}</strong></li>
        <li>Finition : {PRODUCT_SPECS.finition.type}</li>
        <li>Résistance gel/dégel : {PRODUCT_SPECS.resistances.gelDegel}</li>
        <li>Tests validés par le CERIB selon EN 1339</li>
        <li>Coloris : {PRODUCT_SPECS.coloris.map(c => c.nom).join(", ")}</li>
      </ul>
    ),
  },
  {
    titre: "Options et accessoires",
    contenu: (
      <ul className="space-y-2 list-disc list-inside text-sm">
        <li>Béton traité antisalissure S.O.</li>
        <li>Réservations pour mobilier (tables, chaises, parasols)</li>
        <li>Réservations pour garde-corps et barrières</li>
        <li>Rampe d'accès PMR acier galvanisé</li>
        <li>Éléments sur mesure selon configuration de la voirie</li>
      </ul>
    ),
  },
];

export default async function UrbaterraPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("urbaterra");

  return (
    <div>
      {/* Hero */}
      <section className="bg-neutral-light py-16 lg:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="warning" className="mb-4">{t("badge")}</Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-dark leading-tight">
              {t("titre")}{" "}
              <span className="text-accent">En 48h.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              {t("description")}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button href="/contact" size="lg">
                {t("simuler")}
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button href="/telechargements" variant="outline" size="lg">
                <Download size={16} className="mr-2" />
                {t("ficheTechnique")}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Quick features */}
      <section className="bg-white py-10 border-b border-gray-100">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURES.map((feat) => (
              <div key={feat.label} className="text-center p-4">
                <feat.icon size={24} className="text-primary mx-auto mb-2" />
                <div className="font-mono text-sm font-bold text-primary">{feat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{feat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Cibles */}
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <SectionHeader
            titre={t("pourQui")}
            sousTitre={t("pourQuiSousTitre")}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              { titre: "Restaurateurs", desc: "Agrandissez votre terrasse de 9 à 18 m² pour accueillir jusqu'à 36 couverts supplémentaires. Praticabilité immédiate.", icon: UtensilsCrossed },
              { titre: "Mairies & collectivités", desc: "Aménagez des espaces publics temporaires ou permanents : marchés, événements, zones piétonnes accessibles.", icon: Store },
              { titre: "Gestionnaires d'espaces", desc: "Créez des plateformes modulaires réemployables pour tout usage : commerce, attente, événementiel.", icon: Ruler },
            ].map((item) => (
              <Card key={item.titre} variant="feature">
                <CardContent className="p-6">
                  <item.icon size={24} className="text-accent mb-3" />
                  <h3 className="text-lg font-bold text-neutral-dark">{item.titre}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Les 2 configurations */}
      <section className="py-16 lg:py-24 bg-neutral-light">
        <Container>
          <SectionHeader
            titre={t("configsTitre")}
            sousTitre={t("configsSousTitre")}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {CONFIGS.map((config) => (
              <Card key={config.titre} variant="product" className="overflow-hidden">
                {/* Visual placeholder */}
                <div className="h-48 bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-accent/40">{config.surface}</div>
                    <div className="text-sm text-gray-500 mt-1 font-mono">{config.modules}</div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-neutral-dark">{config.titre}</h3>
                  <div className="mt-4 space-y-3">
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Optimisé (style bistro)
                      </p>
                      <p className="text-sm text-gray-700">{config.capacite.optimise}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Confortable (espace standard)
                      </p>
                      <p className="text-sm text-gray-700">{config.capacite.confortable}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Specs */}
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <SectionHeader titre={t("specsTitre")} />
          <div className="max-w-3xl mx-auto mt-10">
            <TechnicalAccordion items={ACCORDION_ITEMS} />
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-primary">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {t("ctaTitre")}
            </h2>
            <p className="mt-4 text-primary-100 max-w-xl mx-auto">
              {t("ctaSousTitre")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="secondary" size="lg">
                {t("simuler")}
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button href="/produit" variant="ghost" size="lg" className="text-white hover:bg-white/10">
                {t("voirUrbaquai")}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
