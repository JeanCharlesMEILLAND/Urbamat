"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { COLORIS, MODULE_CATALOG, type ModuleRef } from "@/lib/configurateur";
import { cn } from "@/lib/utils";
import type { ColorisId } from "@/components/preview/ModuleViewer";

const ModuleViewer = dynamic(
  () => import("@/components/preview/ModuleViewer").then((m) => m.ModuleViewer),
  { ssr: false }
);

const REFS = (Object.keys(MODULE_CATALOG) as ModuleRef[]).filter((r) => r !== "VIDE");

export default function TestModulePage() {
  const [moduleRef, setModuleRef] = useState<ModuleRef>("D-009");
  const [coloris, setColoris] = useState<ColorisId>("granit-gris");
  const spec = MODULE_CATALOG[moduleRef];

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-neutral-dark mb-1">
          {spec.nom}
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          <span className="font-mono">{spec.ref}</span> — {spec.longueur} × {spec.largeur} × {spec.hauteur} mm — {spec.poids} kg — rôle : {spec.role}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-surface-200 p-3 max-h-[70vh] overflow-y-auto">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 px-3 mb-2">Module</h3>
              <ul className="space-y-1">
                {REFS.map((r) => (
                  <li key={r}>
                    <button
                      type="button"
                      onClick={() => setModuleRef(r)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        moduleRef === r
                          ? "bg-accent text-white font-semibold"
                          : "text-neutral-dark hover:bg-accent-50"
                      )}
                    >
                      <span className="font-mono">{r}</span>
                      <span className="block text-xs opacity-70">{MODULE_CATALOG[r].nom}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-9">
            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-white border border-surface-200">
              <ModuleViewer key={moduleRef + coloris} moduleRef={moduleRef} coloris={coloris} />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <span className="text-xs uppercase tracking-wider text-gray-500 mr-2">Coloris</span>
              {COLORIS.map((c) => {
                const isActive = coloris === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColoris(c.id as ColorisId)}
                    className={cn(
                      "flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border transition-all",
                      isActive
                        ? "border-accent bg-accent-50"
                        : "border-surface-200 hover:border-accent/50 bg-white"
                    )}
                  >
                    <span
                      className="w-6 h-6 rounded-full border border-black/10"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className={cn(
                      "text-xs font-medium",
                      isActive ? "text-accent" : "text-neutral-dark"
                    )}>
                      {c.nom}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
