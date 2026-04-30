import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LeadForm } from "@/components/LeadForm";
import { SITE_CONFIG } from "@/lib/constants";
import { getCmsOverrides } from "@/lib/cms";

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
  const cms = await getCmsOverrides("contact", locale);

  // Téléphone affiché — par défaut SITE_CONFIG.tel. Le href tel: est dérivé en
  // retirant les espaces du numéro pour rester cliquable même si le client
  // change le format.
  const phoneDisplay = cms.contact_telephone || SITE_CONFIG.tel;
  const emailDisplay = cms.contact_email || SITE_CONFIG.email;
  const phoneHref = `tel:${phoneDisplay.replace(/\s/g, "")}`;
  const emailHref = `mailto:${emailDisplay}`;

  const CONTACT_INFO = [
    {
      icon: Phone,
      label: cms.contact_telephone_label || t("telephone"),
      value: phoneDisplay,
      href: phoneHref,
    },
    {
      icon: Mail,
      label: cms.contact_email_label || t("emailLabel"),
      value: emailDisplay,
      href: emailHref,
    },
    {
      icon: MapPin,
      label: cms.contact_adresse_label || t("adresse"),
      value: cms.contact_adresse || "URBAMAT Environnement\n4 rue d'Altenheim\n67490 Lupstein, France",
    },
    {
      icon: Clock,
      label: cms.contact_horaires_label || t("horaires"),
      value: cms.contact_horaires || t("horairesValue"),
    },
  ];

  return (
    <div>
      <section className="bg-neutral-light py-16 lg:py-24">
        <Container>
          <SectionHeader titre={cms.titre || t("titre")} sousTitre={cms.sous_titre || t("sousTitre")} />
        </Container>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-neutral-dark mb-6">
                {cms.contact_formulaire_titre || t("formulaire")}
              </h2>
              <LeadForm />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-dark mb-6">
                {cms.contact_coordonnees_titre || t("coordonnees")}
              </h2>
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
                        // L'adresse est de type "html" → on rend en dangerouslySetInnerHTML pour
                        // accepter les retours à la ligne ET d'éventuels <strong>/<br>. Pour les
                        // horaires (texte simple), pareil — le passage par innerHTML ne change
                        // rien au rendu d'un texte sans balise.
                        <div
                          className="text-sm text-neutral-dark whitespace-pre-line [&_strong]:font-semibold"
                          dangerouslySetInnerHTML={{ __html: info.value }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 bg-accent/10 border border-accent/20 rounded-lg p-5">
                <h3 className="font-semibold text-neutral-dark text-sm">
                  {cms.prescripteur_titre || t("prescripteur")}
                </h3>
                <div
                  className="text-sm text-gray-600 mt-2 leading-relaxed [&_strong]:text-neutral-dark"
                  dangerouslySetInnerHTML={{
                    __html: cms.prescripteur_texte || t("prescripteurTexte"),
                  }}
                />
                <a
                  href={cms.prescripteur_cta_url || "/telechargements"}
                  className="inline-block mt-3 text-sm font-medium text-primary hover:text-primary-600 transition-colors"
                >
                  {cms.prescripteur_cta_label || t("accesTelechargements")} &rarr;
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
