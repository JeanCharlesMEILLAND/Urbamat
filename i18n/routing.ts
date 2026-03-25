import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "de"],
  defaultLocale: "fr",
  localePrefix: "as-needed", // FR sans préfixe, /en/... et /de/...
});

export type Locale = (typeof routing.locales)[number];
