import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { CONFIG_DIAGRAMS } from "@/components/produit/ConfigurationDiagrams";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "configurationsPage" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const CONFIG_IDS = ["avancee", "avancee_velo", "ile", "ile_velo"] as const;

export default async function ConfigurationsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tPage = await getTranslations("configurationsPage");
  const tConfig = await getTranslations("configurations");

  return (
    <div>
      <section className="bg-neutral-light py-16 lg:py-24">
        <Container>
          <SectionHeader titre={tPage("titre")} sousTitre={tPage("sousTitre")} />
        </Container>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="space-y-20">
            {CONFIG_IDS.map((id, index) => {
              const Diagram = CONFIG_DIAGRAMS[id];
              const isEven = index % 2 === 0;

              return (
                <div key={id} id={id} className="scroll-mt-24">
                  <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-12 items-center", !isEven && "lg:grid-flow-dense")}>
                    <div className={cn(!isEven && "lg:col-start-2")}>
                      <div className="rounded-xl p-4 lg:p-6 bg-gray-50 border border-gray-100 shadow-sm">
                        <Diagram className="w-full h-auto" />
                        <p className="text-center text-xs text-gray-400 mt-3">
                          {tPage("vueSchematique")} {tConfig(`${id}.sousTitre`)}
                        </p>
                      </div>
                    </div>

                    <div className={cn(!isEven && "lg:col-start-1")}>
                      <Badge variant={index < 2 ? "info" : "warning"} className="mb-3">
                        {tPage("configuration", { num: index + 1 })}
                      </Badge>
                      <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark">{tConfig(`${id}.titre`)}</h2>
                      <p className="mt-1 text-sm font-mono text-gray-500">{tConfig(`${id}.sousTitre`)}</p>
                      <p className="mt-4 text-gray-600 leading-relaxed">{tConfig(`${id}.description`)}</p>

                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{tPage("avantages")}</h3>
                        <ul className="space-y-2">
                          {[0, 1, 2, 3].map((i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
                              {tConfig(`${id}.avantages.${i}`)}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{tPage("casUsage")}</h3>
                        <div className="flex flex-wrap gap-2">
                          {[0, 1, 2].map((i) => (
                            <span key={i} className="text-xs px-3 py-1.5 bg-neutral-light text-gray-600 rounded-full border border-gray-200">
                              {tConfig(`${id}.casUsage.${i}`)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-20 bg-neutral-light">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark">{tPage("besoinAide")}</h2>
            <p className="mt-4 text-gray-600 max-w-xl mx-auto">{tPage("besoinAideSousTitre")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contact" size="lg">
                {tPage("nousContacter")}
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button href="/realisations" variant="outline" size="lg">
                {tPage("voirExemples")}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
