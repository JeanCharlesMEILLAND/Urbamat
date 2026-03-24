import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RealisationForm } from "@/components/admin/RealisationForm";

interface PageProps {
  params: { id: string };
}

export default async function EditRealisationPage({ params }: PageProps) {
  const realisation = await prisma.realisation.findUnique({
    where: { id: params.id },
  });

  if (!realisation) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-dark mb-6">
        Modifier : {realisation.titre}
      </h1>
      <RealisationForm initial={realisation} />
    </div>
  );
}
