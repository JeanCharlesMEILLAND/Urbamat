"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DEPARTEMENTS } from "@/lib/constants";
import type { Realisation } from "@/lib/types";

interface RealisationFormProps {
  initial?: Realisation | null;
}

export function RealisationForm({ initial }: RealisationFormProps) {
  const router = useRouter();
  const isEdit = !!initial;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    titre: initial?.titre ?? "",
    ville: initial?.ville ?? "",
    departement: initial?.departement ?? "",
    annee: initial?.annee ?? new Date().getFullYear(),
    typologieQuai: initial?.typologieQuai ?? "",
    contexte: initial?.contexte ?? "",
    longueurMl: initial?.longueurMl ?? 0,
    nbStations: initial?.nbStations ?? 1,
  });

  function update(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEdit
        ? `/api/admin/realisations/${initial!.id}`
        : "/api/admin/realisations";

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          annee: Number(form.annee),
          longueurMl: Number(form.longueurMl),
          nbStations: Number(form.nbStations),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur serveur");
      }

      router.push("/admin/realisations");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Titre *</label>
        <input
          value={form.titre}
          onChange={(e) => update("titre", e.target.value)}
          className={inputClass}
          placeholder="Carquefou (44) — Mobilité autonome"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Ville *</label>
          <input value={form.ville} onChange={(e) => update("ville", e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Département *</label>
          <input value={form.departement} onChange={(e) => update("departement", e.target.value)} className={inputClass} placeholder="44" required />
        </div>
        <div>
          <label className={labelClass}>Année *</label>
          <input type="number" value={form.annee} onChange={(e) => update("annee", e.target.value)} className={inputClass} required />
        </div>
      </div>

      <div>
        <label className={labelClass}>Typologie de quai *</label>
        <input
          value={form.typologieQuai}
          onChange={(e) => update("typologieQuai", e.target.value)}
          className={inputClass}
          placeholder="6 stations — 9ml à 16ml"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Longueur totale (ml) *</label>
          <input
            type="number"
            step="any"
            value={form.longueurMl}
            onChange={(e) => update("longueurMl", e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Nombre de stations *</label>
          <input
            type="number"
            value={form.nbStations}
            onChange={(e) => update("nbStations", e.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Contexte / description *</label>
        <textarea
          value={form.contexte}
          onChange={(e) => update("contexte", e.target.value)}
          rows={4}
          className={`${inputClass} resize-y`}
          placeholder="Service expérimental mobilité autonome..."
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              {isEdit ? "Mettre à jour" : "Créer la réalisation"}
            </>
          )}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
