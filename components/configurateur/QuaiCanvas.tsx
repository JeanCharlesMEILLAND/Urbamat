"use client";

import { useState } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { MODULE_CATALOG, COLORIS, type PlacedModule, type ModuleRef, type ModuleRow, type NbRangees } from "@/lib/configurateur";
import { cn } from "@/lib/utils";

interface QuaiCanvasProps {
  modulesByRow: Record<ModuleRow, PlacedModule[]>;
  nbRangees: NbRangees;
  coloris: string;
  selectedModule: ModuleRef | null;
  onAddModule: (row: ModuleRow) => void;
  onRemoveModule: (row: ModuleRow, index: number) => void;
  onInsertModule: (row: ModuleRow, index: number, ref: ModuleRef) => void;
  onMoveModule: (row: ModuleRow, fromIndex: number, toIndex: number) => void;
}

const ROLE_BORDER: Record<string, string> = {
  rampe: "border-amber-400",
  lateral: "border-blue-300",
  central: "border-gray-300",
  jonction: "border-purple-300",
  fin: "border-emerald-300",
};

function getColorBg(colorisId: string): string {
  const c = COLORIS.find((cl) => cl.id === colorisId);
  return c?.fill ?? "#E8E4DB";
}

// ─── Drop zone entre les modules ────────────────────────────────

function DropZone({
  row,
  index,
  onDrop,
}: {
  row: ModuleRow;
  index: number;
  onDrop: (row: ModuleRow, index: number, data: string) => void;
}) {
  const [over, setOver] = useState(false);

  return (
    <div
      className={cn(
        "flex-shrink-0 self-stretch rounded transition-all min-h-[80px]",
        over
          ? "w-8 bg-primary/20 border-2 border-dashed border-primary"
          : "w-3 hover:bg-gray-200/50"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setOver(true);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOver(false);
        const data = e.dataTransfer.getData("text/plain");
        if (data) onDrop(row, index, data);
      }}
    />
  );
}

// ─── Tuile de module placé (draggable) ──────────────────────────

function ModuleTile({
  module,
  index,
  row,
  coloris,
  onRemove,
}: {
  module: PlacedModule;
  index: number;
  row: ModuleRow;
  coloris: string;
  onRemove: () => void;
}) {
  const spec = module.spec;
  const isRampe = spec.role === "rampe";
  const widthRatio = spec.longueur / 3000;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(
          "text/plain",
          JSON.stringify({ type: "reorder", row, index })
        );
        e.dataTransfer.effectAllowed = "all";
      }}
      className={cn(
        "relative group flex-shrink-0 border-2 rounded-md flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-all hover:shadow-lg hover:-translate-y-0.5",
        ROLE_BORDER[spec.role]
      )}
      style={{
        width: `${Math.max(widthRatio * 180, 50)}px`,
        height: "80px",
        backgroundColor: isRampe ? "#D4D0C8" : getColorBg(coloris),
      }}
      title={`${spec.ref} — ${spec.nom}\n${spec.longueur}mm × ${spec.largeur}mm\n${spec.poids} kg\n\nGlissez pour réordonner · Cliquez ✕ pour retirer`}
    >
      {/* Grip icon */}
      <div className="absolute top-1 left-1 text-gray-400/50 group-hover:text-gray-500">
        <GripVertical size={10} />
      </div>

      {/* Hachures rampe */}
      {isRampe && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent, transparent 3px, #888 3px, #888 4px)",
          }}
        />
      )}

      {/* Ref */}
      <span className="font-mono text-[10px] font-bold text-neutral-dark/70 relative z-10">
        {spec.ref}
      </span>
      <span className="text-[8px] text-gray-500 relative z-10 mt-0.5">
        {spec.longueur}mm
      </span>

      {/* Bouton supprimer au hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex shadow-sm z-20"
      >
        <X size={12} />
      </button>

      {/* Points tactiles */}
      {!isRampe && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-20">
          <div className="w-1 h-1 rounded-full bg-gray-600" />
          <div className="w-1 h-1 rounded-full bg-gray-600" />
          <div className="w-1 h-1 rounded-full bg-gray-600" />
        </div>
      )}
    </div>
  );
}

// ─── Bouton d'ajout ─────────────────────────────────────────────

function AddButton({
  row,
  hasSelection,
  onClick,
  onDrop,
}: {
  row: ModuleRow;
  hasSelection: boolean;
  onClick: () => void;
  onDrop: (row: ModuleRow, index: number, data: string) => void;
  index: number;
}) {
  const [over, setOver] = useState(false);

  return (
    <button
      onClick={onClick}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setOver(true);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const data = e.dataTransfer.getData("text/plain");
        if (data) onDrop(row, -1, data); // -1 = append at end
      }}
      className={cn(
        "flex-shrink-0 w-12 h-[80px] rounded-md border-2 border-dashed flex flex-col items-center justify-center transition-all",
        over
          ? "border-primary bg-primary/20 text-primary scale-105"
          : hasSelection
            ? "border-primary bg-primary/5 text-primary hover:bg-primary/10 animate-pulse"
            : "border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500"
      )}
      title={
        hasSelection
          ? "Cliquez pour placer le module"
          : "Sélectionnez ou glissez un module depuis la palette"
      }
    >
      <Plus size={20} />
      <span className="text-[8px] mt-0.5">Ajouter</span>
    </button>
  );
}

// ─── Rangée droppable ───────────────────────────────────────────

