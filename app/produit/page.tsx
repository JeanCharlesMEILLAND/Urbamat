import type { Metadata } from "next";
import { ArrowRight, Download, Ruler, Weight, Shield, Droplets, Palette, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductGallery } from "@/components/produit/ProductGallery";
import { TechnicalAccordion } from "@/components/produit/TechnicalAccordion";
import { InstallationSteps } from "@/components/produit/InstallationSteps";
// JSON-LD moved to metadata to avoid hydration issues
import { PRODUCT_SPECS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "URBAQUAI 140+50 — Quai bus modulaire béton C40/50",
  description:
    "Système URBAQUAI 140+50 : quai bus modulaire préfabriqué en béton C40/50, pose directe sur enrobé, accessibilité PMR. Modules 3000×1500 mm, tests CERIB EN 1339.",
};

const GALLERY_IMAGES = [
  { src: "/images/produit-hero.webp", alt: "Vue d'ensemble URBAQUAI 140+50" },
  { src: "/images/produit-hero.webp", alt: "Module central M 1.18 en détail" },
  { src: "/images/produit-hero.webp", alt: "Assemblage modules latéraux" },
  { src: "/images/produit-hero.webp", alt: "Finition sablé B24 et bande de guidage" },
];

const FEATURES = [
  { icon: Ruler, label: "Hauteurs", value: "18 / 21 cm" },
  { icon: Weight, label: "Béton", value: "C40/50" },
  { icon: Shield, label: "Tests", value: "CERIB EN 1339" },
  { icon: Droplets, label: "Gel/dégel", value: "< 0.3 kg/m²" },
  { icon: Palette, label: "Coloris", value: "4 naturels" },
  { icon: Truck, label: "Pose", value: "48h sur site" },
];

