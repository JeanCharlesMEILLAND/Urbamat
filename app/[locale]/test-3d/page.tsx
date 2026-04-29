import dynamic from "next/dynamic";
import { setRequestLocale } from "next-intl/server";

const ObjViewer = dynamic(
  () => import("@/components/preview/ObjViewer").then((m) => m.ObjViewer),
  { ssr: false }
);

type Props = { params: Promise<{ locale: string }> };

export default async function Test3DPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-neutral-dark mb-4">
          Aperçu 3D — D-001
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Clic-glisser pour faire tourner. Molette pour zoomer.
        </p>
        <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-surface-200 bg-surface">
          <ObjViewer url="/models/D-001.obj" />
        </div>
      </div>
    </div>
  );
}
