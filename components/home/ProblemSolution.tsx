"use client";

import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, Accessibility, Zap, Wrench, BadgeCheck, Droplets, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

export function ProblemSolution() {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const t = useTranslations("problemSolution");

  const PROBLEMS = [
    { icon: ShieldAlert, key: "inaccessibles" },
    { icon: Clock, key: "travaux" },
    { icon: AlertTriangle, key: "perturbation" },
  ];

  const SOLUTIONS = [
    { icon: Accessibility, key: "accessibilite" },
    { icon: Zap, key: "pose48h" },
    { icon: Wrench, key: "modulaire" },
    { icon: Droplets, key: "hydraulique" },
    { icon: Sun, key: "albedo" },
    { icon: BadgeCheck, key: "certifie" },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white" ref={ref}>
      <Container>
        <SectionHeader
          titre={t("titre")}
          sousTitre={t("sousTitre")}
        />

        <div className={cn(
          "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mt-16 transition-all duration-700",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {/* Problème */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-dark">{t("constat")}</h3>
            </div>
            <div className="space-y-6">
              {PROBLEMS.map((item) => (
                <div key={item.key} className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <item.icon size={20} className="text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-dark">{t(`problems.${item.key}.title`)}</h4>
                    <p className="mt-1 text-gray-600 leading-relaxed text-sm">{t(`problems.${item.key}.text`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-success" />
              </div>
              <h3 className="text-xl font-bold text-neutral-dark">{t("reponse")}</h3>
            </div>
            <div className="space-y-6">
              {SOLUTIONS.map((item) => (
                <div key={item.key} className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <item.icon size={20} className="text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-dark">{t(`solutions.${item.key}.title`)}</h4>
                    <p className="mt-1 text-gray-600 leading-relaxed text-sm">{t(`solutions.${item.key}.text`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
