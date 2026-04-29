import dynamic from "next/dynamic";
import { setRequestLocale } from "next-intl/server";

const ModuleCard = dynamic(
  () => import("@/components/preview/ModuleCard").then((m) => m.ModuleCard),
  { ssr: false }
);

// Ordre du PDF technique URBAQUAI
const MODULES = [
  { ref: "D-002", label: "D-002 — Central (3000×1500×180)" },
  { ref: "D-003", label: "D-003 — Fin de quai droit (1500×1500×180)" },
  { ref: "D-003a", label: "D-003a — Latéral simple (1500×1500×180)" },
  { ref: "D-004", label: "D-004 — Fin de quai gauche (1500×1500×180)" },
  { ref: "D-004a", label: "D-004a — Latéral simple + 4 rubans (1500×1500×180)" },
  { ref: "D-005", label: "D-005 — Central nu (3000×1500×180)" },
  { ref: "D-006", label: "D-006 — Fin de quai angle (1500×1500×180)" },
  { ref: "D-007", label: "D-007 — Jonction côté 1m (1500×1000×180)" },
  { ref: "D-007a", label: "D-007a — Jonction nue (1500×1000×180)" },
  { ref: "D-008", label: "D-008 — Jonction côté 1.5m gauche (1500×1000×180)" },
  { ref: "D-008a", label: "D-008a — Jonction côté 1.5m droite (1500×1000×180)" },
  { ref: "D-009a", label: "D-009a — Module de transition (1500×1500×180)" },
  { ref: "D-009", label: "D-009 — Rampe latérale + plaque (1500×1500×180)" },
  { ref: "D-009s", label: "D-009 suite — Rampe latérale sans plaque (1500×1500×180)" },
];

type Props = { params: Promise<{ locale: string }> };

export default async function TestModulesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-neutral-dark mb-1">
          Tous les modules catalogue
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Rendu procédural avec dimensions du <code>MODULE_CATALOG</code>.
          Clic-glisser pour faire tourner, molette pour zoomer.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m) => (
            <ModuleCard key={m.ref} moduleRef={m.ref} label={m.label} />
          ))}
        </div>
      </div>
    </div>
  );
}
