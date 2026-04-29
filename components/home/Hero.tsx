import { getTranslations, getLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { getCmsOverrides } from "@/lib/cms";

export async function Hero() {
  const t = await getTranslations("hero");
  const locale = await getLocale();
  const cms = await getCmsOverrides("home", locale);

  const titre = cms.hero_titre || t("titre");
  const description = cms.hero_description || t("description");
  const eyebrow = cms.hero_sous_titre || t("sousTitre");

  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-100/60 via-surface to-surface" />
      <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-accent-200/40 blur-3xl" />

      <Container className="relative z-10 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto animate-fade-in">
          <div className="mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-urbaquai.png"
              alt="URBAQUAI®"
              className="h-16 lg:h-20 w-auto mx-auto"
            />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-dark leading-[1.1] tracking-tight">
            {titre}
          </h1>

          <p className="mt-6 text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl">
            {description}
          </p>

          <p className="mt-10 text-sm text-gray-500">
            {eyebrow}
          </p>
        </div>
      </Container>
    </section>
  );
}
