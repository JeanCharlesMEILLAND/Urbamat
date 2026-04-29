import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Download, Box, Layers, Anchor, Eye, Shield, Wrench } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TypologieDiagrams } from "@/components/produit/TypologieDiagrams";
import { ConfigurationDiagrams } from "@/components/produit/ConfigurationDiagrams";

const ExplodedQuaiViewer = dynamic(
  () => import("@/components/preview/ExplodedQuaiViewer").then((m) => m.ExplodedQuaiViewer),
  { ssr: false }
);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "produit" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const CONCEPT_POINTS = [
  {
    icon: Layers,
    title: "Logistique et réemploi simplifiés",
    body: "La conception basée sur un nombre limité de modules standardisés permet de rationaliser les opérations d'installation, de démontage, de maintenance et de stockage. Cette approche élimine le risque de perte d'éléments et garantit une réelle flexibilité pour le réemploi ou la reconfiguration en fonction des exigences de chaque site.",
  },
  {
    icon: Anchor,
    title: "4 plots intégrés, 2 bénéfices clés",
    body: "Reposant sur quatre plots intégrés et pré-percés, les modules assurent une véritable transparence hydraulique par la libre circulation des eaux pluviales sous le quai, tout en limitant au minimum les perçages dans la chaussée afin d'en préserver l'état lors de la restitution du site.",
  },
  {
    icon: Box,
    title: "Stabilité et adaptabilité au support",
    body: "URBAQUAI® s'installe directement sur les supports existants, qu'il s'agisse d'un enrobé ou d'une grave non traitée. Sur assise souple de type GNT, les plots s'intègrent dans une dalle de répartition préfabriquée, conçue pour stabiliser l'ensemble et répartir les efforts.",
  },
  {
    icon: Eye,
    title: "Lisibilité durable et contraste visuel",
    body: "Le traitement antisalissure S.O., non filmogène et intégré lors du processus de fabrication, protège durablement l'aspect d'origine du quai et contribue à la qualité visuelle de l'ouvrage dans le temps. Associé à un albédo élevé, il renforce le contraste visuel avec la chaussée, améliorant ainsi la perception du point d'arrêt provisoire et son repérage par les voyageurs.",
  },
  {
    icon: Shield,
    title: "Béton haute performance et durabilité",
    body: "Les modules URBAQUAI® sont fabriqués en béton de classe C45/55, à base de ciment de type CEM II et avec une classe d'exposition XF4, particulièrement adaptée aux conditions environnementales exigeantes. Cette composition assure une protection efficace contre le gel, le dégel et l'action des sels de déneigement, tout en contribuant à limiter les émissions de gaz à effet de serre.",
  },
  {
    icon: Wrench,
    title: "Sécurisation et signalisation",
    body: "Le système peut intégrer les réservations nécessaires à la fixation des équipements de sécurité et de signalisation du site, tels que garde-corps, balises ou poteaux. Des éléments sur mesure peuvent également être prévus afin de répondre aux contraintes spécifiques de chaque implantation.",
  },
];

