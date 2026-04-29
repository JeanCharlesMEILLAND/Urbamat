import dynamic from "next/dynamic";
import { setRequestLocale } from "next-intl/server";

const ComboViewer = dynamic(
  () => import("@/components/preview/ComboViewer").then((m) => m.ComboViewer),
  { ssr: false }
);

type Props = { params: Promise<{ locale: string }> };

export default async function TestComboPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-neutral-dark mb-1">
          Super combo — Quai 2 rangées
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Row 1 (trottoir) : D-009 → D-004a → D-005 ×2 → D-007a → D-005 ×2 → D-003a<br/>
          Row 2 (chaussée) : D-004 → D-002 ×2 → D-007 → D-002 ×2 → D-003<br/>
          Clic-glisser pour faire tourner, molette pour zoomer.
        </p>
        <div className="aspect-[16/8] rounded-2xl bg-white border border-surface-200 overflow-hidden">
          <ComboViewer />
        </div>
      </div>
    </div>
  );
}
