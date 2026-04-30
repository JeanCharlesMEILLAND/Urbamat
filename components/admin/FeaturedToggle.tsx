"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeaturedToggleProps {
  id: string;
  initial: boolean;
  /** "/api/admin/realisations" ou "/api/admin/documents" */
  endpoint: string;
  /** "PATCH" pour documents, "PUT" pour realisations (existant) */
  method?: "PATCH" | "PUT";
}

export function FeaturedToggle({ id, initial, endpoint, method = "PATCH" }: FeaturedToggleProps) {
  const [featured, setFeatured] = useState(initial);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    if (busy) return;
    const next = !featured;
    setBusy(true);
    setFeatured(next);
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: next }),
      });
      if (!res.ok) {
        setFeatured(!next); // rollback en cas d'erreur
      } else {
        router.refresh(); // re-render la page admin pour synchroniser le compteur
      }
    } catch {
      setFeatured(!next);
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`p-1.5 rounded transition-colors ${
        featured
          ? "text-amber-500 hover:text-amber-600"
          : "text-gray-300 hover:text-gray-500"
      }`}
      title={featured ? "Affichée en home — cliquer pour retirer" : "Mettre en avant sur la home"}
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} fill={featured ? "currentColor" : "none"} />}
    </button>
  );
}
