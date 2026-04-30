import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "de", "nl"],
  defaultLocale: "fr",
  localePrefix: "as-needed", // FR sans préfixe, /en/..., /de/..., /nl/...
});

export type Locale = (typeof routing.locales)[number];
