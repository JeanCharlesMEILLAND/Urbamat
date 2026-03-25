"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { useInView } from "@/hooks/useInView";
import { useCounter } from "@/hooks/useCounter";

interface StatItemProps {
  value: number;
  suffix: string;
  label: string;
  started: boolean;
}

function StatItem({ value, suffix, label, started }: StatItemProps) {
  const count = useCounter(value, 2000, started);

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-accent">
        {count}
        {suffix}
      </div>
      <div className="mt-1 text-sm text-primary-100">{label}</div>
    </div>
  );
}

export function StatsBar() {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const t = useTranslations("stats");

  const STATS = [
    { value: 35, suffix: " ans", label: t("expertise") },
    { value: 48, suffix: "h", label: t("pose") },
    { value: 200, suffix: "+", label: t("quais") },
  ];

  return (
    <section className="bg-primary py-8 lg:py-10" ref={ref}>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
          {STATS.map((stat) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              started={isInView}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
