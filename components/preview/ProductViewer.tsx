"use client";

import { useState } from "react";
import { ObjViewer } from "./ObjViewer";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  label: string;
}

export function ProductViewer({ modules }: { modules: Module[] }) {
  const [selected, setSelected] = useState<string>(modules[0]?.id ?? "");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <aside className="lg:col-span-3">
        <div className="bg-white rounded-2xl border border-surface-200 p-3 max-h-[70vh] overflow-y-auto">
          <ul className="space-y-1">
            {modules.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelected(m.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    selected === m.id
                      ? "bg-accent text-white font-semibold"
                      : "text-neutral-dark hover:bg-accent-50"
                  )}
                >
                  {m.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="lg:col-span-9">
        <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-surface-200 bg-surface relative">
          {selected && (
            <ObjViewer key={selected} url={`/models/${selected}.obj`} />
          )}
          <div className="absolute top-3 left-4 text-xs font-mono text-gray-500 bg-white/80 px-2 py-1 rounded">
            {selected}
          </div>
        </div>
      </div>
    </div>
  );
}
