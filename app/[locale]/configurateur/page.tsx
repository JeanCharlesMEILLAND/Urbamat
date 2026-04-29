"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { useTranslations } from "next-intl";
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
  type EnvironmentConfig,
} from "@/lib/configurateur";
import { cn } from "@/lib/utils";

const QuaiView3D = lazy(() => import("@/components/configurateur/QuaiView3D").then((m) => ({ default: m.QuaiView3D })));

export default function ConfigurateurPage() {
  const t = useTranslations("configurateur");
  const [nbRangees, setNbRangees] = useState<NbRangees>(1);
  const [modulesByRow, setModulesByRow] = useState<Record<ModuleRow, PlacedModule[]>>({ 1: [], 2: [], 3: [], 4: [] });
  const [selectedModule, setSelectedModule] = useState<ModuleRef | null>(null);
  const [coloris, setColoris] = useState("granit-gris");
  const [showForm, setShowForm] = useState(false);
  const [view3D, setView3D] = useState(false);
  const [showShelter, setShowShelter] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [envConfig, setEnvConfig] = useState<EnvironmentConfig>({
    trottoir: 3.0, parking: 0, cyclable: 0, voie: 3.5,
  });

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
      // Rang 1 (trottoir)
      { ref: "D-009", rang: 1 },
      { ref: "D-004a", rang: 1 },
      { ref: "D-005", rang: 1 },
      { ref: "D-005", rang: 1 },
      { ref: "D-007a", rang: 1 },
      { ref: "D-005", rang: 1 },
      { ref: "D-005", rang: 1 },
      { ref: "D-003a", rang: 1 },
      // Rang 2 (chaussée)
      { ref: "D-004", rang: 2 },
      { ref: "D-002", rang: 2 },
      { ref: "D-002", rang: 2 },
      { ref: "D-007", rang: 2 },
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
                {t("titre")}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {t("sousTitre")}
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
                  {t("ajouterRang")}
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
                  {t("retirerRang", { rang: nbRangees })}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleLoadTemplate}>
                {t("chargerExemple")}
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw size={14} className="mr-1" />
                {t("reinitialiser")}
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
                />

                {/* Coloris */}
                <StepOptions coloris={coloris} onColorisChange={setColoris} />

                {/* Environnement */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-neutral-dark uppercase tracking-wider">
                    {t("environnement")}
                  </h3>
                  <div className="space-y-2">
                    {([
                      { key: "trottoir" as const, label: t("trottoir") },
                      { key: "parking" as const, label: t("parking") },
                      { key: "cyclable" as const, label: t("pisteCyclable") },
                      { key: "voie" as const, label: t("voieCirculation") },
                    ]).map((field) => (
                      <div key={field.key} className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 w-24 shrink-0">{field.label}</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={envConfig[field.key]}
                          onChange={(e) => setEnvConfig((prev) => ({ ...prev, [field.key]: parseFloat(e.target.value) || 0 }))}
                          className="w-16 px-2 py-1 text-xs font-mono border border-gray-300 rounded text-center focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                        <span className="text-[10px] text-gray-400">m</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* --- Canvas + BOM (centre + droite) --- */}
            <div className="lg:col-span-9 order-1 lg:order-2 space-y-6">

              {/* Canvas / 3D toggle */}
              <div className="bg-neutral-light rounded-xl p-4 lg:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-neutral-dark uppercase tracking-wider">
                    {view3D ? t("vue3D") : t("planQuai")}
                  </h2>
                  <div className="flex items-center gap-2">
                    {!view3D && (
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        {t("retirerModule")}
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
                        {t("chargement3D")}
                      </div>
                    }
                  >
                    <QuaiView3D
                      modulesByRow={modulesByRow}
                      nbRangees={nbRangees}
                      coloris={coloris}
                      showShelter={showShelter}
                      showLabels={showLabels}
                      envConfig={envConfig}
                      onEnvConfigChange={setEnvConfig}
                      onToggleLabels={() => setShowLabels((v) => !v)}
                      onToggleShelter={() => setShowShelter((v) => !v)}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        {t("orbiter")}
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
                          {showLabels ? t("masquerLabels") : t("afficherLabels")}
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
                          {showShelter ? t("masquerAbribus") : t("afficherAbribus")}
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
                  <p className="text-sm font-medium">{t("commentCaMarche")}</p>
                  <ol className="text-xs mt-2 space-y-1 text-gray-400">
                    <li><strong>1.</strong> {t("instructions.step1")}</li>
                    <li><strong>2.</strong> {t("instructions.step2")}</li>
                    <li><strong>3.</strong> {t("instructions.step3")}</li>
                    <li><strong>4.</strong> {t("instructions.step4")}</li>
                  </ol>
                  <Button variant="ghost" size="sm" onClick={handleLoadTemplate} className="mt-4">
                    {t("chargerExemple19m")}
                  </Button>
                </div>
              )}

              {/* BOM */}
              {allModules.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3">
                    <h2 className="text-sm font-bold text-neutral-dark uppercase tracking-wider mb-3">
                      {t("nomenclature")}
                    </h2>
                    <BomTable modules={allModules} />
                  </div>

                  {/* CTA */}
                  <div className="lg:col-span-2">
                    <div className="lg:sticky lg:top-24">
                      {showForm ? (
                        <div className="bg-neutral-light rounded-lg p-5 border border-gray-200">
                          <h3 className="font-bold text-neutral-dark mb-2">
                            {t("recevoirPlan")}
                          </h3>
                          <p className="text-xs text-gray-500 mb-4">
                            {t("nomenclatureEmail")}
                          </p>
                          <LeadForm compact onSuccess={() => setShowForm(false)} />
                        </div>
                      ) : (
                        <div className="bg-primary/5 rounded-lg p-5 border border-primary/20 text-center">
                          <h3 className="font-bold text-neutral-dark">
                            {t("configPrete")}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {t("recevoirNomenclature")}
                          </p>
                          <div className="space-y-2 mt-4">
                            <Button onClick={() => setShowForm(true)} className="w-full" size="sm">
                              <Send size={14} className="mr-2" />
                              {t("recevoirDevis")}
                            </Button>
                            <Button href="/contact" variant="outline" className="w-full" size="sm">
                              {t("nousContacter")}
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
