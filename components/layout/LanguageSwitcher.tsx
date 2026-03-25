"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function handleChange(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={cn(
            "px-2 py-1 text-xs font-semibold rounded-md transition-colors",
            locale === loc
              ? "bg-primary text-white"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          )}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
