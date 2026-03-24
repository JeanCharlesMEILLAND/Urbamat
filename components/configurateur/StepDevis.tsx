"use client";

import { FileText, Weight, Ruler, Box } from "lucide-react";
import type { QuaiConfig } from "@/lib/configurateur";

interface StepDevisProps {
  config: QuaiConfig;
}

export function StepDevis({ config }: StepDevisProps) {
  const { bom, poidsTotal, nbModulesTotal, longueurReelle } = config;

  return (
    <div className="space-y-6">
      {/* Résumé */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-primary/5 rounded-lg p-3 text-center">
          <Ruler size={18} className="text-primary mx-auto mb-1" />
          <div className="font-mono text-lg font-bold text-primary">
            {(longueurReelle / 1000).toFixed(1)} m
          </div>
          <div className="text-xs text-gray-500">Longueur</div>
        </div>
        <div className="bg-primary/5 rounded-lg p-3 text-center">
          <Box size={18} className="text-primary mx-auto mb-1" />
          <div className="font-mono text-lg font-bold text-primary">
            {nbModulesTotal}
          </div>
          <div className="text-xs text-gray-500">Modules</div>
        </div>
        <div className="bg-primary/5 rounded-lg p-3 text-center">
          <Weight size={18} className="text-primary mx-auto mb-1" />
          <div className="font-mono text-lg font-bold text-primary">
            {(poidsTotal / 1000).toFixed(1)} t
          </div>
          <div className="text-xs text-gray-500">Poids total</div>
        </div>
        <div className="bg-primary/5 rounded-lg p-3 text-center">
          <FileText size={18} className="text-primary mx-auto mb-1" />
          <div className="font-mono text-lg font-bold text-primary">
            {bom.length}
          </div>
          <div className="text-xs text-gray-500">Réf. distinctes</div>
        </div>
      </div>

      {/* BOM */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-dark mb-3">
          Nomenclature (BOM)
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Réf.</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Module</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-500">L (mm)</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-500">Qté</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-500">Poids unit.</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-500">Poids total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bom.map((line) => (
                <tr key={line.ref} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-primary text-sm font-semibold">
                    {line.ref}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{line.nom}</td>
                  <td className="px-4 py-2 text-center font-mono text-gray-500">
                    {line.longueur}
                  </td>
                  <td className="px-4 py-2 text-center font-mono font-bold text-neutral-dark">
                    {line.quantite}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-gray-500">
                    {line.poids} kg
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-semibold text-neutral-dark">
                    {line.poidsTotal} kg
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-primary/5 border-t border-gray-200">
                <td colSpan={3} className="px-4 py-2.5 font-semibold text-neutral-dark">
                  Total
                </td>
                <td className="px-4 py-2.5 text-center font-mono font-bold text-primary">
                  {nbModulesTotal}
                </td>
                <td className="px-4 py-2.5" />
                <td className="px-4 py-2.5 text-right font-mono font-bold text-primary">
                  {poidsTotal.toLocaleString("fr-FR")} kg
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
