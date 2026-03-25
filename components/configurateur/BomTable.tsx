"use client";

import { FileText, Weight, Box, Ruler } from "lucide-react";
import type { PlacedModule, BomLine, ModuleRef, ModuleRow } from "@/lib/configurateur";

interface BomTableProps {
  modules: PlacedModule[];
}

function computeBom(modules: PlacedModule[]) {
  const bomMap = new Map<ModuleRef, BomLine>();

  for (const m of modules) {
    const existing = bomMap.get(m.ref);
    if (existing) {
      existing.quantite += 1;
      existing.poidsTotal += m.spec.poids;
    } else {
      bomMap.set(m.ref, {
        ref: m.ref,
        nom: m.spec.nom,
        quantite: 1,
        longueur: m.spec.longueur,
        poids: m.spec.poids,
        poidsTotal: m.spec.poids,
      });
    }
  }

  return Array.from(bomMap.values()).sort((a, b) => a.ref.localeCompare(b.ref));
}

export function BomTable({ modules }: BomTableProps) {
  const bom = computeBom(modules);
  const poidsTotal = modules.reduce((s, m) => s + m.spec.poids, 0);
  const rowNumbers: ModuleRow[] = [1, 2, 3];
  const longueurParRangee = rowNumbers.map(
    (row) => modules.filter((m) => m.rang === row).reduce((s, m) => s + m.spec.longueur, 0),
  );
  const longueurMax = Math.max(...longueurParRangee, 0);

  if (modules.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">
        Ajoutez des modules pour voir la nomenclature
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-primary/5 rounded-lg p-2.5 text-center">
          <Ruler size={14} className="text-primary mx-auto mb-0.5" />
          <div className="font-mono text-sm font-bold text-primary">{(longueurMax / 1000).toFixed(1)} m</div>
          <div className="text-[10px] text-gray-500">Longueur</div>
        </div>
        <div className="bg-primary/5 rounded-lg p-2.5 text-center">
          <Box size={14} className="text-primary mx-auto mb-0.5" />
          <div className="font-mono text-sm font-bold text-primary">{modules.length}</div>
          <div className="text-[10px] text-gray-500">Modules</div>
        </div>
        <div className="bg-primary/5 rounded-lg p-2.5 text-center">
          <Weight size={14} className="text-primary mx-auto mb-0.5" />
          <div className="font-mono text-sm font-bold text-primary">{(poidsTotal / 1000).toFixed(1)} t</div>
          <div className="text-[10px] text-gray-500">Poids</div>
        </div>
        <div className="bg-primary/5 rounded-lg p-2.5 text-center">
          <FileText size={14} className="text-primary mx-auto mb-0.5" />
          <div className="font-mono text-sm font-bold text-primary">{bom.length}</div>
          <div className="text-[10px] text-gray-500">Réf.</div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-3 py-2 font-medium text-gray-500">Réf.</th>
              <th className="text-left px-3 py-2 font-medium text-gray-500">Module</th>
              <th className="text-center px-3 py-2 font-medium text-gray-500">Qté</th>
              <th className="text-right px-3 py-2 font-medium text-gray-500">Poids</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bom.map((line) => (
              <tr key={line.ref}>
                <td className="px-3 py-1.5 font-mono text-primary font-semibold">{line.ref}</td>
                <td className="px-3 py-1.5 text-gray-700">{line.nom}</td>
                <td className="px-3 py-1.5 text-center font-mono font-bold">{line.quantite}</td>
                <td className="px-3 py-1.5 text-right font-mono text-gray-600">{line.poidsTotal} kg</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-primary/5 border-t border-gray-200">
              <td colSpan={2} className="px-3 py-2 font-semibold">Total</td>
              <td className="px-3 py-2 text-center font-mono font-bold text-primary">{modules.length}</td>
              <td className="px-3 py-2 text-right font-mono font-bold text-primary">{poidsTotal.toLocaleString("fr-FR")} kg</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
