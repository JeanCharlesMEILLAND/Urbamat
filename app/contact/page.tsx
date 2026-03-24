import type { Metadata } from "next";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LeadForm } from "@/components/LeadForm";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact — Demandez un devis URBAQUAI",
  description:
    "Contactez URBAMAT Environnement pour votre projet de quai bus modulaire URBAQUAI. Devis gratuit sous 24h, accompagnement technique personnalisé.",
};

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Téléphone",
    value: SITE_CONFIG.tel,
    href: "tel:+33388010961",
  },
  {
    icon: Mail,
    label: "Email",
    value: SITE_CONFIG.email,
    href: `mailto:${SITE_CONFIG.email}`,
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "URBAMAT Environnement\n4 rue d'Altenheim\n67490 Lupstein, France",
  },
  {
    icon: Clock,
    label: "Horaires",
    value: "Lun — Ven : 8h00 — 17h30",
  },
];

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-neutral-light py-16 lg:py-24">
        <Container>
          <SectionHeader
            titre="Parlons de votre projet"
            sousTitre="Décrivez-nous votre besoin en accessibilité. Notre équipe vous répond sous 24h avec une proposition technique et un chiffrage adaptés."
          />
        </Container>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Formulaire */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-neutral-dark mb-6">
                Formulaire de contact
              </h2>
              <LeadForm />
            </div>

            {/* Infos de contact */}
            <div>
              <h2 className="text-xl font-bold text-neutral-dark mb-6">
                Coordonnées
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
                        <a
                          href={info.href}
                          className="text-sm text-primary hover:text-primary-600 transition-colors whitespace-pre-line"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-sm text-neutral-dark whitespace-pre-line">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Encadré */}
              <div className="mt-8 bg-accent/10 border border-accent/20 rounded-lg p-5">
                <h3 className="font-semibold text-neutral-dark text-sm">Vous êtes prescripteur ?</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Nous fournissons gratuitement les extraits CCTP/BPU types
                  intégrables dans vos marchés, ainsi que les plans DWG pour vos
                  projets CAO.
                </p>
                <a
                  href="/telechargements"
                  className="inline-block mt-3 text-sm font-medium text-primary hover:text-primary-600 transition-colors"
                >
                  Accéder aux téléchargements &rarr;
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
