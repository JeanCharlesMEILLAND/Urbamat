import { SITE_CONFIG } from "@/lib/constants";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_CONFIG.company,
        url: SITE_CONFIG.url,
        logo: `${SITE_CONFIG.url}/images/logo-urbaquai.svg`,
        description:
          "URBAMAT Environnement conçoit et fabrique URBAQUAI, le système de quai bus modulaire en béton haute performance pour l'accessibilité PMR.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Lupstein",
          addressRegion: "Alsace",
          addressCountry: "FR",
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: SITE_CONFIG.email,
          contactType: "sales",
          availableLanguage: "French",
        },
      }}
    />
  );
}

export function ProductJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: "URBAQUAI",
        description:
          "Système de quai bus modulaire en béton haute performance. Accessibilité PMR, pose en 48h, provisoire ou définitif.",
        brand: {
          "@type": "Brand",
          name: SITE_CONFIG.company,
        },
        manufacturer: {
          "@type": "Organization",
          name: SITE_CONFIG.company,
        },
        category: "Équipement d'infrastructure de transport",
        material: "Béton haute performance C50/60",
      }}
    />
  );
}
