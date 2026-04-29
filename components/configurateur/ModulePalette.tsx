"use client";

import { MODULE_CATALOG, type ModuleRef } from "@/lib/configurateur";
import { cn } from "@/lib/utils";

interface ModulePaletteProps {
  selectedModule: ModuleRef | null;
  onSelect: (ref: ModuleRef) => void;
}

/** Modules manuels du catalog actuel */
const ALL_MODULES: ModuleRef[] = [
  "D-009", "D-009s",
  "D-004", "D-004a",
  "D-005", "D-002", "D-006",
  "D-007", "D-007a", "D-008", "D-008a",
  "D-003", "D-003a",
  "VIDE",
];

const ROLE_COLORS: Record<string, string> = {
  rampe: "border-amber-400 bg-amber-50",
  lateral: "border-blue-300 bg-blue-50",
  central: "border-gray-300 bg-gray-50",
  jonction: "border-purple-300 bg-purple-50",
  fin: "border-emerald-300 bg-emerald-50",
  vide: "border-dashed border-gray-300 bg-white",
};

const ROLE_COLORS_SELECTED: Record<string, string> = {
  rampe: "border-amber-500 bg-amber-100 ring-2 ring-amber-400",
  lateral: "border-blue-500 bg-blue-100 ring-2 ring-blue-400",
  central: "border-primary bg-primary/10 ring-2 ring-primary",
  jonction: "border-purple-500 bg-purple-100 ring-2 ring-purple-400",
  fin: "border-emerald-500 bg-emerald-100 ring-2 ring-emerald-400",
  vide: "border-dashed border-gray-500 bg-gray-100 ring-2 ring-gray-400",
};

export function ModulePalette({ selectedModule, onSelect }: ModulePaletteProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-neutral-dark uppercase tracking-wider">
        Modules
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {ALL_MODULES.map((ref) => {
          const spec = MODULE_CATALOG[ref];
          const isSelected = selectedModule === ref;
          const colorClass = isSelected
            ? ROLE_COLORS_SELECTED[spec.role]
            : ROLE_COLORS[spec.role];

          return (
            <button
              key={ref}
              onClick={() => onSelect(ref)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "text/plain",
                  JSON.stringify({ type: "new", ref })
                );
                e.dataTransfer.effectAllowed = "all";
                onSelect(ref);
              }}
              className={cn(
                "p-3 rounded-lg border-2 text-left transition-all cursor-grab active:cursor-grabbing hover:shadow-md",
                colorClass
              )}
            >
              <div className="font-mono text-sm font-bold text-neutral-dark">{ref}</div>
              <div className="text-xs text-gray-600 mt-0.5">{spec.nom}</div>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <span className="font-mono">{spec.longueur} mm</span>
                <span>·</span>
                <span className="font-mono">{spec.poids} kg</span>
              </div>
              <div className="mt-2 h-3 bg-white/60 rounded border border-current/20 relative overflow-hidden">
                <div
                  className="h-full bg-current/20 rounded"
                  style={{ width: `${(spec.longueur / 3000) * 100}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {selectedModule && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
          <p className="text-xs text-primary font-medium">
            Module <span className="font-mono font-bold">{selectedModule}</span> sélectionné
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Glissez ou cliquez <strong>+</strong> sur le rang voulu
          </p>
        </div>
      )}
    </div>
  );
}