function RowCanvas({
  label,
  row,
  modules,
  longueur,
  coloris,
  selectedModule,
  onAddModule,
  onRemoveModule,
  onDrop,
}: {
  label: string;
  row: ModuleRow;
  modules: PlacedModule[];
  longueur: number;
  coloris: string;
  selectedModule: ModuleRef | null;
  onAddModule: (row: ModuleRow) => void;
  onRemoveModule: (row: ModuleRow, index: number) => void;
  onDrop: (row: ModuleRow, index: number, data: string) => void;
}) {
  const [rowOver, setRowOver] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-20">
          {label}
        </span>
        <span className="text-xs font-mono text-gray-400">
          {(longueur / 1000).toFixed(1)} m
        </span>
        {rowOver && (
          <span className="text-xs text-primary font-medium animate-pulse">
            Relâchez pour ajouter
          </span>
        )}
      </div>
      <div
        className={cn(
          "flex items-center gap-0 p-3 rounded-lg border-2 min-h-[96px] overflow-x-auto transition-colors",
          rowOver
            ? "bg-primary/5 border-primary/40 border-dashed"
            : "bg-gray-50 border-gray-200"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
          setRowOver(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setRowOver(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setRowOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setRowOver(false);
          const data = e.dataTransfer.getData("text/plain");
          if (data) onDrop(row, -1, data);
        }}
      >
        {modules.map((m, i) => (
          <div key={`${row}-${i}`} className="flex items-center">
            <DropZone row={row} index={i} onDrop={onDrop} />
            <ModuleTile
              module={m}
              index={i}
              row={row}
              coloris={coloris}
              onRemove={() => onRemoveModule(row, i)}
            />
          </div>
        ))}
        <DropZone row={row} index={modules.length} onDrop={onDrop} />
        <AddButton
          row={row}
          index={modules.length}
          hasSelection={!!selectedModule}
          onClick={() => onAddModule(row)}
          onDrop={onDrop}
        />
      </div>
    </div>
  );
}

// ─── Canvas principal ───────────────────────────────────────────

export function QuaiCanvas({
  modulesByRow,
  nbRangees,
  coloris,
  selectedModule,
  onAddModule,
  onRemoveModule,
  onInsertModule,
  onMoveModule,
}: QuaiCanvasProps) {
  // Compute max longueur across all active rows
  const longueurMax = Array.from({ length: nbRangees }, (_, i) => {
    const row = (i + 1) as ModuleRow;
    return (modulesByRow[row] ?? []).reduce((s, m) => s + m.spec.longueur, 0);
  }).reduce((a, b) => Math.max(a, b), 0);

  function handleDrop(row: ModuleRow, dropIndex: number, data: string) {
    try {
      const parsed = JSON.parse(data);

      if (parsed.type === "new") {
        const modules = modulesByRow[row] ?? [];
        const idx = dropIndex === -1 ? modules.length : dropIndex;
        onInsertModule(row, idx, parsed.ref);
      } else if (parsed.type === "reorder" && parsed.row === row) {
        const modules = modulesByRow[row] ?? [];
        const idx = dropIndex === -1 ? modules.length : dropIndex;
        if (parsed.index !== idx && parsed.index !== idx - 1) {
          onMoveModule(row, parsed.index, idx);
        }
      }
    } catch {
      // ignore invalid data
    }
  }

  // Noms des rangées : rang 1 = Voirie (près trottoir), les autres = Rang N
  const rowLabel = (row: ModuleRow) => row === 1 ? "Voirie" : `Rang ${row}`;

  // Trouver les rampes arrière (D-009a) dans le rang 1 pour les visualiser au-dessus
  const rampesArriere = (modulesByRow[1] ?? []).filter(
    (m) => m.spec.rampeType === "arriere"
  );

  return (
    <div className="space-y-3">
      {/* Rampes arrière (trottoir → quai) au-dessus du rang 1 */}
      {rampesArriere.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider w-20">
              Trottoir
            </span>
            <span className="text-xs text-gray-400">
              ↕ Rampes arrière PMR
            </span>
          </div>
          <div className="flex items-center gap-1 p-2 bg-amber-50 rounded-lg border border-amber-200 min-h-[40px]">
            {rampesArriere.map((m, i) => (
              <div
                key={`rampe-arr-${i}`}
                className="px-3 py-1.5 bg-amber-100 border border-amber-300 rounded text-[10px] font-mono text-amber-700"
              >
                {m.ref} — {m.spec.longueur}mm
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rang 1 (Voirie) toujours en haut, puis rang 2, 3 en dessous */}
      {Array.from({ length: nbRangees }, (_, i) => {
        const row = (i + 1) as ModuleRow; // rang 1 en haut, 2 en dessous, etc.
        const modules = modulesByRow[row] ?? [];
        const longueur = modules.reduce((s, m) => s + m.spec.longueur, 0);
        return (
          <RowCanvas
            key={row}
            label={rowLabel(row)}
            row={row}
            modules={modules}
            longueur={longueur}
            coloris={coloris}
            selectedModule={selectedModule}
            onAddModule={onAddModule}
            onRemoveModule={onRemoveModule}
            onDrop={handleDrop}
          />
        );
      })}

      {/* Cotation */}
      {longueurMax > 0 && (
        <div className="text-center pt-2 border-t border-gray-100">
          <span className="font-mono text-sm text-primary font-bold">
            {(longueurMax / 1000).toFixed(1)} m
          </span>
          <span className="text-xs text-gray-400 ml-2">
            ({longueurMax} mm) × {nbRangees} × 1 500 mm
          </span>
        </div>
      )}
    </div>
  );
}
