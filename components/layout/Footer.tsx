import Link from "next/link";
import { MapPin, Mail, Phone, Linkedin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";

const FOOTER_LINKS = {
  produit: [
    { label: "URBAQUAI — Quai bus", href: "/produit" },
    { label: "URBATERRA — Terrasse", href: "/urbaterra" },
    { label: "Configurations", href: "/configurations" },
    { label: "Réalisations", href: "/realisations" },
    { label: "Téléchargements", href: "/telechargements" },
  ],
  ressources: [
    { label: "Réglementation", href: "/reglementation" },
    { label: "Contact", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-neutral-dark text-gray-300" role="contentinfo">
      <Container>
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Colonne 1 — Marque */}
            <div className="lg:col-span-1">
              <Link href="/" className="inline-block" aria-label="URBAQUAI - Accueil">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-urbaquai.png"
                  alt="URBAQUAI®"
                  className="h-8 w-auto brightness-0 invert"
                />
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">
                Système de quai bus modulaire en béton haute performance.
                Provisoire ou définitif, accessible PMR, posé en 48h.
              </p>
              <p className="mt-4 text-sm font-medium text-gray-400">
                Une solution {SITE_CONFIG.company}
              </p>
            </div>

            {/* Colonne 2 — Produit */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Produit
              </h3>
              <ul className="space-y-3">
                {FOOTER_LINKS.produit.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne 3 — Ressources */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Ressources
              </h3>
              <ul className="space-y-3">
                {FOOTER_LINKS.ressources.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonne 4 — Contact */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Contact
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href={`tel:+33388010961`}
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
            &copy; {new Date().getFullYear()} {SITE_CONFIG.company}. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/mentions-legales" className="hover:text-gray-300 transition-colors">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-gray-300 transition-colors">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
