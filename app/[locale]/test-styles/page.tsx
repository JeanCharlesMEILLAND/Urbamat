"use client";

import { useState } from "react";
import { Check, Info } from "lucide-react";
import { STYLE_VARIANTS, type StyleId } from "@/components/produit/StyleVariants";

const CONFIG_LABELS = {
  avancee: "Avancée de trottoir",
  avancee_velo: "Avancée + piste cyclable",
  ile: "Configuration en île",
  ile_velo: "Île + piste cyclable",
} as const;

export default function TestStylesPage() {
  const [selected, setSelected] = useState<StyleId | null>(null);
  const styleIds = Object.keys(STYLE_VARIANTS) as StyleId[];

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="mb-10 max-w-3xl">
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-dark mb-3">
            Atelier styles graphiques — schémas configurations
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            5 propositions visuelles pour les 4 schémas de configurations URBAQUAI.
            Compare-les côte à côte et clique sur <strong>« Choisir ce style »</strong> pour
            celui que tu veux. Je l&apos;applique ensuite à toutes les pages
            (<code className="text-xs bg-white px-1.5 py-0.5 rounded">/produit</code>,{" "}
            <code className="text-xs bg-white px-1.5 py-0.5 rounded">/configurations</code>,{" "}
            <code className="text-xs bg-white px-1.5 py-0.5 rounded">home</code>).
          </p>

          {selected && (
            <div className="mt-5 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
              <Check size={18} className="text-green-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-900">
                  Style sélectionné : {STYLE_VARIANTS[selected].name}
                </p>
                <p className="text-xs text-green-800">
                  Dis-moi <em>« applique le style {selected} »</em> dans le chat et je le déploie partout.
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
            <Info size={16} className="text-blue-700 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 leading-relaxed">
              Tu peux aussi me dire <em>« mélange A et B »</em> ou <em>« le style B mais sans le bus »</em>
              {" "}— je peux composer un mix de plusieurs propositions.
            </p>
          </div>
        </div>

        {/* Styles list */}
        <div className="space-y-12">
          {styleIds.map((id) => {
            const variant = STYLE_VARIANTS[id];
            const isSelected = selected === id;

            return (
              <section
                key={id}
                className={`bg-white rounded-2xl shadow-sm ring-1 transition-all ${
                  isSelected ? "ring-2 ring-green-500 shadow-md" : "ring-black/5"
                }`}
              >
                {/* Header style */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                        style={{ backgroundColor: variant.accent + "22", color: variant.accent }}
                      >
                        {variant.badge}
                      </span>
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
                        {variant.tagline}
                      </p>
                    </div>
                    <h2 className="text-xl font-bold text-neutral-dark">{variant.name}</h2>
                    <p className="text-sm text-gray-600 mt-1.5 max-w-3xl leading-relaxed">
                      {variant.description}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelected(id)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isSelected
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-neutral-dark text-white hover:bg-neutral-dark/90"
                    }`}
                  >
                    {isSelected ? "✓ Style sélectionné" : "Choisir ce style"}
                  </button>
                </div>

                {/* Grille des 4 configurations dans ce style */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(Object.keys(CONFIG_LABELS) as Array<keyof typeof CONFIG_LABELS>).map((cfgId) => {
                    const Diagram = variant.configs[cfgId];
                    return (
                      <figure key={cfgId} className="bg-gray-50 rounded-lg overflow-hidden ring-1 ring-black/5">
                        <div className="bg-white p-3">
                          <Diagram />
                        </div>
                        <figcaption className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs font-medium text-gray-700">
                          {CONFIG_LABELS[cfgId]}
                        </figcaption>
                      </figure>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer rappel */}
        <div className="mt-12 text-center text-xs text-gray-400">
          Page de comparaison interne — non liée depuis la nav. URL : /test-styles
        </div>
      </div>
    </div>
  );
}