export default async function ProduitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      {/* ─── 1. Introduction ──────────────────────────── */}
      <section className="bg-gradient-to-b from-accent-50 to-surface py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="info" className="mb-4">
                Innovation protégée par dépôt de brevet
              </Badge>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-urbaquai.png"
                alt="URBAQUAI®"
                className="h-12 lg:h-14 w-auto mb-3"
              />
              <p className="text-base lg:text-lg text-accent font-semibold">
                Quai bus provisoire — Solution durable et accessible
              </p>
              <p className="mt-6 text-gray-600 leading-relaxed">
                <strong className="text-neutral-dark">URBAQUAI®</strong> est une solution
                innovante pour la création de quais bus provisoires. Composé de modules en
                béton préfabriqué bas carbone haute performance, ce système constructif
                s'adapte à la diversité des configurations urbaines ainsi qu'aux spécificités
                du matériel roulant.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Afin d'assurer un accès de plain-pied, la hauteur des modules est calibrée
                en fonction du niveau du plancher du bus. La gamme standardisée est conçue
                pour s'adapter à la longueur des véhicules comme à l'espace disponible.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Posés directement sur la chaussée existante, les modules limitent les
                travaux préparatoires, réduisent les perturbations et accélèrent la mise
                en service du point d'arrêt.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/configurateur">
                  Configurer un quai
                  <ArrowRight size={18} className="ml-2" />
                </Button>
                <Button href="/telechargements" variant="outline">
                  <Download size={16} className="mr-2" />
                  Documentation
                </Button>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-lg ring-1 ring-black/5">
              <ExplodedQuaiViewer
                className="absolute inset-0 w-full h-full"
                mirrorX
                cameraSide="chaussee"
              />
              <span className="absolute bottom-3 right-4 text-[10px] uppercase tracking-wider text-neutral-dark/50 pointer-events-none font-mono">
                vue éclatée — D-004 · D-002 · D-003
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 2. Le concept URBAQUAI® (6 points) ──────── */}
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-accent font-bold mb-3">
              Concept
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark">
              Le concept URBAQUAI®
            </h2>
            <p className="mt-4 text-base text-gray-600 leading-relaxed">
              Six principes constructifs au cœur du système, pour répondre aux exigences
              fondamentales d'un point d'arrêt bus provisoire : accessibilité PMR,
              transparence hydraulique, visibilité, sécurité et robustesse.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONCEPT_POINTS.map((point, i) => (
              <div
                key={point.title}
                className="bg-surface rounded-2xl p-6 lg:p-7 border border-surface-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent text-white">
                    <point.icon size={20} />
                  </div>
                  <span className="text-xs font-mono text-gray-400">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-neutral-dark leading-tight">
                  {point.title}
                </h3>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  {point.body}
                </p>
              </div>
            ))}
          </div>
          {/* Bandeau coloris — 4 swatches individuels */}
          <div className="mt-12 max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-6 text-center">
              4 coloris béton naturels
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
              {[
                { id: "quartz-blanc",   nom: "Quartz Blanc",   src: "/images/urbamat/coloris-quartz-blanc.png" },
                { id: "granit-gris",    nom: "Granit Gris",    src: "/images/urbamat/coloris-granit-gris.png" },
                { id: "basalte-noir",   nom: "Basalte Noir",   src: "/images/urbamat/coloris-basalte-noir.png" },
                { id: "calcaire-jaune", nom: "Calcaire Jaune", src: "/images/urbamat/coloris-calcaire-jaune.png" },
              ].map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-lg ring-1 ring-black/5 shadow-sm overflow-hidden"
                >
                  <div className="h-16 overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.src}
                      alt={c.nom}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-2 py-2 text-center">
                    <p className="text-xs font-bold text-neutral-dark leading-tight">{c.nom}</p>
                    <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                      {c.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 3. Comparaison des performances ─────────── */}
      <section className="py-16 lg:py-24 bg-neutral-light">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-accent font-bold mb-3">
              Performance
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark">
              Comparaison des niveaux de performance
            </h2>
            <p className="mt-4 text-base text-gray-600">
              URBAQUAI® face aux solutions concurrentes : grands modules béton, quais
              plastique, quais béton coulés en place.
            </p>
          </div>
          <div className="mt-12 max-w-5xl mx-auto bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/urbamat/comparaison-performances.png"
              alt="Tableau comparatif URBAQUAI vs Quais en plastique vs Quais en béton classique"
              className="w-full h-auto"
            />
          </div>
        </Container>
      </section>

      {/* ─── 4. Accessibilité, sécurité d'usage et cadre réglementaire ─── */}
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-accent font-bold mb-3">
              Accessibilité &amp; cadre réglementaire
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark">
              Une solution accessible, lisible et sûre
            </h2>
            <p className="mt-4 text-base text-gray-600">
              Conforme aux normes en vigueur pour l'accessibilité PMR, la lisibilité
              tactile et visuelle, ainsi que la sécurité antidérapante.
            </p>
            {/* Pictogrammes accessibilité */}
            <div className="mt-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/urbamat/picto-accessibilite.png"
                alt="Personnes à mobilité réduite, malvoyants, fauteuil roulant, déambulateur"
                className="max-w-md w-full mx-auto opacity-80"
              />
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Sub 1 — Accessible */}
            <div className="bg-surface rounded-2xl p-6 lg:p-7 border border-surface-200">
              <Badge variant="info" className="mb-3">Une solution accessible</Badge>
              <h3 className="text-lg font-bold text-neutral-dark leading-tight">
                Un accès en pente douce pour les utilisateurs de fauteuil roulant
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>
                    Une <strong className="text-neutral-dark">rampe en acier galvanisé</strong> assure
                    l'interface entre les modules URBAQUAI® et le trottoir, ou entre les modules et la
                    chaussée pour les quais isolés ou intégrant une piste cyclable.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>La surface structurée antidérapante favorise la sécurité d'usage.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Une visserie inviolable peut être prévue en option.</span>
                </li>
              </ul>
              {/* Plan technique rampe */}
              <div className="mt-5 bg-white rounded-xl p-3 ring-1 ring-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/urbamat/rampe-acier-plan.png"
                  alt="Plan technique rampe acier 510mm + 1500mm"
                  className="w-full h-auto"
                />
                <p className="mt-2 text-[10px] text-center text-gray-400 font-mono">
                  Rampe acier 2010 mm — vues plan + profil
                </p>
              </div>
            </div>

            {/* Sub 2 — Lisible */}
            <div className="bg-surface rounded-2xl p-6 lg:p-7 border border-surface-200">
              <Badge variant="info" className="mb-3">Une solution lisible</Badge>
              <h3 className="text-lg font-bold text-neutral-dark leading-tight">
                Une bande de guidage contrastée pour les personnes aveugles ou malvoyantes
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>
                    L'ergonomie tactile respecte la <strong className="text-neutral-dark">norme NF P 98-352</strong>.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>
                    Le contraste visuel présente une valeur minimale de{" "}
                    <strong className="text-neutral-dark">70 %</strong>, conforme à la{" "}
                    <strong className="text-neutral-dark">norme NF P 98-351</strong>.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>
                    Cette conception offre au chauffeur un repère visuel précis pour positionner
                    correctement la porte avant au niveau du quai et optimiser les échanges en station.
                  </span>
                </li>
              </ul>
              <div className="mt-5 bg-white rounded-xl p-3 ring-1 ring-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/urbamat/bandes-eveil-sketchup.jpeg"
                  alt="Bande de guidage avec dimensions 300/500/600/700/1000 mm"
                  className="w-full h-auto rounded-md"
                />
                <p className="mt-2 text-[10px] text-center text-gray-400 font-mono">
                  Implantation bande de guidage — repérage porte avant
                </p>
              </div>
            </div>

            {/* Sub 3 — Sécurité d'usage */}
            <div className="bg-surface rounded-2xl p-6 lg:p-7 border border-surface-200">
              <Badge variant="info" className="mb-3">Sécurité d'usage élevée</Badge>
              <h3 className="text-lg font-bold text-neutral-dark leading-tight">
                Une finition de surface antidérapante type B24
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>
                    La finition <strong className="text-neutral-dark">B24</strong> offre un niveau
                    de résistance à la glissance élevé.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>
                    La valeur <strong className="text-neutral-dark">SRT &gt; 78</strong> est validée
                    par le <strong className="text-neutral-dark">CERIB</strong>.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>
                    Cette valeur répond aux exigences de la{" "}
                    <strong className="text-neutral-dark">norme NF P 98-351</strong>, assurant
                    durablement la sécurité des déplacements piétonniers et l'accès au bus.
                  </span>
                </li>
              </ul>
              <div className="mt-5 flex items-center justify-center bg-gradient-to-br from-accent-50 to-white rounded-xl p-6 ring-1 ring-black/5">
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent leading-none">SRT &gt; 78</div>
                  <div className="mt-2 text-xs uppercase tracking-wider text-gray-500 font-mono">
                    Validé CERIB · NF P 98-351
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 5. Configurations et typologies ─────────── */}
      <section className="py-16 lg:py-24 bg-neutral-light">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-accent font-bold mb-3">
              Configurations
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark">
              4 configurations, toutes les situations
            </h2>
            <p className="mt-4 text-base text-gray-600">
              Chaque arrêt de bus est unique. URBAQUAI® s'adapte avec 4 configurations
              modulaires pour répondre à tous les cas de figure.
            </p>
          </div>

          <div className="mt-12 max-w-5xl mx-auto">
            <ConfigurationDiagrams />
          </div>

          <div className="mt-16 text-center max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-neutral-dark">
              Typologies des points d'arrêt et des stationnements
            </h3>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              L'étendue de la gamme URBAQUAI® offre une multitude de possibilités avec
              plusieurs largeurs et longueurs de modules standardisés. La largeur des
              modules est adaptée pour s'intégrer dans l'alignement de tous les types
              de stationnement public configurés selon la norme{" "}
              <strong className="text-neutral-dark">NF P 91-100</strong>.
            </p>
          </div>

          <div className="mt-10 max-w-6xl mx-auto">
            <TypologieDiagrams />
            <p className="mt-4 text-[11px] text-center text-gray-500 font-mono">
              Conforme à la norme NF P 91-100 — Conception et dimensionnement des parcs
              de stationnement accessibles au public
            </p>
          </div>

          <div className="mt-14 text-center">
            <Button href="/configurateur" size="lg">
              Configurer mon quai en 3D
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </Container>
      </section>

      {/* CTA contact */}
      <section className="py-16 lg:py-20 bg-accent">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Un projet d'accessibilité bus ?
            </h2>
            <p className="mt-4 text-accent-50">
              Décrivez-nous votre besoin. Notre équipe vous répond sous 24h avec une
              proposition technique et un chiffrage adaptés.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href="/contact" variant="secondary" size="lg">
                Nous contacter
              </Button>
              <Button href="/configurateur" variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
                Outil de configuration 3D
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
