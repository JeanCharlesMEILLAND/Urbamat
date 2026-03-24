"use client";

import { useEffect, useState } from "react";
import { Save, FileText, ChevronDown, ChevronRight, Check } from "lucide-react";

interface Section {
  key: string;
  label: string;
  type: "texte" | "html";
}

interface PageDef {
  label: string;
  sections: Section[];
}

interface ContentRow {
  id: string;
  page: string;
  section: string;
  contenu: string;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Record<string, PageDef>>({});
  const [contents, setContents] = useState<ContentRow[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [expandedPage, setExpandedPage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/pages")
      .then((r) => r.json())
      .then((data) => {
        setPages(data.pages);
        setContents(data.contents);
        // Initialiser les edits avec les valeurs existantes
        const initial: Record<string, string> = {};
        for (const c of data.contents) {
          initial[`${c.page}::${c.section}`] = c.contenu;
        }
        setEdits(initial);
        setLoading(false);
      });
  }, []);

  function getValue(page: string, section: string): string {
    const key = `${page}::${section}`;
    if (key in edits) return edits[key];
    const existing = contents.find(
      (c) => c.page === page && c.section === section
    );
    return existing?.contenu ?? "";
  }

  function setValue(page: string, section: string, value: string) {
    setEdits((prev) => ({ ...prev, [`${page}::${section}`]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const updates = Object.entries(edits)
      .filter(([, v]) => v.trim() !== "")
      .map(([key, contenu]) => {
        const [page, section] = key.split("::");
        return { page, section, contenu };
      });

    await fetch("/api/admin/pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleSavePage(pageKey: string) {
    setSaving(true);
    const pageSections = pages[pageKey]?.sections ?? [];
    const updates = pageSections
      .map((s) => ({
        page: pageKey,
        section: s.key,
        contenu: getValue(pageKey, s.key),
      }))
      .filter((u) => u.contenu.trim() !== "");

    await fetch("/api/admin/pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">
            Gestion des pages
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Modifiez le contenu de chaque section du site.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {saved ? (
            <>
              <Check size={16} />
              Enregistré
            </>
          ) : (
            <>
              <Save size={16} />
              {saving ? "Enregistrement..." : "Tout enregistrer"}
            </>
          )}
        </button>
      </div>

      {/* Pages */}
      <div className="space-y-3">
        {Object.entries(pages).map(([pageKey, pageDef]) => {
          const isExpanded = expandedPage === pageKey;
          const filledCount = pageDef.sections.filter(
            (s) => getValue(pageKey, s.key).trim() !== ""
          ).length;

          return (
            <div
              key={pageKey}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Page header */}
              <button
                onClick={() =>
                  setExpandedPage(isExpanded ? null : pageKey)
                }
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-primary" />
                  <div className="text-left">
                    <h2 className="font-semibold text-neutral-dark">
                      {pageDef.label}
                    </h2>
                    <p className="text-xs text-gray-400">
                      /{pageKey === "home" ? "" : pageKey} —{" "}
                      {filledCount}/{pageDef.sections.length} sections
                      remplies
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown size={18} className="text-gray-400" />
                ) : (
                  <ChevronRight size={18} className="text-gray-400" />
                )}
              </button>

              {/* Sections */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
                  {pageDef.sections.map((section) => (
                    <div key={section.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {section.label}
                        <span className="text-xs text-gray-400 ml-2 font-normal">
                          ({section.key})
                        </span>
                      </label>
                      {section.type === "html" ? (
                        <textarea
                          value={getValue(pageKey, section.key)}
                          onChange={(e) =>
                            setValue(pageKey, section.key, e.target.value)
                          }
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
                          placeholder={`Contenu pour ${section.label}...`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={getValue(pageKey, section.key)}
                          onChange={(e) =>
                            setValue(pageKey, section.key, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          placeholder={`Contenu pour ${section.label}...`}
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleSavePage(pageKey)}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                      <Save size={14} />
                      Enregistrer cette page
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
