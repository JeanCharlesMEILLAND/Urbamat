"use client";

import { useState } from "react";
import { RealisationCard } from "./RealisationCard";
import { cn } from "@/lib/utils";
import type { Realisation } from "@/lib/types";

interface RealisationsGridProps {
  realisations: Realisation[];
}

export function RealisationsGrid({ realisations }: RealisationsGridProps) {
  const [filter, setFilter] = useState("all");

  // Extraire les départements uniques pour le filtre
  const departements = Array.from(new Set(realisations.map((r) => r.departement))).sort();

  const filtered = filter === "all"
    ? realisations
    : realisations.filter((r) => r.departement === filter);

  return (
    <div>
      {/* Filtres par département */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-4 py-2 text-sm rounded-full border transition-colors",
            filter === "all"
              ? "bg-primary text-white border-primary"
              : "bg-white text-gray-600 border-gray-200 hover:border-primary/30"
          )}
        >
          Tous ({realisations.length})
        </button>
        {departements.map((dep) => (
          <button
            key={dep}
            onClick={() => setFilter(dep)}
            className={cn(
              "px-4 py-2 text-sm rounded-full border transition-colors",
              filter === dep
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary/30"
            )}
          >
            {dep}
          </button>
        ))}
      </div>

      {/* Grille */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((real) => (
            <RealisationCard key={real.id} realisation={real} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>Aucune réalisation trouvée pour ce filtre.</p>
        </div>
      )}
    </div>
  );
}
