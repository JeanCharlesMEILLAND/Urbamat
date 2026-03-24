import type { Metadata } from "next";
import { Scale, BookOpen, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Réglementation — Normes accessibilité arrêts de bus",
  description:
    "Cadre réglementaire de l'accessibilité des arrêts de bus en France : loi du 11 février 2005, guide CEREMA 2018, normes NF. URBAQUAI conforme à toutes les exigences.",
};

const TEXTES = [
  {
    icon: Scale,
    titre: "Loi du 11 février 2005",
    sousTitre: "Égalité des droits et des chances",
    contenu: [
      "La loi n° 2005-102 du 11 février 2005 pose le principe de l'accessibilité généralisée de la chaîne du déplacement.",
      "Elle impose que tous les points d'arrêt de transport collectif soient rendus accessibles aux personnes à mobilité réduite.",
      "Les Schémas Directeurs d'Accessibilité – Agendas d'Accessibilité Programmée (SDA-Ad'AP) fixent les échéances de mise en conformité pour chaque autorité organisatrice.",
    ],
    conformite: [
      "Hauteur de quai normalisée (18-21 cm) pour accès de plain-pied",
      "Bandes d'éveil de vigilance (BEV) conformes",
      "Pentes d'accès inférieures à 5%",
      "Surfaces antidérapantes et contrastées",
    ],
  },
  {
    icon: BookOpen,
    titre: "Guide CEREMA 2018",
    sousTitre: "Aménagement des arrêts de bus accessibles",
    contenu: [
      "Le guide du CEREMA « Arrêts de bus et de car accessibles à tous » (2018) constitue la référence technique pour les maîtres d'ouvrage et maîtres d'œuvre.",
      "Il détaille les prescriptions géométriques, les dispositifs d'aide à l'accostage, et les aménagements complémentaires pour chaque type de configuration.",
      "URBAQUAI a été conçu en stricte conformité avec l'ensemble des recommandations de ce guide.",
    ],
    conformite: [
      "Géométrie de quai conforme aux gabarits CEREMA",
      "Zone d'embarquement de 2m × 1,40m respectée",
      "Dispositifs d'aide à l'accostage intégrables",
      "Continuité du cheminement accessible garantie",
    ],
  },
  {
    icon: ShieldCheck,
    titre: "Normes NF P 98-352",
    sousTitre: "Bordures et éléments de quai",
    contenu: [
      "La norme NF P 98-352 définit les exigences de résistance mécanique, de durabilité et de dimensionnement des bordures préfabriquées en béton.",
      "Elle spécifie les essais de résistance à la flexion, à l'abrasion, au gel/dégel et aux agressions chimiques (sels de déverglaçage).",
      "Le béton haute performance URBAQUAI dépasse les seuils minimaux de la norme sur chaque critère.",
    ],
    conformite: [
      "Résistance flexion ≥ 5 MPa (seuil NF : 3,5 MPa)",
      "Certification gel/dégel F2 (environnement sévère)",
      "Résistance abrasion Classe 4 (trafic intense)",
      "Résistance charge roulante Classe T (60t)",
    ],
  },
];

const RESSOURCES = [
  {
    titre: "SDA-Ad'AP : obligations et calendrier",
    description: "Comprendre les Schémas Directeurs d'Accessibilité et les Agendas d'Accessibilité Programmée.",
  },
  {
    titre: "Subventions et financements",
    description: "Les aides financières disponibles pour la mise en accessibilité des arrêts de transport (DSIL, DETR, fonds verts).",
  },
  {
    titre: "Visa SNCF Réseau",
    description: "URBAQUAI dispose du visa SNCF Réseau, permettant l'installation à proximité des voies ferroviaires.",
  },
];

export default function ReglementationPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-neutral-light py-16 lg:py-24">
        <Container>
          <SectionHeader
            titre="Cadre réglementaire"
            sousTitre="L'accessibilité des arrêts de bus est encadrée par un ensemble de textes législatifs et normatifs. URBAQUAI est conforme à chacun d'entre eux."
          />
        </Container>
      </section>

      {/* Textes réglementaires */}
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="space-y-16">
            {TEXTES.map((texte, index) => (
              <div key={texte.titre} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Contenu */}
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <texte.icon size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-neutral-dark">{texte.titre}</h2>
                      <p className="text-sm text-gray-500">{texte.sousTitre}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {texte.contenu.map((para, i) => (
                      <p key={i} className="text-gray-600 leading-relaxed text-sm">{para}</p>
                    ))}
                  </div>
                </div>

                {/* Conformité URBAQUAI */}
                <div className="lg:col-span-2">
                  <div className="bg-success/5 border border-success/20 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-success uppercase tracking-wider mb-3">
                      Conformité URBAQUAI
                    </h3>
                    <ul className="space-y-2">
                      {texte.conformite.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                          <ShieldCheck size={14} className="text-success shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Ressources complémentaires */}
      <section className="py-16 lg:py-24 bg-neutral-light">
        <Container>
          <SectionHeader titre="Ressources complémentaires" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {RESSOURCES.map((res) => (
              <Card key={res.titre} variant="feature">
                <CardContent className="p-6">
                  <FileText size={20} className="text-primary mb-3" />
                  <h3 className="font-bold text-neutral-dark">{res.titre}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{res.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Un doute sur la conformité ?
            </h2>
            <p className="mt-4 text-primary-100 max-w-xl mx-auto">
              Notre équipe technique vous accompagne pour vérifier la conformité de votre projet aux normes en vigueur.
            </p>
            <Button href="/contact" variant="secondary" size="lg" className="mt-8">
              Nous consulter
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
