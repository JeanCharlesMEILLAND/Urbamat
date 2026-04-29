import dynamic from "next/dynamic";
import { setRequestLocale } from "next-intl/server";

const QuaiAssemblyAnimation = dynamic(
  () => import("@/components/preview/QuaiAssemblyAnimation").then((m) => m.QuaiAssemblyAnimation),
  { ssr: false }
);

type Props = { params: Promise<{ locale: string }> };

export default async function TestAnimationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-neutral-dark mb-1">
          Animation d'assemblage du quai
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Pose modulaire des éléments URBAQUAI un par un — double rangée complète.
        </p>
        <div className="aspect-[16/8] rounded-2xl bg-white border border-surface-200 overflow-hidden">
          <QuaiAssemblyAnimation coloris="granit-gris" />
        </div>
      </div>
    </div>
  );
}
