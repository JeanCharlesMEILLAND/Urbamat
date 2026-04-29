import dynamic from "next/dynamic";
import { setRequestLocale } from "next-intl/server";

const ProductViewer = dynamic(
  () => import("@/components/preview/ProductViewer").then((m) => m.ProductViewer),
  { ssr: false }
);

const MODULES = [
  { id: "D-001", label: "D-001 — Module" },
  { id: "D-002", label: "D-002 — Module" },
  { id: "D-003", label: "D-003 — Central standard" },
  { id: "D-003a", label: "D-003a — Central variante" },
  { id: "D-004", label: "D-004 — Latéral" },
  { id: "D-004a", label: "D-004a — Latéral variante" },
  { id: "D-005", label: "D-005 — Central standard" },
  { id: "D-006", label: "D-006 — Central variante" },
  { id: "D-007", label: "D-007 — Module" },
  { id: "D-008", label: "D-008 — Module" },
  { id: "D-008a", label: "D-008a — Module variante" },
  { id: "D-009", label: "D-009 — Rampe latérale" },
  { id: "D-010", label: "D-010 — Module" },
  { id: "D-010a", label: "D-010a — Module variante" },
];

type Props = { params: Promise<{ locale: string }> };

export default async function TestProduitPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-neutral-dark mb-1">
          Aperçu 3D des modules URBAQUAI
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Clic sur un module pour le charger. Clic-glisser pour faire tourner, molette pour zoomer.
        </p>
        <ProductViewer modules={MODULES} />
      </div>
    </div>
  );
}
