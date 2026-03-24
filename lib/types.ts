// ─── Types dérivés de Prisma + types UI ──────────────────────────

import type {
  Realisation,
  Document,
  Lead,
  Stat,
  Parametres,
  ArticleReglementation,
  DocumentType,
  ProfilType,
} from "@prisma/client";

// Re-export des types Prisma
export type {
  Realisation,
  Document,
  Lead,
  Stat,
  Parametres,
  ArticleReglementation,
  DocumentType,
  ProfilType,
};

// ─── Types formulaires ──────────────────────────────────────────

export type LeadFormData = {
  prenom: string;
  nom: string;
  societe: string;
  email: string;
  profil: ProfilType;
  departement: string;
  message?: string;
};

export type ContactFormData = LeadFormData & {
  message: string;
};

// ─── Types UI ───────────────────────────────────────────────────

export type ConfigurationType = {
  id: string;
  titre: string;
  sousTitre: string;
  description: string;
  avantages: string[];
  casUsage: string[];
  icon: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export type StatItem = {
  label: string;
  valeur: string;
  suffix?: string;
};

// ─── Types API ──────────────────────────────────────────────────

export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};
