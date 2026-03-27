"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Save, Check, Loader2, Globe, Image as ImageIcon,
  Type, Code2, ChevronDown, ChevronRight, ExternalLink,
  Sparkles, BarChart3, AlertTriangle, Grid3x3, Table,
  MapPin, ShieldCheck, Send, Package, Settings, Wrench,
  ArrowRight, UtensilsCrossed, Users, Mail, FileText,
  Download, Scale, Upload, X, Eye,
} from "lucide-react";

// Icon map from string name to component
const ICONS: Record<string, any> = {
  Sparkles, BarChart3, AlertTriangle, Grid3x3, Table,
  MapPin, ShieldCheck, Send, Package, Settings, Wrench,
  ArrowRight, UtensilsCrossed, Users, Mail, FileText,
  Download, Scale,
};

interface SectionDef {
  key: string;
  label: string;
  type: "texte" | "html" | "image";
  placeholder?: string;
}

interface BlockDef {
  id: string;
  label: string;
  description: string;
  icon: string;
  sections: SectionDef[];
}

interface PageDef {
  label: string;
  path: string;
  blocks: BlockDef[];
}

interface ContentRow {
  page: string;
  section: string;
  contenu: string;
}

const LOCALES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Record<string, PageDef>>({});
  const [contents, setContents] = useState<ContentRow[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [activePage, setActivePage] = useState<string>("home");
  const [activeLocale, setActiveLocale] = useState("fr");
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set(["hero"]));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchContents = useCallback((locale: string) => {
    setLoading(true);
    fetch(`/api/admin/pages?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => {
        setPages(data.pages);
        setContents(data.contents);
        const initial: Record<string, string> = {};
        for (const c of data.contents) {
          initial[`${c.page}::${c.section}`] = c.contenu;
        }
        setEdits(initial);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchContents(activeLocale);
  }, [activeLocale, fetchContents]);

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

  function toggleBlock(blockId: string) {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    const currentPage = pages[activePage];
    if (!currentPage) return;

    const updates: { page: string; section: string; contenu: string; type: string }[] = [];
    for (const block of currentPage.blocks) {
      for (const section of block.sections) {
        const val = getValue(activePage, section.key);
        if (val.trim()) {
          updates.push({
            page: activePage,
            section: section.key,
            contenu: val,
            type: section.type,
          });
        }
      }
    }

    await fetch("/api/admin/pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates, locale: activeLocale }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleImageUpload(page: string, section: string, file: File) {
    setUploading(section);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setValue(page, section, data.media.url);
      }
    } catch {
      // fail silently
    }
    setUploading(null);
  }

  const currentPage = pages[activePage];
  const pageKeys = Object.keys(pages);

  if (loading && pageKeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="animate-spin mr-2" size={20} />
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
            Éditeur de contenu
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Modifiez les textes, images et blocs de chaque page du site.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50 shadow-sm"
        >
          {saved ? (
            <><Check size={16} /> Enregistré</>
          ) : saving ? (
            <><Loader2 size={16} className="animate-spin" /> Enregistrement...</>
          ) : (
            <><Save size={16} /> Enregistrer</>
          )}
        </button>
      </div>

      {/* Locale tabs */}
      <div className="flex items-center gap-2">
        <Globe size={16} className="text-gray-400" />
        <div className="flex bg-gray-100 rounded-lg p-1">
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              onClick={() => setActiveLocale(loc.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeLocale === loc.code
                  ? "bg-white text-neutral-dark shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>{loc.flag}</span>
              {loc.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Page sidebar */}
        <div className="w-56 shrink-0">
          <div className="sticky top-24 space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Pages
            </p>
            {pageKeys.map((key) => {
              const p = pages[key];
              const filledCount = p.blocks.reduce(
                (acc, b) =>
                  acc + b.sections.filter((s) => getValue(key, s.key).trim() !== "").length,
                0
              );
              const totalCount = p.blocks.reduce(
                (acc, b) => acc + b.sections.length,
                0
              );

              return (
                <button
                  key={key}
                  onClick={() => {
                    setActivePage(key);
                    setExpandedBlocks(new Set([p.blocks[0]?.id || ""]));
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activePage === key
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="truncate">{p.label}</span>
                  <span className="text-[10px] font-mono text-gray-400 shrink-0 ml-2">
                    {filledCount}/{totalCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Block editor */}
        <div className="flex-1 space-y-4 min-w-0">
          {currentPage && (
            <>
              {/* Page header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-bold text-neutral-dark">
                    {currentPage.label}
                  </h2>
                  <p className="text-xs text-gray-400 font-mono">
                    {currentPage.path}
                  </p>
                </div>
                <a
                  href={currentPage.path}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors"
                >
                  <Eye size={14} />
                  Voir la page
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* Blocks */}
              {currentPage.blocks.map((block) => {
                const Icon = ICONS[block.icon] || Sparkles;
                const isExpanded = expandedBlocks.has(block.id);
                const filledCount = block.sections.filter(
                  (s) => getValue(activePage, s.key).trim() !== ""
                ).length;

                return (
                  <div
                    key={block.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                  >
                    {/* Block header */}
                    <button
                      onClick={() => toggleBlock(block.id)}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-neutral-dark text-sm">
                            {block.label}
                          </h3>
                          {filledCount > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/10 text-success font-medium">
                              {filledCount}/{block.sections.length}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {block.description}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-gray-400 shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400 shrink-0" />
                      )}
                    </button>

                    {/* Block fields */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/30 px-5 py-5 space-y-5">
                        {block.sections.map((section) => (
                          <div key={section.key}>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                              {section.type === "image" ? (
                                <ImageIcon size={14} className="text-gray-400" />
                              ) : section.type === "html" ? (
                                <Code2 size={14} className="text-gray-400" />
                              ) : (
                                <Type size={14} className="text-gray-400" />
                              )}
                              {section.label}
                            </label>

                            {section.type === "image" ? (
                              <ImageField
                                value={getValue(activePage, section.key)}
                                onChange={(v) => setValue(activePage, section.key, v)}
                                onUpload={(f) =>
                                  handleImageUpload(activePage, section.key, f)
                                }
                                uploading={uploading === section.key}
                              />
                            ) : section.type === "html" ? (
                              <textarea
                                value={getValue(activePage, section.key)}
                                onChange={(e) =>
                                  setValue(activePage, section.key, e.target.value)
                                }
                                rows={5}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y bg-white font-mono"
                                placeholder={section.placeholder || `Contenu HTML...`}
                              />
                            ) : (
                              <input
                                type="text"
                                value={getValue(activePage, section.key)}
                                onChange={(e) =>
                                  setValue(activePage, section.key, e.target.value)
                                }
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-white"
                                placeholder={section.placeholder || ""}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Image field component ─────────────────────────────────────

function ImageField({
  value,
  onChange,
  onUpload,
  uploading,
}: {
  value: string;
  onChange: (v: string) => void;
  onUpload: (f: File) => void;
  uploading: boolean;
}) {
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onUpload(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  }

  return (
    <div className="space-y-2">
      {/* Preview */}
      {value && (
        <div className="relative group w-full max-w-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-full h-40 object-cover rounded-lg border border-gray-200"
          />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-primary/40 transition-colors cursor-pointer"
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            Upload en cours...
          </div>
        ) : (
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-1.5">
              <Upload size={20} className="text-gray-400" />
              <span className="text-xs text-gray-500">
                Glisser-déposer ou <span className="text-primary font-medium">parcourir</span>
              </span>
              <span className="text-[10px] text-gray-400">
                JPG, PNG, WebP, SVG — max 5 Mo
              </span>
            </div>
          </label>
        )}
      </div>

      {/* Manual URL */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white font-mono"
        placeholder="ou coller une URL d'image..."
      />
    </div>
  );
}
