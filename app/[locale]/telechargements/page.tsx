import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TelechargementsClient } from "@/components/telechargements/TelechargementsClient";
import { prisma } from "@/lib/prisma";
import { getCmsOverrides } from "@/lib/cms";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "telechargements" });
  return { title: t("titre"), description: t("sousTitre") };
}

export default async function TelechargementsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("telechargements");
  // Documents tirés directement de la BDD : le client gère le contenu via
  // /admin/documents (ajout/édition/suppression). Les documents marqués
  // featured remontent en premier.
  const [cms, documents] = await Promise.all([
    getCmsOverrides("telechargements", locale),
    prisma.document.findMany({
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div>
      <section className="bg-neutral-light py-16 lg:py-24">
        <Container>
          <SectionHeader
            titre={cms.titre || t("titre")}
            sousTitre={cms.sous_titre || t("sousTitre")}
          />
        </Container>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <TelechargementsClient
            documents={documents}
            labels={{
              documentsDisponibles: cms.documents_disponibles,
              accesDocuments: cms.acces_documents,
              accesDebloque: cms.acces_debloque,
              cliquezTelecharger: cms.cliquez_telecharger,
              remplissezFormulaire: cms.remplissez_formulaire,
            }}
          />
        </Container>
      </section>
    </div>
  );
}
