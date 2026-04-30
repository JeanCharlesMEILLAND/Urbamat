"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const [defaults, setDefaults] = useState<Record<string, string>>({});
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [activePage, setActivePage] = useState<string>("home");
  const [activeLocale, setActiveLocale] = useState("fr");
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set(["hero", "concept", "stats", "problem", "configs"]));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [previewKey, setPreviewKey] = useState(0); // bump → reload iframe
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [previewScale, setPreviewScale] = useState(0.5);
  const [activeBlockId, setActiveBlockId] = useState<string>("");
  // Auto-save debounce + préservation du scroll iframe pour ressembler à un live edit
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingScrollY = useRef<number>(0);

  /** Synchro scroll : scrolle l'iframe sur la section dont le bloc éditeur
   * est en haut du viewport. Match basé sur block.id ↔ section[id] dans la page. */
  useEffect(() => {
    if (!previewIframeRef.current || !activeBlockId) return;
    const iframe = previewIframeRef.current;
    try {
      const doc = iframe.contentDocument;
      const target = doc?.getElementById(activeBlockId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch {
      // CORS ou iframe pas encore chargée — ignore
    }
  }, [activeBlockId]);

  /** Après un reload (changement de previewKey), restaure la position de scroll
   * de l'iframe pour ne pas casser le contexte de l'utilisateur. */
  useEffect(() => {
    const iframe = previewIframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      try {
        iframe.contentWindow?.scrollTo({ top: pendingScrollY.current, behavior: "instant" as ScrollBehavior });
      } catch {
        /* CORS ou autre — ignore */
      }
    };
    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [previewKey, activeLocale, activePage]);

  // Adapte automatiquement le zoom de l'iframe à la largeur du conteneur
  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const w = el.clientWidth;
      // Fenêtre virtuelle de l'iframe = 1280px (desktop layout)
      // On scale jusqu'à 1.0 max (pas de zoom in)
      setPreviewScale(Math.min(w / 1280, 1));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [showLivePreview]);

  /** IntersectionObserver sur les blocs éditeur — détecte celui qui est en
   * haut du viewport et déclenche le scroll de l'iframe au bon endroit. */
  useEffect(() => {
    if (!showLivePreview) return;
    const blocksMap = blockRefs.current;
    const visibleBlocks = new Map<string, number>(); // blockId -> intersection ratio

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.blockId;
          if (!id) continue;
          if (entry.isIntersecting) {
            visibleBlocks.set(id, entry.intersectionRatio);
          } else {
            visibleBlocks.delete(id);
          }
        }
        // Bloc le plus visible (par ordre d'apparition dans la page)
        if (visibleBlocks.size === 0) return;
        const firstVisible = Array.from(visibleBlocks.keys())[0];
        if (firstVisible) setActiveBlockId(firstVisible);
      },
      { rootMargin: "-20% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    Object.values(blocksMap).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [showLivePreview, activePage, expandedBlocks]);

  const fetchContents = useCallback((locale: string) => {
    setLoading(true);
    fetch(`/api/admin/pages?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => {
        setPages(data.pages);
        setContents(data.contents);
        setDefaults(data.defaults ?? {});
        // Reset les edits non sauvegardés quand on change de locale
        setEdits({});
        const initial: Record<string, string> = {};
        for (const c of data.contents) {
          initial[`${c.page}::${c.section}`] = c.contenu;
        }
        setEdits(initial);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // On change de locale → annule un auto-save en attente, sinon il écraserait
    // les valeurs de la nouvelle locale avec celles de l'ancienne.
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }
    fetchContents(activeLocale);
    // Sync le cookie next-intl avec la locale admin pour que l'iframe preview
    // (qui charge "/" pour FR) ne soit pas redirigée vers /en ou /de à cause
    // d'une visite antérieure du site dans une autre langue.
    document.cookie = `NEXT_LOCALE=${activeLocale}; path=/; max-age=31536000; SameSite=Lax`;
    // Force un reload iframe une fois le cookie posé, sinon le 1er render
    // peut partir avec le cookie stale (cas où le user vient d'/en sur le site).
    setPreviewKey((k) => k + 1);
    pendingScrollY.current = 0;
  }, [activeLocale, fetchContents]);

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  function getValue(page: string, section: string): string {
    const key = `${page}::${section}`;
    if (key in edits) return edits[key];
    const existing = contents.find(
      (c) => c.page === page && c.section === section
    );
    return existing?.contenu ?? "";
  }

  /** Valeur à afficher dans l'input — pré-remplit avec le texte i18n de la locale
   * active (si disponible) ou le placeholder. Quand l'utilisateur change de locale,
   * les inputs reflètent automatiquement le contenu de la nouvelle langue. */
  function getInputValue(page: string, section: SectionDef): string {
    const key = `${page}::${section.key}`;
    if (key in edits) return edits[key];                 // l'utilisateur a touché le champ
    const existing = contents.find(
      (c) => c.page === page && c.section === section.key
    );
    if (existing?.contenu) return existing.contenu;      // une valeur CMS existe
    // Fallback locale-aware : essaie d'abord le défaut i18n résolu par l'API,
    // puis le placeholder statique du content.ts
    return defaults[section.key] || section.placeholder || "";
  }

  function setValue(page: string, section: string, value: string) {
    setEdits((prev) => ({ ...prev, [`${page}::${section}`]: value }));
    setSaved(false);
    scheduleAutoSave();
  }

  /** Programme un save automatique 1.5s après la dernière édition.
   * Préserve la position scroll de l'iframe pour que le reload soit transparent. */
  function scheduleAutoSave() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      // Capture la position scroll AVANT que la save bump le previewKey
      try {
        const win = previewIframeRef.current?.contentWindow;
        pendingScrollY.current = win?.scrollY ?? 0;
      } catch {
        pendingScrollY.current = 0;
      }
      handleSave();
    }, 1500);
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
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }
    // Capture scroll iframe AVANT le reload (sinon save manuel = saut en haut)
    try {
      const win = previewIframeRef.current?.contentWindow;
      pendingScrollY.current = win?.scrollY ?? 0;
    } catch {
      /* ignore */
    }
    const currentPage = pages[activePage];
    if (!currentPage) return;
    setSaving(true);

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
    setPreviewKey((k) => k + 1); // refresh iframe preview après save
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">
            Éditeur de contenu
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Modifiez les textes, images et blocs de chaque page du site. Auto-sauvegarde
            après 1,5 s d&apos;inactivité — l&apos;aperçu à droite se rafraîchit tout seul.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle preview */}
          <button
            onClick={() => setShowLivePreview((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              showLivePreview
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Eye size={14} />
            {showLivePreview ? "Masquer aperçu" : "Afficher aperçu"}
          </button>

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

      <div className="flex gap-6 items-start">
        {/* Page sidebar — sticky elle aussi (même comportement que l'aperçu) */}
        <div className="w-56 shrink-0 sticky top-6 self-start space-y-1">
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

        {/* Block editor */}
        <div className="flex-1 space-y-4 min-w-0">
          {currentPage && (
            <>
              {/* Page header + barre de blocs sticky — toujours visible pendant
                  qu'on scrolle dans la liste des blocs. Pills cliquables pour
                  jumper vers un bloc + indicateur de save status. */}
              <div className="sticky top-0 z-20 -mt-2 pt-2 pb-3 bg-gray-50 border-b border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-dark">
                      {currentPage.label}
                    </h2>
                    <p className="text-xs text-gray-400 font-mono">
                      {currentPage.path}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Statut auto-save : indicateur compact à droite */}
                    <span className="text-[11px] text-gray-500 inline-flex items-center gap-1.5">
                      {saving ? (
                        <><Loader2 size={12} className="animate-spin text-primary" /> Sauvegarde…</>
                      ) : saved ? (
                        <><Check size={12} className="text-success" /> Enregistré</>
                      ) : autoSaveTimer.current ? (
                        <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Sauvegarde dans 1,5 s…</>
                      ) : (
                        <span className="text-gray-400">À jour</span>
                      )}
                    </span>
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
                </div>

                {/* Pills de navigation entre les blocs de la page courante */}
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1">
                  {currentPage.blocks.map((block) => {
                    const Icon = ICONS[block.icon] || Sparkles;
                    const isActive = activeBlockId === block.id;
                    // "Modifié" = au moins une section du bloc a une valeur dans `edits`
                    // qui diffère de la valeur initiale dans `contents`.
                    const hasUnsaved = block.sections.some((s) => {
                      const k = `${activePage}::${s.key}`;
                      if (!(k in edits)) return false;
                      const initial = contents.find(
                        (c) => c.page === activePage && c.section === s.key
                      )?.contenu ?? "";
                      return edits[k] !== initial;
                    });
                    return (
                      <button
                        key={block.id}
                        onClick={() => {
                          setExpandedBlocks((prev) => {
                            const next = new Set(prev);
                            next.add(block.id);
                            return next;
                          });
                          // Scroll la liste vers le bloc — laisse 80px de marge
                          // pour ne pas qu'il soit caché derrière la sticky bar.
                          requestAnimationFrame(() => {
                            const el = blockRefs.current[block.id];
                            if (el) {
                              const top =
                                el.getBoundingClientRect().top + window.scrollY - 100;
                              window.scrollTo({ top, behavior: "smooth" });
                            }
                          });
                        }}
                        className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
                          isActive
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary"
                        }`}
                        title={block.description}
                      >
                        <Icon size={12} />
                        <span className="truncate max-w-[140px]">{block.label}</span>
                        {hasUnsaved && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isActive ? "bg-white" : "bg-amber-500"
                            }`}
                            title="Modifications non sauvées"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
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
                    data-block-id={block.id}
                    ref={(el) => { blockRefs.current[block.id] = el; }}
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
                                value={getInputValue(activePage, section)}
                                onChange={(v) => setValue(activePage, section.key, v)}
                                onUpload={(f) =>
                                  handleImageUpload(activePage, section.key, f)
                                }
                                uploading={uploading === section.key}
                              />
                            ) : section.type === "html" ? (
                              <textarea
                                value={getInputValue(activePage, section)}
                                onChange={(e) =>
                                  setValue(activePage, section.key, e.target.value)
                                }
                                rows={5}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-y bg-white font-mono"
                                placeholder={`Contenu HTML…`}
                              />
                            ) : (
                              <input
                                type="text"
                                value={getInputValue(activePage, section)}
                                onChange={(e) =>
                                  setValue(activePage, section.key, e.target.value)
                                }
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-white"
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

        {/* ─── Panneau iframe : aperçu live de la page (sticky) ─── */}
        {showLivePreview && currentPage && (
          <div className="hidden xl:block flex-1 min-w-0 self-start sticky top-6">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye size={14} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">
                      Aperçu — {currentPage.label}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {Math.round(previewScale * 100)}%
                    </span>
                  </div>
                  <a
                    href={currentPage.path}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-gray-400 hover:text-primary inline-flex items-center gap-1"
                    title="Ouvrir dans un nouvel onglet"
                  >
                    Plein écran
                    <ExternalLink size={11} />
                  </a>
                </div>
                {/* L'iframe est rendue à 1280px (desktop) puis zoomée out via scale dynamique */}
                <div
                  ref={previewContainerRef}
                  className="bg-gray-50 overflow-hidden relative"
                  style={{ width: "100%", height: "calc(100vh - 180px)" }}
                >
                  <iframe
                    ref={previewIframeRef}
                    key={`${previewKey}-${activeLocale}`}
                    /* localePrefix=as-needed dans i18n/routing.ts : FR n'a pas de préfixe.
                       Donc /fr/produit redirige vers /produit. On respecte directement. */
                    src={(() => {
                      const prefix = activeLocale === "fr" ? "" : `/${activeLocale}`;
                      const path = currentPage.path === "/" ? "/" : currentPage.path;
                      return `${prefix}${path}?_admin_preview=1`;
                    })()}
                    title="Aperçu live (mode desktop)"
                    style={{
                      width: "1280px",
                      height: `calc((100vh - 180px) / ${previewScale})`,
                      transform: `scale(${previewScale})`,
                      transformOrigin: "top left",
                      border: 0,
                    }}
                  />
                </div>
                <p className="px-4 py-2 text-[10px] text-gray-400 border-t border-gray-100 bg-gray-50">
                  Mode desktop (1280px) — zoom auto adapté à la largeur disponible. Refresh au save.
                </p>
              </div>
          </div>
        )}
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
    <div className="space-y-3">
      {/* Preview large — full width, aspect-vidéo, fond damier pour les PNG transparents */}
      {value && (
        <div className="relative group w-full">
          <div
            className="w-full rounded-lg border border-gray-200 overflow-hidden bg-white"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className="w-full max-h-80 object-contain"
            />
          </div>
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            title="Supprimer cette image"
          >
            <X size={14} />
          </button>
          {/* Dimensions affichées (URL/path indicatif) */}
          <p className="mt-1.5 text-[10px] font-mono text-gray-400 truncate">{value}</p>
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