const ACCORDION_ITEMS = [
  {
    titre: "Gamme URBAQUAI 140+50 — Modules et dimensions",
    contenu: (
      <div className="space-y-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-500">Référence</th>
              <th className="text-left py-2 font-medium text-gray-500">Module</th>
              <th className="text-right py-2 font-medium text-gray-500">Dimensions</th>
              <th className="text-right py-2 font-medium text-gray-500">Poids</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {PRODUCT_SPECS.modules.map((m) => (
              <tr key={m.ref}>
                <td className="py-2 font-mono text-primary text-sm">{m.ref}</td>
                <td className="py-2 font-medium">{m.nom}</td>
                <td className="py-2 text-right font-mono text-sm">{m.dimensions}</td>
                <td className="py-2 text-right font-mono text-sm">{m.poids}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="bg-gray-50 rounded p-3 text-sm">
          <p><strong>Hauteurs disponibles :</strong> {PRODUCT_SPECS.hauteurs.join(" / ")}</p>
          <p className="mt-1"><strong>Hauteur h=210 :</strong> module central ~1 715 kg, latéral ~860 kg</p>
          <p className="mt-1"><strong>Longueur de quai :</strong> sur mesure par association de modules (multiples de 1.5 m)</p>
        </div>
      </div>
    ),
  },
  {
    titre: "Béton et composition",
    contenu: (
      <ul className="space-y-2 list-disc list-inside">
        <li>Composition : <strong>{PRODUCT_SPECS.beton.composition}</strong></li>
        <li>Classe de résistance : <span className="font-mono font-bold">{PRODUCT_SPECS.beton.classe}</span></li>
        <li>Classe d'exposition : <span className="font-mono">{PRODUCT_SPECS.beton.exposition}</span></li>
        <li>Ciment : <strong>{PRODUCT_SPECS.beton.ciment}</strong></li>
        <li>Taquets d'écartement montés en usine</li>
        <li>Bande de guidage tactile contrastée conforme NF P 98-352</li>
      </ul>
    ),
  },
  {
    titre: "Résistances mécaniques — Tests CERIB EN 1339",
    contenu: (
      <ul className="space-y-2 list-disc list-inside">
        <li>Gel/dégel & sels de déneigement : <span className="font-mono font-bold">{PRODUCT_SPECS.resistances.gelDegel}</span></li>
        <li>Résistance à l'abrasion : <span className="font-mono font-bold">{PRODUCT_SPECS.resistances.abrasion}</span></li>
        <li>Résistance aux chocs durs : <span className="font-mono font-bold">{PRODUCT_SPECS.resistances.chocs}</span></li>
        <li>Résistance aux taches : <span className="font-mono font-bold">{PRODUCT_SPECS.resistances.taches}</span></li>
        <li>Glissance SRT neuf/humide : <span className="font-mono font-bold">{PRODUCT_SPECS.finition.srtNeuf}</span></li>
        <li>Glissance SRT sali/usé : <span className="font-mono font-bold">{PRODUCT_SPECS.finition.srtUse}</span></li>
        <li>Tests validés par le <strong>CERIB selon EN 1339</strong></li>
      </ul>
    ),
  },
  {
    titre: "Finition et coloris",
    contenu: (
      <div className="space-y-4">
        <div>
          <p><strong>Finition de surface :</strong> {PRODUCT_SPECS.finition.type}</p>
          <p className="mt-1 text-sm text-gray-500">Score SRT moyen à l'état neuf et humide {PRODUCT_SPECS.finition.srtNeuf}</p>
        </div>
        <div>
          <p className="font-medium mb-3">4 coloris naturels :</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRODUCT_SPECS.coloris.map((c) => (
              <div key={c.nom} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border border-gray-200" style={{ backgroundColor: c.hex }} />
                <span className="text-sm">{c.nom}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    titre: "Rampes d'accès et accessibilité",
    contenu: (
      <ul className="space-y-2 list-disc list-inside">
        <li>{PRODUCT_SPECS.rampes.beton}</li>
        <li>{PRODUCT_SPECS.rampes.metal}</li>
        <li>{PRODUCT_SPECS.pose.bandeGuidage}</li>
        <li>Zone d'attente sécurisée intégrée</li>
        <li>100% accessible aux personnes à mobilité réduite</li>
      </ul>
    ),
  },
  {
    titre: "Options et accessoires",
    contenu: (
      <ul className="space-y-2 list-disc list-inside">
        <li>Béton traité antisalissure S.O.</li>
        <li>Réservations pour mobilier urbain et garde-corps</li>
        <li>Modules d'accès PMR pour gares routières</li>
        <li>Modules pour quais centraux (configuration île)</li>
        <li>Éléments sur mesure pour extension de terrasse commerciale provisoire (gamme URBATERRA)</li>
      </ul>
    ),
  },
];

export default function ProduitPage() {
  return (
    <div>
      {/* Hero produit */}
      <section className="bg-neutral-light py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="info" className="mb-4">Système breveté</Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-dark leading-tight">
                URBAQUAI<span className="text-lg font-mono text-gray-400 ml-3">140+50</span>
              </h1>
              <p className="mt-2 text-lg text-gray-500">
                Quai préfabriqué modulaire bus &amp; cars — Pose directe sur enrobé
              </p>
              <p className="mt-6 text-gray-600 leading-relaxed">
                Les modules préfabriqués URBAQUAI® permettent de construire rapidement des points d'arrêt
                bus &amp; cars accessibles à tous les voyageurs. La longueur et la hauteur des quais
                s'adaptent aux caractéristiques du matériel roulant.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Chaque module est fabriqué en usine en béton monolithique haute résistance {PRODUCT_SPECS.beton.classe},
                avec ciment NF bas carbone, garantissant une qualité constante et une durabilité supérieure.
                Praticabilité immédiate, réemployable, perturbation du trafic réduite au minimum.
              </p>

              {/* Quick specs */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                {FEATURES.map((feat) => (
                  <div key={feat.label} className="text-center p-3 bg-white rounded-lg border border-gray-100">
                    <feat.icon size={20} className="text-primary mx-auto mb-1" />
                    <div className="font-mono text-sm font-bold text-primary">{feat.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{feat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <Button href="/telechargements">
                  <Download size={16} className="mr-2" />
                  Fiche technique PDF
                </Button>
                <Button href="/contact" variant="outline">
                  Demander un devis
                </Button>
              </div>
            </div>

            <ProductGallery images={GALLERY_IMAGES} />
          </div>
        </Container>
      </section>

      {/* Specs techniques */}
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <SectionHeader
            titre="Caractéristiques techniques"
            sousTitre="Béton C40/50, tests CERIB EN 1339, ciment NF bas carbone. Chaque détail est pensé pour la durabilité et la conformité."
          />
          <div className="max-w-3xl mx-auto mt-10">
            <TechnicalAccordion items={ACCORDION_ITEMS} />
          </div>
        </Container>
      </section>

      {/* Mise en œuvre */}
      <section className="py-16 lg:py-24 bg-neutral-light">
        <Container>
          <SectionHeader
            titre="Mise en œuvre"
            sousTitre="Pose directe sur enrobé existant. Élingues, chevilles Ø12 mm, praticabilité immédiate."
          />
          <div className="max-w-2xl mx-auto mt-10">
            <InstallationSteps />
          </div>
        </Container>
      </section>

      {/* CTA vers configurations */}
      <section className="py-16 lg:py-20 bg-primary">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Quelle configuration pour votre projet ?
            </h2>
            <p className="mt-4 text-primary-100 max-w-xl mx-auto">
              Avancée de trottoir, île centrale, avec piste cyclable... Découvrez les 4 configurations URBAQUAI.
            </p>
            <div className="mt-8">
              <Button href="/configurations" variant="secondary" size="lg">
                Voir les configurations
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
