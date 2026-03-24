import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { StatsBar } from "@/components/home/StatsBar";
import { ProblemSolution } from "@/components/home/ProblemSolution";
import { ConfigurationsGrid } from "@/components/home/ConfigurationsGrid";
import { ComparisonTable } from "@/components/home/ComparisonTable";
import { FeaturedRealisations } from "@/components/home/FeaturedRealisations";
import { ReglementationBlock } from "@/components/home/ReglementationBlock";
import { CtaContact } from "@/components/home/CtaContact";
import { SITE_CONFIG } from "@/lib/constants";

// JSON-LD via metadata au lieu de dangerouslySetInnerHTML
export const metadata: Metadata = {
  other: {
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_CONFIG.company,
      url: SITE_CONFIG.url,
      description:
        "URBAMAT Environnement conçoit et fabrique URBAQUAI, le système de quai bus modulaire en béton haute performance pour l'accessibilité PMR.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "4 rue d'Altenheim",
        postalCode: "67490",
        addressLocality: "Lupstein",
        addressCountry: "FR",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: SITE_CONFIG.email,
        telephone: "+33388010961",
        contactType: "sales",
        availableLanguage: "French",
      },
    }),
  },
};

export default function HomePage() {
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
