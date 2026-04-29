"use client";

import { COLORIS } from "@/lib/configurateur";
import { cn } from "@/lib/utils";

interface StepOptionsProps {
  coloris: string;
  onColorisChange: (v: string) => void;
}

export function StepOptions({ coloris, onColorisChange }: StepOptionsProps) {
  return (
    <div className="space-y-6">
      {/* Coloris */}
      <div>
        <label className="block text-sm font-semibold text-neutral-dark mb-3">
          Coloris du béton
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COLORIS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onColorisChange(c.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                coloris === c.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/urbamat/coloris-${c.id}.png`}
                  alt={c.nom}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={cn(
                "text-xs font-medium",
                coloris === c.id ? "text-primary" : "text-gray-600"
              )}>
                {c.nom}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Options complémentaires */}
      <div>
        <label className="block text-sm font-semibold text-neutral-dark mb-3">
          Options (à préciser au devis)
        </label>
        <div className="space-y-2">
          {[
            "Béton traité antisalissure S.O.",
            "Réservations pour mobilier urbain et garde-corps",
            "Bandes d'éveil de vigilance (BEV) contrastées",
            "Supports abri voyageurs compatibles",
          ].map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
