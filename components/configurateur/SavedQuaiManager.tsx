"use client";

import { useEffect, useRef, useState } from "react";
import { Save, FolderOpen, Trash2, ClipboardCopy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  MODULE_CATALOG,
  getModuleXLength,
  type PlacedModule,
  type ModuleRow,
  type NbRangees,
  type EnvironmentConfig,
} from "@/lib/configurateur";

const STORAGE_KEY = "urbaquai_saved_quais_v1";

export type SavedQuai = {
  id: string;
  name: string;
  date: string;
  nbRangees: NbRangees;
  modulesByRow: Record<ModuleRow, PlacedModule[]>;
  coloris: string;
  envConfig: EnvironmentConfig;
};

interface SavedQuaiManagerProps {
  nbRangees: NbRangees;
  modulesByRow: Record<ModuleRow, PlacedModule[]>;
  coloris: string;
  envConfig: EnvironmentConfig;
  onLoad: (s: SavedQuai) => void;
}

function loadAll(): SavedQuai[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SavedQuai[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function persistAll(list: SavedQuai[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Re-hydrate les `spec` depuis le catalogue actuel et recalcule les positions X
 * (au cas où une dimension catalogue aurait changé depuis la sauvegarde). */
function rehydrate(s: SavedQuai): SavedQuai {
  const rehydratedRows = {} as Record<ModuleRow, PlacedModule[]>;
  ([1, 2, 3, 4] as ModuleRow[]).forEach((r) => {
    let x = 0;
    rehydratedRows[r] = (s.modulesByRow[r] ?? []).map((m) => {
      const spec = MODULE_CATALOG[m.ref];
      const placed: PlacedModule = { ...m, spec, x };
      x += getModuleXLength(m.ref);
      return placed;
    });
  });
  return { ...s, modulesByRow: rehydratedRows };
}

export function SavedQuaiManager({
  nbRangees,
  modulesByRow,
  coloris,
  envConfig,
  onLoad,
}: SavedQuaiManagerProps) {
  const [list, setList] = useState<SavedQuai[]>([]);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setList(loadAll());
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const totalModules =
    modulesByRow[1].length +
    modulesByRow[2].length +
    modulesByRow[3].length +
    modulesByRow[4].length;

  function handleSave() {
    if (totalModules === 0) {
      alert("Quai vide : ajoute au moins un module avant de sauvegarder.");
      return;
    }
    const defaultName = `Mon quai du ${new Date().toLocaleDateString("fr-FR")}`;
    const name = window.prompt("Nom de la sauvegarde :", defaultName);
    if (!name) return;

    const entry: SavedQuai = {
      id: crypto.randomUUID(),
      name,
      date: new Date().toISOString(),
      nbRangees,
      modulesByRow,
      coloris,
      envConfig,
    };
    const next = [entry, ...list];
    setList(next);
    persistAll(next);
  }

  function handleLoad(id: string) {
    const s = list.find((x) => x.id === id);
    if (!s) return;
    onLoad(rehydrate(s));
    setOpen(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Supprimer cette sauvegarde ?")) return;
    const next = list.filter((x) => x.id !== id);
    setList(next);
    persistAll(next);
  }

  async function handleCopyJson(s: SavedQuai) {
    const json = JSON.stringify(s, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setCopied(s.id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      alert("Impossible de copier — voici le JSON :\n\n" + json);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          title="Sauvegarder le quai actuel dans ce navigateur"
        >
          <Save size={14} className="mr-1" />
          Sauvegarder
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          title="Ouvrir la liste des sauvegardes"
        >
          <FolderOpen size={14} className="mr-1" />
          Mes sauvegardes
          {list.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded bg-accent/15 text-accent text-[11px] font-mono">
              {list.length}
            </span>
          )}
        </Button>
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] z-50 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-neutral-light">
            <p className="text-xs font-bold text-neutral-dark uppercase tracking-wider">
              Mes sauvegardes
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Stockées localement dans ce navigateur
            </p>
          </div>

          {list.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Aucune sauvegarde pour le moment.
            </div>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto">
              {list.map((s) => {
                const total =
                  s.modulesByRow[1].length +
                  s.modulesByRow[2].length +
                  s.modulesByRow[3].length +
                  s.modulesByRow[4].length;
                return (
                  <li
                    key={s.id}
                    className="px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-neutral-light/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => handleLoad(s.id)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <p className="text-sm font-medium text-neutral-dark truncate">
                          {s.name}
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                          {s.nbRangees} rang{s.nbRangees > 1 ? "s" : ""} · {total} module
                          {total > 1 ? "s" : ""} ·{" "}
                          {new Date(s.date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </button>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopyJson(s)}
                          className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/5 rounded"
                          title="Copier en JSON (pour intégration template)"
                        >
                          {copied === s.id ? (
                            <Check size={13} />
                          ) : (
                            <ClipboardCopy size={13} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
