import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { StatsBar } from "@/components/home/StatsBar";
import { ProblemSolution } from "@/components/home/ProblemSolution";
import { ConfigurationsGrid } from "@/components/home/ConfigurationsGrid";
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
      <StatsBar />
      <ProblemSolution />
      <ConfigurationsGrid />
      <ComparisonTable />
      <FeaturedRealisations />
      <ReglementationBlock />
      <CtaContact />
    </div>
  );
}
