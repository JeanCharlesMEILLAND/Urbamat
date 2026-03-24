import { prisma } from "./prisma";

/**
 * Récupère un contenu éditable avec fallback sur la valeur par défaut.
 */
export async function getContent(
  page: string,
  section: string,
  fallback: string
): Promise<string> {
  try {
    const row = await prisma.pageContent.findUnique({
      where: { page_section: { page, section } },
    });
    return row?.contenu ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Récupère tous les contenus d'une page en un seul appel.
 * Retourne un objet { section: contenu }.
 */
export async function getPageContents(
  page: string,
  defaults: Record<string, string>
): Promise<Record<string, string>> {
  try {
    const rows = await prisma.pageContent.findMany({ where: { page } });
    const result = { ...defaults };
    for (const row of rows) {
      result[row.section] = row.contenu;
    }
    return result;
  } catch {
    return defaults;
  }
}

/**
 * Liste des pages éditables avec leurs sections.
 */
export const EDITABLE_PAGES: Record<
  string,
  { label: string; sections: { key: string; label: string; type: "texte" | "html" }[] }
> = {
  home: {
    label: "Accueil",
    sections: [
      { key: "hero_titre", label: "Hero — Titre", type: "texte" },
      { key: "hero_sous_titre", label: "Hero — Sous-titre", type: "texte" },
      { key: "hero_description", label: "Hero — Description", type: "texte" },
      { key: "hero_cta", label: "Hero — Bouton CTA", type: "texte" },
      { key: "probleme_titre", label: "Problème/Solution — Titre", type: "texte" },
      { key: "probleme_texte", label: "Problème/Solution — Texte", type: "html" },
      { key: "cta_titre", label: "CTA Contact — Titre", type: "texte" },
      { key: "cta_description", label: "CTA Contact — Description", type: "texte" },
    ],
  },
  produit: {
    label: "Produit URBAQUAI",
    sections: [
      { key: "titre", label: "Titre principal", type: "texte" },
      { key: "description", label: "Description", type: "html" },
      { key: "avantages_titre", label: "Avantages — Titre", type: "texte" },
    ],
  },
  urbaterra: {
    label: "URBATERRA",
    sections: [
      { key: "titre", label: "Titre principal", type: "texte" },
      { key: "description", label: "Description", type: "html" },
    ],
  },
  contact: {
    label: "Contact",
    sections: [
      { key: "titre", label: "Titre", type: "texte" },
      { key: "description", label: "Description", type: "texte" },
    ],
  },
  reglementation: {
    label: "Réglementation",
    sections: [
      { key: "titre", label: "Titre", type: "texte" },
      { key: "introduction", label: "Introduction", type: "html" },
    ],
  },
};
