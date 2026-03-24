"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Loader2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface StatRow {
  id: string;
  label: string;
  valeur: string;
  ordre: number;
  isNew?: boolean;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function addStat() {
    setStats((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        label: "",
        valeur: "",
        ordre: prev.length + 1,
        isNew: true,
      },
    ]);
  }

  function updateStat(index: number, field: keyof StatRow, value: string | number) {
    setStats((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function removeStat(index: number) {
    setStats((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      // Create new stats
      const newStats = stats.filter((s) => s.isNew);
      for (const s of newStats) {
        const res = await fetch("/api/admin/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: s.label, valeur: s.valeur, ordre: s.ordre }),
        });
        if (res.ok) {
          const data = await res.json();
          s.id = data.data.id;
          delete s.isNew;
        }
      }

      // Update existing stats
      const existingStats = stats.filter((s) => !s.isNew);
      if (existingStats.length > 0) {
        await fetch("/api/admin/stats", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stats: existingStats }),
        });
      }

      setMessage("Sauvegardé !");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">Chiffres clés</h1>
          <p className="text-sm text-gray-500 mt-1">Stats affichées sur la homepage</p>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span className="text-sm text-success font-medium">{message}</span>
          )}
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {stats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 size={32} className="mx-auto mb-3 text-gray-300" />
            <p>Aucune stat. Ajoutez vos chiffres clés.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div key={stat.id} className="flex items-end gap-3">
                <div className="w-16">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ordre</label>
                  <input
                    type="number"
                    value={stat.ordre}
                    onChange={(e) => updateStat(index, "ordre", parseInt(e.target.value) || 0)}
                    className={inputClass}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Valeur</label>
                  <input
                    value={stat.valeur}
                    onChange={(e) => updateStat(index, "valeur", e.target.value)}
                    className={inputClass}
                    placeholder="35 ans"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                  <input
                    value={stat.label}
                    onChange={(e) => updateStat(index, "label", e.target.value)}
                    className={inputClass}
                    placeholder="d'expertise béton"
                  />
                </div>
                <button
                  onClick={() => removeStat(index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={addStat}
          className="mt-4 flex items-center gap-2 text-sm text-primary hover:text-primary-600 transition-colors"
        >
          <Plus size={16} />
          Ajouter un chiffre
        </button>
      </div>
    </div>
  );
}
