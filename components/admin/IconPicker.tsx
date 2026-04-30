"use client";

import { useState, useMemo } from "react";
import * as Icons from "lucide-react";
import { ChevronDown, Search, X } from "lucide-react";

// Liste curée d'icônes Lucide pertinentes pour le site URBAQUAI (mobilité,
// accessibilité, certification, environnement, etc.). Le client n'a pas besoin
// des 1500 icônes du catalogue — juste de celles qui ont du sens ici.
const CURATED_ICONS = [
  // Mobilité / transport
  "Bus", "Train", "Truck", "Car", "Bike", "Plane", "Ship", "MapPin", "Map", "Navigation", "Compass", "Route",
  // Accessibilité / santé
  "Accessibility", "PersonStanding", "Users", "User", "HeartHandshake", "HandHeart",
  // Certifications / sécurité
  "ShieldCheck", "Shield", "BadgeCheck", "Award", "CheckCircle2", "Check", "Star", "Trophy",
  // Environnement / durabilité
  "Recycle", "Leaf", "Sun", "Droplets", "TreePine", "Sprout", "Wind",
  // Construction / produit
  "Wrench", "Hammer", "HardHat", "Construction", "Layers", "Package", "Boxes", "Building2", "Factory", "Cog",
  // Vitesse / efficacité
  "Zap", "Timer", "Clock", "Gauge", "Rocket", "TrendingUp", "Target",
  // Documents / réglementation
  "FileText", "BookOpen", "Scale", "Gavel", "ClipboardCheck", "FileCheck", "Newspaper",
  // Communication / contact
  "Mail", "Phone", "MessageSquare", "Send",
  // Misc utile
  "Sparkles", "Lightbulb", "Eye", "AlertTriangle", "Info", "HelpCircle",
] as const;

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  /** Icône affichée si `value` est vide ou inconnue. */
  fallback?: string;
}

function lucideByName(name: string): React.ComponentType<{ size?: number; className?: string }> | null {
  const lib = Icons as unknown as Record<
    string,
    React.ComponentType<{ size?: number; className?: string }>
  >;
  return lib[name] || null;
}

export function IconPicker({ value, onChange, fallback = "Sparkles" }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const Selected = lucideByName(value) || lucideByName(fallback) || Icons.Sparkles;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CURATED_ICONS;
    return CURATED_ICONS.filter((n) => n.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-primary/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg bg-accent-50 text-accent flex items-center justify-center shrink-0">
            <Selected size={18} />
          </span>
          <span className="text-sm font-mono text-gray-600">{value || fallback}</span>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <div className="relative mb-2.5">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une icône…"
              className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
            {filtered.map((name) => {
              const Icon = lucideByName(name);
              if (!Icon) return null;
              const isActive = value === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                    setQuery("");
                  }}
                  title={name}
                  className={`aspect-square rounded-md flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <Icon size={16} />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-8 text-center text-xs text-gray-400 py-4">
                Aucune icône trouvée pour « {query} ».
              </p>
            )}
          </div>

          <p className="mt-2 text-[10px] text-gray-400 leading-snug">
            Catalogue Lucide curé — {CURATED_ICONS.length} icônes pertinentes pour URBAQUAI.
          </p>
        </div>
      )}
    </div>
  );
}
