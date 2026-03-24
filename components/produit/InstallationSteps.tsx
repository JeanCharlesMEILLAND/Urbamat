import { cn } from "@/lib/utils";

const STEPS = [
  {
    numero: "01",
    titre: "Préparation du support",
    description:
      "Nettoyage de la surface existante (enrobé, béton ou asphalte). Aucun terrassement, aucun décroûtage. Le support doit simplement être plan et stable. Repérage des emplacements de chevilles.",
  },
  {
    numero: "02",
    titre: "Livraison et manutention",
    description:
      "Les modules URBAQUAI arrivent sur site prêts à poser. Mise en place par élingues (capacité 1 800 kg). Module central M 1.18 : ~1 400 kg, modules latéraux : ~700 kg.",
  },
  {
    numero: "03",
    titre: "Positionnement et fixation",
    description:
      "Alignement des modules grâce aux taquets d'écartement montés en usine. Fixation par chevilles Ø12 mm à 15 cm de profondeur dans le support existant. Assemblage des modules entre eux.",
  },
  {
    numero: "04",
    titre: "Rampes et finitions",
    description:
      "Pose des rampes d'accès PMR (béton D-009a ou acier galvanisé avec réglage automatique en hauteur et visserie anti-effraction). Vérification de la bande de guidage tactile. Le quai est immédiatement praticable.",
  },
];

export function InstallationSteps() {
  return (
    <div className="space-y-0">
      {STEPS.map((step, index) => (
        <div
          key={step.numero}
          className={cn(
            "flex gap-6 py-8",
            index < STEPS.length - 1 && "border-b border-gray-100"
          )}
        >
          {/* Numéro */}
          <div className="shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-mono text-lg font-bold text-primary">{step.numero}</span>
            </div>
          </div>

          {/* Contenu */}
          <div>
            <h3 className="text-lg font-bold text-neutral-dark">{step.titre}</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
