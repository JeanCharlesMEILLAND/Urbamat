"use client";

import { LONGUEURS_DISPONIBLES } from "@/lib/configurateur";

interface StepLongueurProps {
  longueur: number;
  onLongueurChange: (v: number) => void;
  rampeGauche: boolean;
  rampeDroite: boolean;
  onRampeGaucheChange: (v: boolean) => void;
  onRampeDroiteChange: (v: boolean) => void;
}

export function StepLongueur({
  longueur,
  onLongueurChange,
  rampeGauche,
  rampeDroite,
  onRampeGaucheChange,
  onRampeDroiteChange,
}: StepLongueurProps) {
  const index = LONGUEURS_DISPONIBLES.indexOf(longueur);
  const sliderIndex = index >= 0 ? index : 0;

  return (
    <div className="space-y-6">
      {/* Longueur */}
      <div>
        <label className="block text-sm font-semibold text-neutral-dark mb-2">
          Longueur du quai
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={LONGUEURS_DISPONIBLES.length - 1}
            value={sliderIndex}
            onChange={(e) => onLongueurChange(LONGUEURS_DISPONIBLES[Number(e.target.value)])}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="shrink-0 w-24 text-right">
            <span className="text-2xl font-bold font-mono text-primary">
              {(longueur / 1000).toFixed(1)}
            </span>
            <span className="text-sm text-gray-500 ml-1">m</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
          <span>6 m</span>
          <span>30 m</span>
        </div>
      </div>

      {/* Rampes */}
      <div>
        <label className="block text-sm font-semibold text-neutral-dark mb-3">
          Rampes d'accès PMR
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onRampeGaucheChange(!rampeGauche)}
            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
              rampeGauche
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <div className="text-xs text-gray-400 mb-1">Extrémité gauche</div>
            {rampeGauche ? "✓ Rampe incluse" : "Sans rampe"}
          </button>
          <button
            type="button"
            onClick={() => onRampeDroiteChange(!rampeDroite)}
            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
              rampeDroite
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <div className="text-xs text-gray-400 mb-1">Extrémité droite</div>
            {rampeDroite ? "✓ Rampe incluse" : "Sans rampe"}
          </button>
        </div>
      </div>
    </div>
  );
}
