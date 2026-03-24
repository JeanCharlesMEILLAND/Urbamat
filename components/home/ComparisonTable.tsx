"use client";

import { Check, X, Minus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

type CellValue = "yes" | "no" | "partial" | string;

interface ComparisonRow {
  critere: string;
  urbaquai: CellValue;
  zicla: CellValue;
  traditionnel: CellValue;
}

const ROWS: ComparisonRow[] = [
  { critere: "Pérennité", urbaquai: "50+ ans", zicla: "10-15 ans", traditionnel: "30-50 ans" },
  { critere: "Résistance gel/dégel", urbaquai: "< 0.3 kg/m² (XF4)", zicla: "partial", traditionnel: "Variable" },
  { critere: "Stabilité (poids)", urbaquai: "1 400 kg/module", zicla: "~50 kg/module", traditionnel: "Massif" },
  { critere: "Finition antidérapante", urbaquai: "Sablé B24, SRT ≥ 78", zicla: "Surface plastique", traditionnel: "Variable" },
  { critere: "Réemploi / réversibilité", urbaquai: "yes", zicla: "partial", traditionnel: "no" },
  { critere: "Certification CERIB", urbaquai: "yes", zicla: "no", traditionnel: "partial" },
  { critere: "Pose sur sol souple ET rigide", urbaquai: "yes", zicla: "no", traditionnel: "no" },
  { critere: "Transparence hydraulique", urbaquai: "yes", zicla: "no", traditionnel: "no" },
  { critere: "Albédo élevé (confort thermique)", urbaquai: "yes", zicla: "no", traditionnel: "partial" },
  { critere: "Impact environnemental", urbaquai: "Ciment NF bas carbone", zicla: "Plastique recyclé", traditionnel: "Béton standard" },
  { critere: "Délai de pose", urbaquai: "48h", zicla: "24-48h", traditionnel: "2-4 semaines" },
];

function CellContent({ value }: { value: CellValue }) {
  if (value === "yes") return <Check size={18} className="text-success mx-auto" />;
  if (value === "no") return <X size={18} className="text-red-500 mx-auto" />;
  if (value === "partial") return <Minus size={18} className="text-accent mx-auto" />;
  return <span className="text-sm">{value}</span>;
}

export function ComparisonTable() {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <section className="py-20 lg:py-28 bg-white" ref={ref}>
      <Container>
        <SectionHeader
          titre="Pourquoi URBAQUAI ?"
          sousTitre="Comparaison objective avec les solutions plastiques modulaires et les aménagements traditionnels en béton coulé."
        />
        <div className={cn(
          "mt-12 overflow-x-auto transition-all duration-700",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <table className="w-full min-w-[650px] border-collapse">
            <thead>
              <tr>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500 border-b-2 border-gray-100 w-[30%]">Critère</th>
                <th className="py-4 px-4 text-center border-b-2 border-primary w-[25%]">
                  <div className="text-base font-bold text-primary">URBAQUAI®</div>
                  <div className="text-xs text-gray-500 font-normal mt-0.5">Béton modulaire C40/50</div>
                </th>
                <th className="py-4 px-4 text-center text-sm font-semibold text-gray-500 border-b-2 border-gray-100 w-[22%]">
                  <div>Plastique modulaire</div>
                  <div className="text-xs font-normal mt-0.5">Ex: Zicla Vectorial</div>
                </th>
                <th className="py-4 px-4 text-center text-sm font-semibold text-gray-500 border-b-2 border-gray-100 w-[23%]">
                  <div>Béton coulé</div>
                  <div className="text-xs font-normal mt-0.5">Solution traditionnelle</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.critere} className={cn("border-b border-gray-50", i % 2 === 0 && "bg-gray-50/50")}>
                  <td className="py-3.5 px-4 text-sm font-medium text-neutral-dark">{row.critere}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-primary bg-primary/[0.03]"><CellContent value={row.urbaquai} /></td>
                  <td className="py-3.5 px-4 text-center text-gray-600"><CellContent value={row.zicla} /></td>
                  <td className="py-3.5 px-4 text-center text-gray-600"><CellContent value={row.traditionnel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
