"use client";

import { Zap, MapPin, Recycle, Accessibility } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const USPS = [
  { key: "miseEnOeuvre", icon: Zap },
  { key: "poseDirecte", icon: MapPin },
  { key: "logistique", icon: Recycle },
  { key: "accessibilite", icon: Accessibility },
] as const;

export function UspCards() {
  const t = useTranslations("usp");

  return (
    <section className="bg-surface pb-16 lg:pb-24">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {USPS.map(({ key, icon: Icon }, i) => {
            const isAccent = i === 0;
            return (
              <article
                key={key}
                className={cn(
                  "rounded-2xl p-6 lg:p-7 min-h-[200px] flex flex-col gap-4 transition-all duration-300",
                  isAccent
                    ? "bg-accent text-white shadow-lg shadow-accent/30"
                    : "bg-white text-neutral-dark border border-surface-200 hover:border-accent/30 hover:shadow-md"
                )}
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center",
                    isAccent ? "bg-white/15" : "bg-accent-50 text-accent"
                  )}
                >
                  <Icon size={20} />
                </div>
                <h3
                  className={cn(
                    "text-base lg:text-lg font-semibold leading-snug",
                    isAccent ? "text-white" : "text-neutral-dark"
                  )}
                >
                  {t(`${key}.title`)}
                </h3>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
