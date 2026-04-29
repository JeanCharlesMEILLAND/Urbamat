"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { useInView } from "@/hooks/useInView";
import { useCounter } from "@/hooks/useCounter";
import { COLORIS } from "@/lib/configurateur";
import { cn } from "@/lib/utils";
import type { ColorisId } from "@/components/preview/ModuleViewer";

const QuaiAssemblyAnimation = dynamic(
  () => import("@/components/preview/QuaiAssemblyAnimation").then((m) => m.QuaiAssemblyAnimation),
  { ssr: false }
);

function Stat({ value, suffix, label, started }: { value: number; suffix: string; label: string; started: boolean }) {
  const count = useCounter(value, 1800, started);
  return (
    <div className="flex flex-col">
      <div className="text-3xl lg:text-4xl font-bold text-accent leading-none">
        {count}
        <span className="text-2xl lg:text-3xl">{suffix}</span>
      </div>
      <div className="mt-2 text-xs lg:text-sm text-gray-500 uppercase tracking-wide">{label}</div>
    </div>
  );
}

export function ConceptUrbaquai() {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const t = useTranslations("concept");
  const tStats = useTranslations("stats");
  const [selectedColoris, setSelectedColoris] = useState<ColorisId>("granit-gris");

  // ─── Scroll auto pour centrer la vidéo quand l'animation se lance ─────
  const videoRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasScrolledRef.current) return;
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Quand au moins 50% de la vidéo est visible et qu'on n'a pas encore scrollé,
        // on centre automatiquement la vidéo dans le viewport.
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !hasScrolledRef.current) {
          hasScrolledRef.current = true;
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      },
      { threshold: [0, 0.5, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="concept" className="py-20 lg:py-28 bg-white scroll-mt-24" ref={ref}>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight text-accent">
              {t("titre")}
            </h2>
            <p className="mt-6 text-base lg:text-lg text-gray-600 leading-relaxed">
              {t("description")}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-3 gap-6 lg:gap-8 lg:pt-4">
              <Stat value={35} suffix=" ans" label={tStats("expertise")} started={isInView} />
              <Stat value={48} suffix="h" label={tStats("pose")} started={isInView} />
              <Stat value={200} suffix="+" label={tStats("quais")} started={isInView} />
            </div>
          </div>
        </div>

        <div ref={videoRef} className="mt-14 aspect-[16/7] overflow-hidden relative scroll-mt-24">
          <QuaiAssemblyAnimation coloris={selectedColoris} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs uppercase tracking-wider text-gray-500 mr-2">Coloris</span>
          {COLORIS.map((c) => {
            const isActive = selectedColoris === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedColoris(c.id as ColorisId)}
                className={cn(
                  "group flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border transition-all",
                  isActive
                    ? "border-accent bg-accent-50"
                    : "border-surface-200 hover:border-accent/50 bg-white"
                )}
                aria-pressed={isActive}
              >
                <span
                  className="w-7 h-7 rounded-full border border-black/10 shadow-inner overflow-hidden"
                  aria-hidden
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/urbamat/coloris-${c.id}.png`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </span>
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? "text-accent" : "text-neutral-dark"
                )}>
                  {c.nom}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">{t("visuelLegende")}</p>
      </Container>
    </section>
  );
}
