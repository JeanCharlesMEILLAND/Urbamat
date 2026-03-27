import { prisma } from "./prisma";
import { cache } from "react";

/**
 * Fetches CMS overrides for a page+locale.
 * Returns a Record<section, contenu> — only non-empty values.
 * Cached per request (React cache).
 */
export const getCmsOverrides = cache(
  async (page: string, locale: string = "fr"): Promise<Record<string, string>> => {
    try {
      const rows = await prisma.pageContent.findMany({
        where: { page, locale },
      });
      const result: Record<string, string> = {};
      for (const row of rows) {
        if (row.contenu.trim()) result[row.section] = row.contenu;
      }
      return result;
    } catch {
      return {};
    }
  }
);
