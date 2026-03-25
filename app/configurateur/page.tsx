"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { RotateCcw, Send, Download, Box, Layout, Tag, EyeOff } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ModulePalette } from "@/components/configurateur/ModulePalette";
import { QuaiCanvas } from "@/components/configurateur/QuaiCanvas";
import { BomTable } from "@/components/configurateur/BomTable";
import { StepOptions } from "@/components/configurateur/StepOptions";
import { LeadForm } from "@/components/LeadForm";
import {
  MODULE_CATALOG,
  type PlacedModule,
  type ModuleRef,
  type ModuleRow,
  type NbRangees,
} from "@/lib/configurateur";
import { cn } from "@/lib/utils";

const QuaiView3D = lazy(() => import("@/components/configurateur/QuaiView3D").then((m) => ({ default: m.QuaiView3D })));

export default function ConfigurateurPage() {
  const [nbRangees, setNbRangees] = useState<NbRangees>(1);
  const [modulesByRow, setModulesByRow] = useState<Record<ModuleRow, PlacedModule[]>>({ 1: [], 2: [], 3: [], 4: [] });
  const [selectedModule, setSelectedModule] = useState<ModuleRef | null>(null);
  const [activeRow, setActiveRow] = useState<ModuleRow>(1);
  const [coloris, setColoris] = useState("granit-gris");
  const [showForm, setShowForm] = useState(false);
  const [view3D, setView3D] = useState(false);
  const [showShelter, setShowShelter] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const allModules = [...modulesByRow[1], ...modulesByRow[2], ...modulesByRow[3], ...modulesByRow[4]];

  // ─── Generic row updater ───────────────────────────────────────
  const updateRow = useCallback(
    (row: ModuleRow, updater: (prev: PlacedModule[]) => PlacedModule[]) => {
      setModulesByRow((prev) => ({ ...prev, [row]: updater(prev[row]) }));
    },
    [],
  );

  // ─── Recalculate x positions after any mutation ────────────────
  function recalcX(modules: PlacedModule[]): PlacedModule[] {
    let x = 0;
    return modules.map((m) => {
      const updated = { ...m, x };
      x += m.spec.longueur;
      return updated;
    });
  }

  // ─── Handlers ──────────────────────────────────────────────────

  const handleAddModule = useCallback(
    (row: ModuleRow) => {
      if (!selectedModule) return;

      const spec = MODULE_CATALOG[selectedModule];

      updateRow(row, (prev) => {
        const x = prev.reduce((sum, m) => sum + m.spec.longueur, 0);
        const newModule: PlacedModule = { ref: selectedModule, spec, x, rang: row };
        return [...prev, newModule];
      });
    },
    [selectedModule, updateRow],
  );

  const handleRemoveModule = useCallback(
    (row: ModuleRow, index: number) => {
      updateRow(row, (prev) => {
        const next = prev.filter((_, i) => i !== index);
        return recalcX(next);
      });
    },
    [updateRow],
  );

  const handleInsertModule = useCallback(
    (row: ModuleRow, index: number, ref: ModuleRef) => {
      const spec = MODULE_CATALOG[ref];
      updateRow(row, (prev) => {
        const next = [...prev];
        next.splice(index, 0, { ref, spec, x: 0, rang: row });
        return recalcX(next);
      });
    },
    [updateRow],
  );

  const handleMoveModule = useCallback(
    (row: ModuleRow, fromIndex: number, toIndex: number) => {
      updateRow(row, (prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        const adjustedTo = fromIndex < toIndex ? toIndex - 1 : toIndex;
        next.splice(adjustedTo, 0, moved);
        return recalcX(next);
      });
    },
    [updateRow],
  );

  function handleReset() {
    setModulesByRow({ 1: [], 2: [], 3: [], 4: [] });
    setSelectedModule(null);
  }

  // ─── Template : plan de référence 19 m ─────────────────────────
  function handleLoadTemplate() {
    const template: { ref: ModuleRef; rang: ModuleRow }[] = [
      // Rang 1 (Voirie — côté trottoir)
      { ref: "D-009", rang: 1 },
      { ref: "D-004e", rang: 1 },
      { ref: "D-005", rang: 1 },
      { ref: "D-006", rang: 1 },
      { ref: "D-007e", rang: 1 },
      { ref: "D-005", rang: 1 },
      { ref: "D-005", rang: 1 },
      { ref: "D-003e", rang: 1 },
      // Rang 2 (côté bus)
      { ref: "D-009", rang: 2 },
      { ref: "D-012", rang: 2 },
      { ref: "D-002", rang: 2 },
      { ref: "D-002", rang: 2 },
      { ref: "D-037", rang: 2 },
      { ref: "D-002", rang: 2 },
      { ref: "D-002", rang: 2 },
      { ref: "D-003", rang: 2 },
    ];

    const rows: Record<ModuleRow, PlacedModule[]> = { 1: [], 2: [], 3: [], 4: [] };
    const xByRow: Record<ModuleRow, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };

    for (const t of template) {
      const spec = MODULE_CATALOG[t.ref];
      rows[t.rang].push({ ref: t.ref, spec, x: xByRow[t.rang], rang: t.rang });
      xByRow[t.rang] += spec.longueur;
    }

    setModulesByRow(rows);
    setNbRangees(2);
  }

  return (
    <>
      {/* Header */}
      <section className="bg-neutral-light py-6 lg:py-10 border-b border-gray-200">
        <Container>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark">
                Configurateur URBAQUAI
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Construisez votre quai module par module — cliquez, placez, visualisez.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Ajouter / retirer un rang */}
              {nbRangees < 4 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNbRangees((nbRangees + 1) as NbRangees)}
                >
                  + Ajouter un rang
                </Button>
              )}
              {nbRangees > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setModulesByRow((prev) => ({ ...prev, [nbRangees]: [] }));
                    setNbRangees((nbRangees - 1) as NbRangees);
                  }}
                >
                  − Retirer rang {nbRangees}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleLoadTemplate}>
                Charger un exemple
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw size={14} className="mr-1" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-6 lg:py-8 bg-white min-h-[70vh]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* --- Palette modules (gauche) --- */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24 space-y-6">
                <ModulePalette
                  selectedModule={selectedModule}
                  onSelect={setSelectedModule}
                  activeRow={activeRow}
                  onRowChange={setActiveRow}
                  nbRangees={nbRangees}
                />

                {/* Coloris */}
                <StepOptions coloris={coloris} onColorisChange={setColoris} />
              </div>
            </div>

            {/* --- Canvas + BOM (centre + droite) --- */}
            <div className="lg:col-span-9 order-1 lg:order-2 space-y-6">

              {/* Canvas / 3D toggle */}
              <div className="bg-neutral-light rounded-xl p-4 lg:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-neutral-dark uppercase tracking-wider">
                    {view3D ? "Vue 3D" : "Plan du quai"}
                  </h2>
                  <div className="flex items-center gap-2">
                    {!view3D && (
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        Cliquez sur un module posé pour le retirer
                      </span>
                    )}
                    {/* Toggle 2D / 3D */}
                    <div className="flex bg-white rounded-lg border border-gray-200 p-0.5">
                      <button
                        onClick={() => setView3D(false)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                          !view3D ? "bg-primary text-white" : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        <Layout size={12} />
                        2D
                      </button>
                      <button
                        onClick={() => setView3D(true)}
                        disabled={allModules.length === 0}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                          view3D ? "bg-primary text-white" : "text-gray-500 hover:text-gray-700",
                          allModules.length === 0 && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        <Box size={12} />
                        3D
                      </button>
                    </div>
                  </div>
                </div>

                {view3D ? (
                  <Suspense
                    fallback={
                      <div className="w-full h-[450px] bg-neutral-dark/5 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        Chargement de la vue 3D...
                      </div>
                    }
                  >
                    <QuaiView3D
                      modulesByRow={modulesByRow}
                      nbRangees={nbRangees}
                      coloris={coloris}
                      showShelter={showShelter}
                      showLabels={showLabels}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        Clic gauche + glisser pour orbiter · Molette pour zoomer
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowLabels(!showLabels)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                            showLabels
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-gray-100 border-gray-200 text-gray-500"
                          )}
                        >
                          {showLabels ? <Tag size={12} /> : <EyeOff size={12} />}
                          {showLabels ? "Masquer les labels" : "Afficher les labels"}
                        </button>
                        <button
                          onClick={() => setShowShelter(!showShelter)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                            showShelter
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-gray-100 border-gray-200 text-gray-500"
                          )}
                        >
                          {showShelter ? "Masquer l'abribus" : "Afficher l'abribus"}
                        </button>
                      </div>
                    </div>
                  </Suspense>
                ) : (
                  <QuaiCanvas
                    modulesByRow={modulesByRow}
                    nbRangees={nbRangees}
                    coloris={coloris}
                    selectedModule={selectedModule}
                    onAddModule={handleAddModule}
                    onRemoveModule={handleRemoveModule}
                    onInsertModule={handleInsertModule}
                    onMoveModule={handleMoveModule}
                  />
                )}
              </div>

              {/* Mode d'emploi si vide */}
              {allModules.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-3">&#x1f9f1;</div>
                  <p className="text-sm font-medium">Comment ça marche ?</p>
                  <ol className="text-xs mt-2 space-y-1 text-gray-400">
                    <li><strong>1.</strong> Sélectionnez une rangée dans la palette</li>
                    <li><strong>2.</strong> Cliquez sur un module pour le sélectionner</li>
                    <li><strong>3.</strong> Cliquez sur <strong>+</strong> dans le plan pour le placer</li>
                    <li><strong>4.</strong> Cliquez sur un module posé pour le retirer</li>
                  </ol>
                  <Button variant="ghost" size="sm" onClick={handleLoadTemplate} className="mt-4">
                    Ou charger un exemple de quai 19 m
                  </Button>
                </div>
              )}

              {/* BOM */}
              {allModules.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3">
                    <h2 className="text-sm font-bold text-neutral-dark uppercase tracking-wider mb-3">
                      Nomenclature
                    </h2>
                    <BomTable modules={allModules} />
                  </div>

                  {/* CTA */}
                  <div className="lg:col-span-2">
                    <div className="lg:sticky lg:top-24">
                      {showForm ? (
                        <div className="bg-neutral-light rounded-lg p-5 border border-gray-200">
                          <h3 className="font-bold text-neutral-dark mb-2">
                            Recevez votre plan
                          </h3>
                          <p className="text-xs text-gray-500 mb-4">
                            Nomenclature + chiffrage personnalisé par email.
                          </p>
                          <LeadForm compact onSuccess={() => setShowForm(false)} />
                        </div>
                      ) : (
                        <div className="bg-primary/5 rounded-lg p-5 border border-primary/20 text-center">
                          <h3 className="font-bold text-neutral-dark">
                            Configuration prête ?
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Recevez la nomenclature et un chiffrage.
                          </p>
                          <div className="space-y-2 mt-4">
                            <Button onClick={() => setShowForm(true)} className="w-full" size="sm">
                              <Send size={14} className="mr-2" />
                              Recevoir le devis
                            </Button>
                            <Button href="/contact" variant="outline" className="w-full" size="sm">
                              Nous contacter
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
