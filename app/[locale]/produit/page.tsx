import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import * as Icons from "lucide-react";
import { ArrowRight, Download, Layers, Anchor, Boxes, Eye, Shield, Wrench } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TypologieDiagrams } from "@/components/produit/TypologieDiagrams";
import { ConfigurationDiagrams } from "@/components/produit/ConfigurationDiagrams";
import { getCmsOverrides } from "@/lib/cms";

const ExplodedQuaiViewer = dynamic(
  () => import("@/components/preview/ExplodedQuaiViewer").then((m) => m.ExplodedQuaiViewer),
  { ssr: false }
);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "produit" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const DEFAULT_CONCEPT_ICONS = ["Layers", "Anchor", "Boxes", "Eye", "Shield", "Wrench"] as const;

const DEFAULT_CONCEPT_TITLES = [
  "Logistique et réemploi simplifiés",
  "4 plots intégrés, 2 bénéfices clés",
  "Stabilité et adaptabilité au support",
  "Lisibilité durable et contraste visuel",
  "Béton haute performance et durabilité",
  "Sécurisation et signalisation",
] as const;

const DEFAULT_CONCEPT_BODIES = [
  "La conception basée sur un nombre limité de modules standardisés permet de rationaliser les opérations d'installation, de démontage, de maintenance et de stockage. Cette approche élimine le risque de perte d'éléments et garantit une réelle flexibilité pour le réemploi ou la reconfiguration en fonction des exigences de chaque site.",
  "Reposant sur quatre plots intégrés et pré-percés, les modules assurent une véritable transparence hydraulique par la libre circulation des eaux pluviales sous le quai, tout en limitant au minimum les perçages dans la chaussée afin d'en préserver l'état lors de la restitution du site.",
  "URBAQUAI® s'installe directement sur les supports existants, qu'il s'agisse d'un enrobé ou d'une grave non traitée. Sur assise souple de type GNT, les plots s'intègrent dans une dalle de répartition préfabriquée, conçue pour stabiliser l'ensemble et répartir les efforts.",
  "Le traitement antisalissure S.O., non filmogène et intégré lors du processus de fabrication, protège durablement l'aspect d'origine du quai et contribue à la qualité visuelle de l'ouvrage dans le temps. Associé à un albédo élevé, il renforce le contraste visuel avec la chaussée, améliorant ainsi la perception du point d'arrêt provisoire et son repérage par les voyageurs.",
  "Les modules URBAQUAI® sont fabriqués en béton de classe C45/55, à base de ciment de type CEM II et avec une classe d'exposition XF4, particulièrement adaptée aux conditions environnementales exigeantes. Cette composition assure une protection efficace contre le gel, le dégel et l'action des sels de déneigement, tout en contribuant à limiter les émissions de gaz à effet de serre.",
  "Le système peut intégrer les réservations nécessaires à la fixation des équipements de sécurité et de signalisation du site, tels que garde-corps, balises ou poteaux. Des éléments sur mesure peuvent également être prévus afin de répondre aux contraintes spécifiques de chaque implantation.",
] as const;

const DEFAULT_COLORIS = [
  { id: "quartz-blanc",   nom: "Quartz Blanc",   src: "/images/urbamat/coloris-quartz-blanc.png" },
  { id: "granit-gris",    nom: "Granit Gris",    src: "/images/urbamat/coloris-granit-gris.png" },
  { id: "basalte-noir",   nom: "Basalte Noir",   src: "/images/urbamat/coloris-basalte-noir.png" },
  { id: "calcaire-jaune", nom: "Calcaire Jaune", src: "/images/urbamat/coloris-calcaire-jaune.png" },
];

function lucideByName(name: string): React.ComponentType<{ size?: number; className?: string }> {
  const lib = Icons as unknown as Record<
    string,
    React.ComponentType<{ size?: number; className?: string }>
  >;
  return lib[name] || lib.Layers;
}

