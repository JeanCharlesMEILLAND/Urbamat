"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { RotateCcw, Send, Download, Box, Layout } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ModulePalette } from "@/components/configurateur/ModulePalette";
import { QuaiCanvas } from "@/components/configurateur/QuaiCanvas";
import { BomTable } from "@/components/configurateur/BomTable";
import { StepOptions } from "@/components/configurateur/StepOptions";
import { LeadForm } from "@/components/LeadForm";
import { MODULE_CATALOG, type PlacedModule, type ModuleRef, type ModuleRow } from "@/lib/configurateur";
import { cn } from "@/lib/utils";

const QuaiView3D = lazy(() => import("@/components/configurateur/QuaiView3D").then((m) => ({ default: m.QuaiView3D })));

export default function ConfigurateurPage() {
  const [modulesHaut, setModulesHaut] = useState<PlacedModule[]>([]);
  const [modulesBas, setModulesBas] = useState<PlacedModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleRef | null>(null);
  const [activeRow, setActiveRow] = useState<ModuleRow>("haut");
  const [coloris, setColoris] = useState("granit-gris");
  const [showForm, setShowForm] = useState(false);
  const [view3D, setView3D] = useState(false);
  const [showShelter, setShowShelter] = useState(true);

  const allModules = [...modulesHaut, ...modulesBas];

  const handleAddModule = useCallback((row: ModuleRow) => {
    if (!selectedModule) return;

    const spec = MODULE_CATALOG[selectedModule];
    // Vérifier que le module est compatible avec la rangée
    if (spec.rang !== row) {
      alert(`Le module ${selectedModule} est pour la rangée ${spec.rang === "haut" ? "voirie" : "trottoir"}`);
      return;
    }

    const currentModules = row === "haut" ? modulesHaut : modulesBas;
    const x = currentModules.reduce((sum, m) => sum + m.spec.longueur, 0);

    const newModule: PlacedModule = { ref: selectedModule, spec, x, rang: row };

    if (row === "haut") {
      setModulesHaut((prev) => [...prev, newModule]);
    } else {
      setModulesBas((prev) => [...prev, newModule]);
    }
  }, [selectedModule, modulesHaut, modulesBas]);

  const handleRemoveModule = useCallback((row: ModuleRow, index: number) => {
    const setter = row === "haut" ? setModulesHaut : setModulesBas;
    setter((prev) => {
      const next = prev.filter((_, i) => i !== index);
      let x = 0;
      return next.map((m) => {
        const updated = { ...m, x };
        x += m.spec.longueur;
        return updated;
      });
    });
  }, []);

  const handleInsertModule = useCallback((row: ModuleRow, index: number, ref: ModuleRef) => {
    const spec = MODULE_CATALOG[ref];
    const setter = row === "haut" ? setModulesHaut : setModulesBas;
    setter((prev) => {
      const next = [...prev];
      next.splice(index, 0, { ref, spec, x: 0, rang: row });
      let x = 0;
      return next.map((m) => {
        const updated = { ...m, x };
        x += m.spec.longueur;
        return updated;
      });
    });
  }, []);

  const handleMoveModule = useCallback((row: ModuleRow, fromIndex: number, toIndex: number) => {
    const setter = row === "haut" ? setModulesHaut : setModulesBas;
    setter((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      const adjustedTo = fromIndex < toIndex ? toIndex - 1 : toIndex;
      next.splice(adjustedTo, 0, moved);
      let x = 0;
      return next.map((m) => {
        const updated = { ...m, x };
        x += m.spec.longueur;
        return updated;
      });
    });
  }, []);

  function handleReset() {
    setModulesHaut([]);
    setModulesBas([]);
    setSelectedModule(null);
  }

  // Template : charger le plan de l'image de référence (19m)
  function handleLoadTemplate() {
    const template: { ref: ModuleRef; rang: ModuleRow }[] = [
      // Rangée haute
      { ref: "D-009", rang: "haut" },
      { ref: "D-004e", rang: "haut" },
      { ref: "D-005", rang: "haut" },
      { ref: "D-006", rang: "haut" },
      { ref: "D-007e", rang: "haut" },
      { ref: "D-005", rang: "haut" },
      { ref: "D-005", rang: "haut" },
      { ref: "D-003e", rang: "haut" },
      // Rangée basse
      { ref: "D-009a", rang: "bas" },
      { ref: "D-012", rang: "bas" },
      { ref: "D-002", rang: "bas" },
      { ref: "D-002", rang: "bas" },
      { ref: "D-037", rang: "bas" },
      { ref: "D-002", rang: "bas" },
      { ref: "D-002", rang: "bas" },
      { ref: "D-003", rang: "bas" },
    ];

    const haut: PlacedModule[] = [];
    const bas: PlacedModule[] = [];
    let xH = 0, xB = 0;

    for (const t of template) {
      const spec = MODULE_CATALOG[t.ref];
      if (t.rang === "haut") {
        haut.push({ ref: t.ref, spec, x: xH, rang: "haut" });
        xH += spec.longueur;
      } else {
        bas.push({ ref: t.ref, spec, x: xB, rang: "bas" });
        xB += spec.longueur;
      }
    }

    setModulesHaut(haut);
    setModulesBas(bas);
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

            {/* ─── Palette modules (gauche) ─── */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24 space-y-6">
                <ModulePalette
                  selectedModule={selectedModule}
                  onSelect={setSelectedModule}
                  activeRow={activeRow}
                  onRowChange={setActiveRow}
                />

                {/* Coloris */}
                <StepOptions coloris={coloris} onColorisChange={setColoris} />
              </div>
            </div>

            {/* ─── Canvas + BOM (centre + droite) ─── */}
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
                      modulesHaut={modulesHaut}
                      modulesBas={modulesBas}
                      coloris={coloris}
                      showShelter={showShelter}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        Clic gauche + glisser pour orbiter · Molette pour zoomer
                      </p>
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
                  </Suspense>
                ) : (
                  <QuaiCanvas
                    modulesHaut={modulesHaut}
                    modulesBas={modulesBas}
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
                  <div className="text-4xl mb-3">🧱</div>
                  <p className="text-sm font-medium">Comment ça marche ?</p>
                  <ol className="text-xs mt-2 space-y-1 text-gray-400">
                    <li><strong>1.</strong> Sélectionnez une rangée (voirie ou trottoir) dans la palette</li>
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
