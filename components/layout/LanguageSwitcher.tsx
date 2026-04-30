"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALE_FLAGS: Record<string, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  de: "🇩🇪",
};

const DEFAULT_LABELS: Record<string, string> = {
  fr: "Français",
  en: "English",
  de: "Deutsch",
};

interface LanguageSwitcherProps {
  /** Libellés CMS personnalisés pour chaque langue (override des défauts) */
  labels?: { fr?: string; en?: string; de?: string };
}

export function LanguageSwitcher({ labels }: LanguageSwitcherProps = {}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm transition-colors",
          "text-gray-500 hover:text-neutral-dark hover:bg-gray-50",
          open && "bg-gray-50 text-neutral-dark"
        )}
        aria-label="Change language"
        aria-expanded={open}
      >
        <Globe size={16} />
        <span className="font-medium text-xs uppercase">{locale}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[120px] z-50 animate-fade-in">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleChange(loc)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                locale === loc
                  ? "text-primary bg-primary/5 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-neutral-dark"
              )}
            >
              <span className="text-base">{LOCALE_FLAGS[loc]}</span>
              <span>{labels?.[loc as "fr" | "en" | "de"] || DEFAULT_LABELS[loc] || loc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
