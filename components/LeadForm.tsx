"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { leadSchema, type LeadSchemaType } from "@/lib/validators";
import { Button } from "@/components/ui/Button";
import { DEPARTEMENTS, PROFIL_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FormState = "idle" | "loading" | "success" | "error";

interface LeadFormProps {
  className?: string;
  onSuccess?: () => void;
  compact?: boolean;
  documentIds?: string[];
}

export function LeadForm({ className, onSuccess, compact = false, documentIds }: LeadFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadSchemaType>({
    resolver: zodResolver(leadSchema),
  });

  async function onSubmit(data: LeadSchemaType) {
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          documentsTelecharges: documentIds ?? [],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur serveur");
      }

      setState("success");
      reset();
      onSuccess?.();
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  }

  if (state === "success") {
    return (
      <div className={cn("p-8 bg-success/10 rounded-lg border border-success/20 text-center", className)}>
        <CheckCircle2 size={40} className="text-success mx-auto mb-3" />
        <p className="text-lg font-semibold text-success">Merci !</p>
        <p className="mt-2 text-sm text-gray-600">
          Vos documents sont maintenant accessibles. Un email de confirmation vous a été envoyé.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
      {state === "error" && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
        <div>
          <label htmlFor="lead-prenom" className={labelClass}>Prénom *</label>
          <input id="lead-prenom" {...register("prenom")} className={inputClass} placeholder="Jean" />
          {errors.prenom && <p className={errorClass}>{errors.prenom.message}</p>}
        </div>
        <div>
          <label htmlFor="lead-nom" className={labelClass}>Nom *</label>
          <input id="lead-nom" {...register("nom")} className={inputClass} placeholder="Dupont" />
          {errors.nom && <p className={errorClass}>{errors.nom.message}</p>}
        </div>
      </div>

      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
        <div>
          <label htmlFor="lead-societe" className={labelClass}>Société *</label>
          <input id="lead-societe" {...register("societe")} className={inputClass} placeholder="Bureau d'études XYZ" />
          {errors.societe && <p className={errorClass}>{errors.societe.message}</p>}
        </div>
        <div>
          <label htmlFor="lead-email" className={labelClass}>Email professionnel *</label>
          <input id="lead-email" type="email" {...register("email")} className={inputClass} placeholder="j.dupont@exemple.fr" />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
      </div>

      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
        <div>
          <label htmlFor="lead-profil" className={labelClass}>Vous êtes *</label>
          <select id="lead-profil" {...register("profil")} className={inputClass}>
            <option value="">— Sélectionner —</option>
            {Object.entries(PROFIL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.profil && <p className={errorClass}>{errors.profil.message}</p>}
        </div>
        <div>
          <label htmlFor="lead-departement" className={labelClass}>Département</label>
          <select id="lead-departement" {...register("departement")} className={inputClass}>
            <option value="">— Sélectionner —</option>
            {DEPARTEMENTS.map((dep) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
      </div>

      {!compact && (
        <div>
          <label htmlFor="lead-message" className={labelClass}>Message (optionnel)</label>
          <textarea
            id="lead-message"
            {...register("message")}
            rows={3}
            className={cn(inputClass, "resize-y")}
            placeholder="Décrivez votre projet..."
          />
        </div>
      )}

      <div className="pt-2">
        <Button type="submit" disabled={state === "loading"} className="w-full sm:w-auto">
          {state === "loading" ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send size={16} className="mr-2" />
              {compact ? "Accéder aux documents" : "Envoyer"}
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        * Champs obligatoires. Vos données sont traitées uniquement pour répondre à votre demande.
      </p>
    </form>
  );
}
