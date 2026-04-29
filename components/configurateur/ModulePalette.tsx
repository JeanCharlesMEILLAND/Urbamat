"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MODULE_CATALOG, type ModuleRef } from "@/lib/configurateur";
import { cn } from "@/lib/utils";

const ModuleViewer = dynamic(
  () => import("@/components/preview/ModuleViewer").then((m) => m.ModuleViewer),
  { ssr: false }
);

interface ModulePaletteProps {
  selectedModule: ModuleRef | null;
  onSelect: (ref: ModuleRef) => void;
  coloris?: string;
}

const ALL_MODULES: ModuleRef[] = [
  "D-004", "D-004a",
  "D-005", "D-002", "D-006",
  "D-007", "D-007a", "D-008", "D-008a",
  "D-003", "D-003a",
  "D-009",
  "VIDE",
];

const ROLE_COLORS: Record<string, string> = {
  rampe: "border-amber-300 hover:border-amber-400",
  lateral: "border-blue-200 hover:border-blue-300",
  central: "border-gray-200 hover:border-gray-300",
  jonction: "border-purple-200 hover:border-purple-300",
  fin: "border-emerald-200 hover:border-emerald-300",
  vide: "border-dashed border-gray-200",
};

const ROLE_COLORS_SELECTED: Record<string, string> = {
  rampe: "border-amber-500 ring-2 ring-amber-400",
  lateral: "border-blue-500 ring-2 ring-blue-400",
  central: "border-primary ring-2 ring-primary",
  jonction: "border-purple-500 ring-2 ring-purple-400",
  fin: "border-emerald-500 ring-2 ring-emerald-400",
  vide: "border-dashed border-gray-500 ring-2 ring-gray-400",
};

/**
 * Carte de module avec preview 3D : le viewer ne mount que quand l'élément
 * entre dans le viewport (IntersectionObserver) pour ne pas créer 14 contextes
 * WebGL d'un coup au chargement de la page.
 */
function ModuleThumbCard({
  refId,
  isSelected,
  onSelect,
  coloris,
}: {
  refId: ModuleRef;
  isSelected: boolean;
  onSelect: (ref: ModuleRef) => void;
  coloris: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isRotateMode, setIsRotateMode] = useState(false);
  const spec = MODULE_CATALOG[refId];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const colorClass = isSelected
    ? ROLE_COLORS_SELECTED[spec.role]
    : ROLE_COLORS[spec.role];

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ type: "new", ref: refId })
    );
    e.dataTransfer.effectAllowed = "all";
    onSelect(refId);
  };

  return (
    <div
      ref={containerRef}
      onClick={() => onSelect(refId)}
      role="button"
      tabIndex={0}
      draggable={!isRotateMode}
      onDragStart={isRotateMode ? undefined : handleDragStart}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(refId);
      }}
      className={cn(
        "group bg-white rounded-lg border-2 overflow-hidden text-left transition-all hover:shadow-md flex flex-col",
        isRotateMode ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        colorClass
      )}
    >
      {/* Zone 3D : par défaut non-interactive (clic = sélection).
         Bouton 🔄 en haut à droite pour activer la rotation libre. */}
      <div className="aspect-[4/3] bg-gradient-to-b from-gray-50 to-gray-100 relative">
        {isVisible && refId !== "VIDE" ? (
          <div
            className={cn(
              "absolute inset-0",
              isRotateMode ? "" : "pointer-events-none"
            )}
          >
            <ModuleViewer
              moduleRef={refId}
              coloris={coloris as never}
              autoRotate={!isRotateMode}
              hideBadge
              enableZoom={false}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">
            {refId === "VIDE" ? "—" : "..."}
          </div>
        )}
        {/* Toggle rotation mode */}
        {refId !== "VIDE" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsRotateMode((v) => !v);
            }}
            title={isRotateMode ? "Sortir mode rotation" : "Tourner le module"}
            className={cn(
              "absolute top-1 right-1 z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-sm ring-1 ring-black/5 transition-colors",
              isRotateMode
                ? "bg-primary text-white"
                : "bg-white/95 text-gray-500 hover:bg-white hover:text-primary"
            )}
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-3-6.7M21 4v5h-5" />
            </svg>
          </button>
        )}
      </div>
      {/* Bandeau infos */}
      <div className="px-2.5 py-2 border-t border-gray-100">
        <div className="font-mono text-[11px] font-bold text-neutral-dark leading-none">
          {refId}
        </div>
        <div className="text-[10px] text-gray-500 mt-1 leading-tight line-clamp-1">
          {spec.nom}
        </div>
        <div className="text-[9px] text-gray-400 mt-0.5 font-mono">
          {spec.longueur}×{spec.largeur}mm
        </div>
      </div>
    </div>
  );
}

export function ModulePalette({
  selectedModule,
  onSelect,
  coloris = "granit-gris",
}: ModulePaletteProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-neutral-dark uppercase tracking-wider">
        Modules
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {ALL_MODULES.map((ref) => (
          <ModuleThumbCard
            key={ref}
            refId={ref}
            isSelected={selectedModule === ref}
            onSelect={onSelect}
            coloris={coloris}
          />
        ))}
      </div>

      {selectedModule && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-primary font-medium">
            <span className="font-mono font-bold">{selectedModule}</span>{" "}
            sélectionné
          </p>
          <p className="text-[10px] text-gray-500 mt-1 leading-snug">
            Glissez ou cliquez <strong>+</strong> sur le rang voulu
          </p>
        </div>
      )}
    </div>
  );
}
