"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { DEPARTEMENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FormState = "idle" | "loading" | "success" | "error";

type LeadFormValues = {
  prenom: string;
  nom: string;
  societe: string;
  email: string;
  profil: string;
  departement: string;
  message?: string;
};

interface LeadFormProps {
  className?: string;
  onSuccess?: () => void;
  compact?: boolean;
  documentIds?: string[];
}

export function LeadForm({ className, onSuccess, compact = false, documentIds }: LeadFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const t = useTranslations("leadForm");
  const tProf = useTranslations("profils");
  const tVal = useTranslations("validation");

  const schema = z.object({
    prenom: z.string().min(1, tVal("prenomRequis")).max(100),
    nom: z.string().min(1, tVal("nomRequis")).max(100),
    societe: z.string().min(1, tVal("societeRequise")).max(200),
    email: z.string().email(tVal("emailInvalide")),
    profil: z.enum(["moe", "moa", "tp", "collectivite", "autre"], {
      errorMap: () => ({ message: tVal("profilRequis") }),
    }),
    departement: z.string().max(100).default(""),
    message: z.string().max(2000).optional(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: LeadFormValues) {
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
        throw new Error(err.error || t("erreurServeur"));
      }

      setState("success");
      reset();
      onSuccess?.();
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : t("erreurGenerale"));
    }
  }

  if (state === "success") {
    return (
      <div className={cn("p-8 bg-success/10 rounded-lg border border-success/20 text-center", className)}>
        <CheckCircle2 size={40} className="text-success mx-auto mb-3" />
        <p className="text-lg font-semibold text-success">{t("merci")}</p>
        <p className="mt-2 text-sm text-gray-600">
          {t("merciDescription")}
        </p>
      </div>
    );
  }

  const PROFIL_KEYS = ["moe", "moa", "tp", "collectivite", "autre"] as const;
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
          <label htmlFor="lead-prenom" className={labelClass}>{t("prenom")}</label>
          <input id="lead-prenom" {...register("prenom")} className={inputClass} placeholder={t("placeholders.prenom")} />
          {errors.prenom && <p className={errorClass}>{errors.prenom.message}</p>}
        </div>
        <div>
          <label htmlFor="lead-nom" className={labelClass}>{t("nom")}</label>
          <input id="lead-nom" {...register("nom")} className={inputClass} placeholder={t("placeholders.nom")} />
          {errors.nom && <p className={errorClass}>{errors.nom.message}</p>}
        </div>
      </div>

      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
        <div>
          <label htmlFor="lead-societe" className={labelClass}>{t("societe")}</label>
          <input id="lead-societe" {...register("societe")} className={inputClass} placeholder={t("placeholders.societe")} />
          {errors.societe && <p className={errorClass}>{errors.societe.message}</p>}
        </div>
        <div>
          <label htmlFor="lead-email" className={labelClass}>{t("email")}</label>
          <input id="lead-email" type="email" {...register("email")} className={inputClass} placeholder={t("placeholders.email")} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
      </div>

      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
        <div>
          <label htmlFor="lead-profil" className={labelClass}>{t("profil")}</label>
          <select id="lead-profil" {...register("profil")} className={inputClass}>
            <option value="">{t("select")}</option>
            {PROFIL_KEYS.map((key) => (
              <option key={key} value={key}>{tProf(key)}</option>
            ))}
          </select>
          {errors.profil && <p className={errorClass}>{errors.profil.message}</p>}
        </div>
        <div>
          <label htmlFor="lead-departement" className={labelClass}>{t("departement")}</label>
          <select id="lead-departement" {...register("departement")} className={inputClass}>
            <option value="">{t("select")}</option>
            {DEPARTEMENTS.map((dep) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
      </div>

      {!compact && (
        <div>
          <label htmlFor="lead-message" className={labelClass}>{t("messageLabel")}</label>
          <textarea
            id="lead-message"
            {...register("message")}
            rows={3}
            className={cn(inputClass, "resize-y")}
            placeholder={t("messagePlaceholder")}
          />
        </div>
      )}

      <div className="pt-2">
        <Button type="submit" disabled={state === "loading"} className="w-full sm:w-auto">
          {state === "loading" ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              {t("envoi")}
            </>
          ) : (
            <>
              <Send size={16} className="mr-2" />
              {compact ? t("accesDocuments") : t("envoyer")}
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        {t("champsObligatoires")}
      </p>
    </form>
  );
}
