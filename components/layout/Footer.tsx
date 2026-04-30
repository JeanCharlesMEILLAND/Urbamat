import { useTranslations } from "next-intl";
import { MapPin, Mail, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SITE_CONFIG } from "@/lib/constants";

// Liens conformes à l'arborescence URBAMAT (avril 2026).
// Pages cachées pour l'instant : /urbaterra, /configurations, /realisations, /reglementation.
const FOOTER_PRODUCT_LINKS = [
  { key: "urbaquai", href: "/produit" },
  { key: "configurateur", href: "/configurateur" },
  { key: "telechargements", href: "/telechargements" },
] as const;

const FOOTER_RESOURCE_LINKS = [
  { key: "apropos", href: "/apropos" },
  { key: "contact", href: "/contact" },
] as const;

interface FooterProps {
  /** Description CMS (sous le logo) — fallback i18n si non définie */
  description?: string;
}

export function Footer({ description }: FooterProps = {}) {
  const t = useTranslations("footer");

  return (
    <footer id="footer" className="bg-neutral-dark text-gray-300" role="contentinfo">
      <Container>
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Colonne 1 — Marque */}
            <div className="lg:col-span-1">
              <Link href="/" className="inline-block" aria-label="URBAMAT - Accueil">
                {/* Même logo que la navbar — SVG URBAMAT, mis en blanc via CSS filter
                    (le SVG contient des fills hardcodés #06030D, brightness-0 invert les passe en blanc). */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-urbamat.svg"
                  alt="URBAMAT"
                  className="h-7 w-auto brightness-0 invert"
                />
              </Link>
              {description ? (
                <div
                  className="mt-4 text-sm leading-relaxed text-gray-400 [&_p]:mb-2 [&_strong]:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-gray-400">
                  {t("description")}
                </p>
              )}
              <p className="mt-4 text-sm font-medium text-gray-400">
                {t("solution", { company: SITE_CONFIG.company })}
              </p>
            </div>

            {/* Colonne 2 — Produit */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {t("produit")}
              </h3>
              <ul className="space-y-3">
                {FOOTER_PRODUCT_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {t(`links.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne 3 — Ressources */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {t("ressources")}
              </h3>
              <ul className="space-y-3">
                {FOOTER_RESOURCE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {t(`links.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne 4 — Contact */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {t("contact")}
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="tel:+33388010961"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Phone size={16} className="shrink-0" />
                    {SITE_CONFIG.tel}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Mail size={16} className="shrink-0" />
                    {SITE_CONFIG.email}
                  </a>
                </li>
                <li>
                  <span className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin size={16} className="shrink-0" />
                    {SITE_CONFIG.address}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Barre légale */}
        <div className="border-t border-gray-700 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.company}. {t("legal")}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/mentions-legales" className="hover:text-gray-300 transition-colors">
              {t("mentionsLegales")}
            </Link>
            <Link href="/confidentialite" className="hover:text-gray-300 transition-colors">
              {t("confidentialite")}
            </Link>
            <a href="/admin" className="hover:text-gray-300 transition-colors opacity-40 hover:opacity-100">
              Admin
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