export default async function ProduitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cms = await getCmsOverrides("produit", locale);

  // Construit les 6 cartes Concept en mergeant les valeurs CMS avec les défauts
  const conceptCards = [1, 2, 3, 4, 5, 6].map((n) => ({
    titre: cms[`produit_concept_card${n}_titre`] || DEFAULT_CONCEPT_TITLES[n - 1],
    texte: cms[`produit_concept_card${n}_texte`] || DEFAULT_CONCEPT_BODIES[n - 1],
    icon: cms[`produit_concept_card${n}_icon`] || DEFAULT_CONCEPT_ICONS[n - 1],
  }));

  const coloris = [1, 2, 3, 4].map((n, i) => ({
    nom: cms[`produit_coloris_c${n}_nom`] || DEFAULT_COLORIS[i].nom,
    src: cms[`produit_coloris_c${n}_image`] || DEFAULT_COLORIS[i].src,
    id: DEFAULT_COLORIS[i].id,
  }));

  return (
    <div>
      {/* ─── 1. Introduction ──────────────────────────── */}
      <section className="bg-gradient-to-b from-accent-50 to-surface py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="info" className="mb-4">
                {cms.produit_intro_badge || "Innovation protégée par dépôt de brevet"}
              </Badge>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cms.produit_intro_logo || "/images/logo-urbaquai.png"}
                alt="URBAQUAI®"
                className="h-12 lg:h-14 w-auto mb-3"
              />
              <p className="text-base lg:text-lg text-accent font-semibold">
                {cms.produit_intro_sous_titre || "Quai bus provisoire — Solution durable et accessible"}
              </p>
              <div
                className="mt-6 text-gray-600 leading-relaxed [&_p]:mt-4 [&_p:first-child]:mt-0 [&_strong]:text-neutral-dark"
                dangerouslySetInnerHTML={{
                  __html:
                    cms.produit_intro_description ||
                    `<p><strong>URBAQUAI®</strong> est une solution innovante pour la création de quais bus provisoires. Composé de modules en béton préfabriqué bas carbone haute performance, ce système constructif s'adapte à la diversité des configurations urbaines ainsi qu'aux spécificités du matériel roulant.</p><p>Afin d'assurer un accès de plain-pied, la hauteur des modules est calibrée en fonction du niveau du plancher du bus. La gamme standardisée est conçue pour s'adapter à la longueur des véhicules comme à l'espace disponible.</p><p>Posés directement sur la chaussée existante, les modules limitent les travaux préparatoires, réduisent les perturbations et accélèrent la mise en service du point d'arrêt.</p>`,
                }}
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={cms.produit_intro_cta_primaire_url || "/configurateur"}>
                  {cms.produit_intro_cta_primaire || "Configurer un quai"}
                  <ArrowRight size={18} className="ml-2" />
                </Button>
                <Button href={cms.produit_intro_cta_secondaire_url || "/telechargements"} variant="outline">
                  <Download size={16} className="mr-2" />
                  {cms.produit_intro_cta_secondaire || "Documentation"}
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
                {cms.produit_intro_caption || "vue éclatée — D-004 · D-002 · D-003"}
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 2. Le concept URBAQUAI® (6 points) ──────── */}
      <section id="concept" className="py-16 lg:py-24 bg-white scroll-mt-24">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-accent font-bold mb-3">
              {cms.produit_concept_eyebrow || "Concept"}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark">
              {cms.produit_concept_titre || "Le concept URBAQUAI®"}
            </h2>
            <p className="mt-4 text-base text-gray-600 leading-relaxed">
              {cms.produit_concept_intro ||
                "Six principes constructifs au cœur du système, pour répondre aux exigences fondamentales d'un point d'arrêt bus provisoire : accessibilité PMR, transparence hydraulique, visibilité, sécurité et robustesse."}
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conceptCards.map((point, i) => {
              const Icon = lucideByName(point.icon);
              return (
                <div
                  key={i}
                  className="bg-surface rounded-2xl p-6 lg:p-7 border border-surface-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent text-white">
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-mono text-gray-400">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-dark leading-tight">
                    {point.titre}
                  </h3>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    {point.texte}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bandeau coloris — 4 swatches individuels */}
          <div id="coloris" className="mt-12 max-w-3xl mx-auto scroll-mt-24">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-6 text-center">
              {cms.produit_coloris_titre || "4 coloris béton naturels"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
              {coloris.map((c) => (
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
      <section id="performance" className="py-16 lg:py-24 bg-neutral-light scroll-mt-24">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-accent font-bold mb-3">
              {cms.produit_performance_eyebrow || "Performance"}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark">
              {cms.produit_performance_titre || "Comparaison des niveaux de performance"}
            </h2>
            <p className="mt-4 text-base text-gray-600">
              {cms.produit_performance_sous_titre ||
                "URBAQUAI® face aux solutions concurrentes : grands modules béton, quais plastique, quais béton coulés en place."}
            </p>
          </div>
          <div className="mt-12 max-w-5xl mx-auto bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cms.produit_performance_image || "/images/urbamat/comparaison-performances.png"}
              alt="Tableau comparatif URBAQUAI vs Quais en plastique vs Quais en béton classique"
              className="w-full h-auto"
            />
          </div>
        </Container>
      </section>

      {/* ─── 4. Accessibilité, sécurité d'usage et cadre réglementaire ─── */}
      <section id="accessibilite" className="py-16 lg:py-24 bg-white scroll-mt-24">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-accent font-bold mb-3">
              {cms.produit_accessibilite_eyebrow || "Accessibilité & cadre réglementaire"}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark">
              {cms.produit_accessibilite_titre || "Une solution accessible, lisible et sûre"}
            </h2>
            <p className="mt-4 text-base text-gray-600">
              {cms.produit_accessibilite_sous_titre ||
                "Conforme aux normes en vigueur pour l'accessibilité PMR, la lisibilité tactile et visuelle, ainsi que la sécurité antidérapante."}
            </p>
            <div className="mt-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cms.produit_accessibilite_picto || "/images/urbamat/picto-accessibilite.png"}
                alt="Personnes à mobilité réduite, malvoyants, fauteuil roulant, déambulateur"
                className="max-w-md w-full mx-auto opacity-80"
              />
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((n) => {
              const isCard3 = n === 3;
              const valeurCle = cms.produit_accessibilite_card3_image; // fallback chiffre clé
              return (
                <div key={n} className="bg-surface rounded-2xl p-6 lg:p-7 border border-surface-200">
                  <Badge variant="info" className="mb-3">
                    {cms[`produit_accessibilite_card${n}_badge`] ||
                      ["Une solution accessible", "Une solution lisible", "Sécurité d'usage élevée"][n - 1]}
                  </Badge>
                  <h3 className="text-lg font-bold text-neutral-dark leading-tight">
                    {cms[`produit_accessibilite_card${n}_titre`] ||
                      [
                        "Un accès en pente douce pour les utilisateurs de fauteuil roulant",
                        "Une bande de guidage contrastée pour les personnes aveugles ou malvoyantes",
                        "Une finition de surface antidérapante type B24",
                      ][n - 1]}
                  </h3>
                  <div
                    className="mt-4 text-sm text-gray-600 leading-relaxed [&_ul]:space-y-2 [&_li]:flex [&_li]:gap-2 [&_li]:before:content-['•'] [&_li]:before:text-accent [&_li]:before:font-bold [&_strong]:text-neutral-dark"
                    dangerouslySetInnerHTML={{
                      __html:
                        cms[`produit_accessibilite_card${n}_contenu`] ||
                        [
                          `<ul><li><span>Une <strong>rampe en acier galvanisé</strong> assure l'interface entre les modules URBAQUAI® et le trottoir, ou entre les modules et la chaussée pour les quais isolés ou intégrant une piste cyclable.</span></li><li><span>La surface structurée antidérapante favorise la sécurité d'usage.</span></li><li><span>Une visserie inviolable peut être prévue en option.</span></li></ul>`,
                          `<ul><li><span>L'ergonomie tactile respecte la <strong>norme NF P 98-352</strong>.</span></li><li><span>Le contraste visuel présente une valeur minimale de <strong>70 %</strong>, conforme à la <strong>norme NF P 98-351</strong>.</span></li><li><span>Cette conception offre au chauffeur un repère visuel précis pour positionner correctement la porte avant au niveau du quai.</span></li></ul>`,
                          `<ul><li><span>La finition <strong>B24</strong> offre un niveau de résistance à la glissance élevé.</span></li><li><span>La valeur <strong>SRT > 78</strong> est validée par le <strong>CERIB</strong>.</span></li><li><span>Cette valeur répond aux exigences de la <strong>norme NF P 98-351</strong>, assurant durablement la sécurité des déplacements piétonniers et l'accès au bus.</span></li></ul>`,
                        ][n - 1],
                    }}
                  />
                  {/* Carte 3 affiche un gros chiffre clé, les autres une image */}
                  {isCard3 ? (
                    <div className="mt-5 flex items-center justify-center bg-gradient-to-br from-accent-50 to-white rounded-xl p-6 ring-1 ring-black/5">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-accent leading-none">
                          {valeurCle || "SRT > 78"}
                        </div>
                        <div className="mt-2 text-xs uppercase tracking-wider text-gray-500 font-mono">
                          {cms.produit_accessibilite_card3_legende || "Validé CERIB · NF P 98-351"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 bg-white rounded-xl p-3 ring-1 ring-black/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          cms[`produit_accessibilite_card${n}_image`] ||
                          (n === 1
                            ? "/images/urbamat/rampe-acier-plan.png"
                            : "/images/urbamat/bandes-eveil-sketchup.jpeg")
                        }
                        alt=""
                        className="w-full h-auto rounded-md"
                      />
                      <p className="mt-2 text-[10px] text-center text-gray-400 font-mono">
                        {cms[`produit_accessibilite_card${n}_legende`] ||
                          (n === 1
                            ? "Rampe acier 2010 mm — vues plan + profil"
                            : "Implantation bande de guidage — repérage porte avant")}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ─── 5. Configurations et typologies ─────────── */}
      <section id="configurations" className="py-16 lg:py-24 bg-neutral-light scroll-mt-24">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-accent font-bold mb-3">
              {cms.produit_configurations_eyebrow || "Configurations"}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark">
              {cms.produit_configurations_titre || "4 configurations, toutes les situations"}
            </h2>
            <p className="mt-4 text-base text-gray-600">
              {cms.produit_configurations_sous_titre ||
                "Chaque arrêt de bus est unique. URBAQUAI® s'adapte avec 4 configurations modulaires pour répondre à tous les cas de figure."}
            </p>
          </div>

          <div className="mt-12 max-w-5xl mx-auto">
            <ConfigurationDiagrams />
          </div>

          <div className="mt-16 text-center max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-neutral-dark">
              {cms.produit_typologies_titre || "Typologies des points d'arrêt et des stationnements"}
            </h3>
            <div
              className="mt-4 text-sm text-gray-600 leading-relaxed [&_strong]:text-neutral-dark"
              dangerouslySetInnerHTML={{
                __html:
                  cms.produit_typologies_sous_titre ||
                  `L'étendue de la gamme URBAQUAI® offre une multitude de possibilités avec plusieurs largeurs et longueurs de modules standardisés. La largeur des modules est adaptée pour s'intégrer dans l'alignement de tous les types de stationnement public configurés selon la norme <strong>NF P 91-100</strong>.`,
              }}
            />
          </div>

          <div className="mt-10 max-w-6xl mx-auto">
            <TypologieDiagrams />
            <p className="mt-4 text-[11px] text-center text-gray-500 font-mono">
              {cms.produit_typologies_legende ||
                "Conforme à la norme NF P 91-100 — Conception et dimensionnement des parcs de stationnement accessibles au public"}
            </p>
          </div>

          <div className="mt-14 text-center">
            <Button href={cms.produit_configurer_cta_url || "/configurateur"} size="lg">
              {cms.produit_configurer_cta_label || "Configurer mon quai en 3D"}
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </Container>
      </section>

      {/* CTA contact */}
      <section id="cta" className="py-16 lg:py-20 bg-accent scroll-mt-24">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {cms.produit_cta_titre || "Un projet d'accessibilité bus ?"}
            </h2>
            <p className="mt-4 text-accent-50">
              {cms.produit_cta_texte ||
                "Décrivez-nous votre besoin. Notre équipe vous répond sous 24h avec une proposition technique et un chiffrage adaptés."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href={cms.produit_cta_primaire_url || "/contact"} variant="secondary" size="lg">
                {cms.produit_cta_primaire || "Nous contacter"}
              </Button>
              <Button
                href={cms.produit_cta_secondaire_url || "/configurateur"}
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white/10"
              >
                {cms.produit_cta_secondaire || "Outil de configuration 3D"}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
