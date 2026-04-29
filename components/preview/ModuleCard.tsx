"use client";

import { ModuleViewer } from "./ModuleViewer";
import type { ModuleRef } from "@/lib/configurateur";

export function ModuleCard({ moduleRef, label }: { moduleRef: string; label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
      <div className="aspect-[4/3] relative">
        <ModuleViewer moduleRef={moduleRef as ModuleRef} coloris="granit-gris" />
      </div>
      <div className="px-4 py-3 border-t border-surface-200">
        <p className="text-xs font-mono text-gray-700">{label}</p>
      </div>
    </div>
  );
}
