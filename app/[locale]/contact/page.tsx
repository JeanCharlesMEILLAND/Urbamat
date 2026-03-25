import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LeadForm } from "@/components/LeadForm";
import { SITE_CONFIG } from "@/lib/constants";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const CONTACT_INFO = [
    { icon: Phone, label: t("telephone"), value: SITE_CONFIG.tel, href: "tel:+33388010961" },
    { icon: Mail, label: t("emailLabel"), value: SITE_CONFIG.email, href: `mailto:${SITE_CONFIG.email}` },
    { icon: MapPin, label: t("adresse"), value: "URBAMAT Environnement\n4 rue d'Altenheim\n67490 Lupstein, France" },
    { icon: Clock, label: t("horaires"), value: t("horairesValue") },
  ];

  return (
    <div>
      <section className="bg-neutral-light py-16 lg:py-24">
        <Container>
          <SectionHeader titre={t("titre")} sousTitre={t("sousTitre")} />
        </Container>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-neutral-dark mb-6">{t("formulaire")}</h2>
              <LeadForm />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-dark mb-6">{t("coordonnees")}</h2>
              <div className="space-y-6">
                {CONTACT_INFO.map((info) => (
                  <div key={info.label} className="flex gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <info.icon size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">{info.label}</p>
                      {info.href ? (
                        <a href={info.href} className="text-sm text-primary hover:text-primary-600 transition-colors whitespace-pre-line">{info.value}</a>
                      ) : (
                        <p className="text-sm text-neutral-dark whitespace-pre-line">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 bg-accent/10 border border-accent/20 rounded-lg p-5">
                <h3 className="font-semibold text-neutral-dark text-sm">{t("prescripteur")}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{t("prescripteurTexte")}</p>
                <a href="/telechargements" className="inline-block mt-3 text-sm font-medium text-primary hover:text-primary-600 transition-colors">
                  {t("accesTelechargements")} &rarr;
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
