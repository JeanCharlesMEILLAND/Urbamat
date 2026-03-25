"use client";

import { Check, X, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

type CellValue = "yes" | "no" | "partial" | string;

interface ComparisonRow {
  key: string;
  urbaquai: CellValue;
  zicla: CellValue;
  traditionnel: CellValue;
}

const ROWS: ComparisonRow[] = [
  { key: "perennite", urbaquai: "50+ ans", zicla: "10-15 ans", traditionnel: "30-50 ans" },
  { key: "gelDegel", urbaquai: "< 0.3 kg/m² (XF4)", zicla: "partial", traditionnel: "variable" },
  { key: "stabilite", urbaquai: "1 400 kg/module", zicla: "~50 kg/module", traditionnel: "massif" },
  { key: "antiderapante", urbaquai: "Sablé B24, SRT ≥ 78", zicla: "surfacePlastique", traditionnel: "variable" },
  { key: "reemploi", urbaquai: "yes", zicla: "partial", traditionnel: "no" },
  { key: "certification", urbaquai: "yes", zicla: "no", traditionnel: "partial" },
  { key: "poseSol", urbaquai: "yes", zicla: "no", traditionnel: "no" },
  { key: "hydraulique", urbaquai: "yes", zicla: "no", traditionnel: "no" },
  { key: "albedo", urbaquai: "yes", zicla: "no", traditionnel: "partial" },
  { key: "impact", urbaquai: "cimentBasCarbone", zicla: "plastiqueRecycle", traditionnel: "betonStandard" },
  { key: "delai", urbaquai: "48h", zicla: "24-48h", traditionnel: "2-4 sem." },
];

function CellContent({ value, t }: { value: CellValue; t: (key: string) => string }) {
  if (value === "yes") return <Check size={18} className="text-success mx-auto" />;
  if (value === "no") return <X size={18} className="text-red-500 mx-auto" />;
  if (value === "partial") return <Minus size={18} className="text-accent mx-auto" />;
  // Check if value is a translation key
  const translated = ["cimentBasCarbone", "plastiqueRecycle", "betonStandard", "surfacePlastique", "variable", "massif"].includes(value)
    ? t(`values.${value}`)
    : value;
  return <span className="text-sm">{translated}</span>;
}

export function ComparisonTable() {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const t = useTranslations("comparison");

  return (
    <section className="py-20 lg:py-28 bg-white" ref={ref}>
      <Container>
        <SectionHeader
          titre={t("titre")}
          sousTitre={t("sousTitre")}
        />
        <div className={cn(
          "mt-12 overflow-x-auto transition-all duration-700",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <table className="w-full min-w-[650px] border-collapse">
            <thead>
              <tr>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500 border-b-2 border-gray-100 w-[30%]">{t("critere")}</th>
                <th className="py-4 px-4 text-center border-b-2 border-primary w-[25%]">
                  <div className="text-base font-bold text-primary">{t("urbaquai")}</div>
                  <div className="text-xs text-gray-500 font-normal mt-0.5">{t("urbaquaiSub")}</div>
                </th>
                <th className="py-4 px-4 text-center text-sm font-semibold text-gray-500 border-b-2 border-gray-100 w-[22%]">
                  <div>{t("plastique")}</div>
                  <div className="text-xs font-normal mt-0.5">{t("plastiqueSub")}</div>
                </th>
                <th className="py-4 px-4 text-center text-sm font-semibold text-gray-500 border-b-2 border-gray-100 w-[23%]">
                  <div>{t("traditionnel")}</div>
                  <div className="text-xs font-normal mt-0.5">{t("traditionnelSub")}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.key} className={cn("border-b border-gray-50", i % 2 === 0 && "bg-gray-50/50")}>
                  <td className="py-3.5 px-4 text-sm font-medium text-neutral-dark">{t(`rows.${row.key}`)}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-primary bg-primary/[0.03]"><CellContent value={row.urbaquai} t={t} /></td>
                  <td className="py-3.5 px-4 text-center text-gray-600"><CellContent value={row.zicla} t={t} /></td>
                  <td className="py-3.5 px-4 text-center text-gray-600"><CellContent value={row.traditionnel} t={t} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
