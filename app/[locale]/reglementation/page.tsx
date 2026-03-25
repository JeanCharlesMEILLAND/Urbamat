import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Scale, BookOpen, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reglementation" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const TEXTE_ICONS = [Scale, BookOpen, ShieldCheck];
const TEXTE_KEYS = ["loi2005", "cerema", "normeNF"] as const;
const RESSOURCE_KEYS = ["sdaAdap", "subventions", "visaSncf"] as const;

export default async function ReglementationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("reglementation");

  return (
    <div>
      <section className="bg-neutral-light py-16 lg:py-24">
        <Container>
          <SectionHeader titre={t("titre")} sousTitre={t("sousTitre")} />
        </Container>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="space-y-16">
            {TEXTE_KEYS.map((key, index) => {
              const Icon = TEXTE_ICONS[index];
              return (
                <div key={key} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  <div className="lg:col-span-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-neutral-dark">{t(`${key}.titre`)}</h2>
                        <p className="text-sm text-gray-500">{t(`${key}.sousTitre`)}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[0, 1, 2].map((i) => (
                        <p key={i} className="text-gray-600 leading-relaxed text-sm">{t(`${key}.contenu.${i}`)}</p>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <div className="bg-success/5 border border-success/20 rounded-lg p-5">
                      <h3 className="text-sm font-semibold text-success uppercase tracking-wider mb-3">
                        {t("conformiteUrbaquai")}
                      </h3>
                      <ul className="space-y-2">
                        {[0, 1, 2, 3].map((i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <ShieldCheck size={14} className="text-success shrink-0 mt-0.5" />
                            {t(`${key}.conformite.${i}`)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24 bg-neutral-light">
        <Container>
          <SectionHeader titre={t("ressources")} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {RESSOURCE_KEYS.map((key) => (
              <Card key={key} variant="feature">
                <CardContent className="p-6">
                  <FileText size={20} className="text-primary mb-3" />
                  <h3 className="font-bold text-neutral-dark">{t(`ressourcesList.${key}.titre`)}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{t(`ressourcesList.${key}.description`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 bg-primary">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{t("ctaTitre")}</h2>
            <p className="mt-4 text-primary-100 max-w-xl mx-auto">{t("ctaSousTitre")}</p>
            <Button href="/contact" variant="secondary" size="lg" className="mt-8">
              {t("nousConsulter")}
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
