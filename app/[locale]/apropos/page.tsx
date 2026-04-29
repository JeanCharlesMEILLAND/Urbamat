import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { APropos } from "@/components/home/APropos";

export const metadata: Metadata = {
  title: "À propos d'URBAMAT Environnement — URBAQUAI®",
  description:
    "URBAMAT Environnement, PME familiale alsacienne spécialiste de l'accessibilité des transports publics depuis le début des années 2000. Membre de la Fédération des Industries Ferroviaires (FIF) et fournisseur officiel SNCF depuis 2015.",
};

type Props = { params: Promise<{ locale: string }> };

export default async function AProposPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <APropos />
    </main>
  );
}
