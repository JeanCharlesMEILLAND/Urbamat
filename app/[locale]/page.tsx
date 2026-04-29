import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { UspCards } from "@/components/home/UspCards";
import { ConceptUrbaquai } from "@/components/home/ConceptUrbaquai";
import { Constat } from "@/components/home/Constat";
import { Reponse } from "@/components/home/Reponse";
import { ConfigurationsGrid } from "@/components/home/ConfigurationsGrid";
import { Documentation } from "@/components/home/Documentation";
import { APropos } from "@/components/home/APropos";
import { ComparisonTable } from "@/components/home/ComparisonTable";
import { FeaturedRealisations } from "@/components/home/FeaturedRealisations";
import { ReglementationBlock } from "@/components/home/ReglementationBlock";
import { CtaContact } from "@/components/home/CtaContact";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <Hero />
      <UspCards />
      <ConceptUrbaquai />
      <Constat />
      <Reponse />
      <ConfigurationsGrid />
      <ComparisonTable />
      <FeaturedRealisations />
      <Documentation />
      <APropos />
      <ReglementationBlock />
      <CtaContact />
    </div>
  );
}
