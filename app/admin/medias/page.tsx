"use client";

import { useEffect, useState } from "react";
import { Upload, Trash2, Loader2, Copy, Check, Image as ImageIcon, X } from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  alt: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export default function AdminMediasPage() {
  const [medias, setMedias] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchMedias();
  }, []);

  async function fetchMedias() {
    setLoading(true);
    const res = await fetch("/api/admin/upload");
    const data = await res.json();
    setMedias(data.data || []);
    setLoading(false);
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      await fetch("/api/admin/upload", { method: "POST", body: formData });
    }

    setUploading(false);
    fetchMedias();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette image ?")) return;
    setDeleting(id);
    await fetch("/api/admin/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    fetchMedias();
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">Médias</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les images du site. Glissez-déposez pour uploader.
          </p>
        </div>
        <label className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer shadow-sm">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
          {uploading ? (
            <><Loader2 size={16} className="animate-spin" /> Upload...</>
          ) : (
            <><Upload size={16} /> Ajouter des images</>
          )}
        </label>
      </div>

      {/* Drop zone */}
      <div
        onDrop={(e) => {
          e.preventDefault();
          handleUpload(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/40 transition-colors"
      >
        <Upload size={32} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">
          Glissez-déposez vos images ici
        </p>
        <p className="text-xs text-gray-400 mt-1">
          JPG, PNG, WebP, SVG, GIF — max 5 Mo
        </p>
      </div>

      {/* Gallery */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-gray-400" size={24} />
        </div>
      ) : medias.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <ImageIcon size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Aucune image. Uploadez vos premiers médias.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {medias.map((media) => (
            <div
              key={media.id}
              className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.url}
                  alt={media.alt}
                  className="w-full h-full object-cover"
                />
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => copyUrl(media.url)}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                    title="Copier l'URL"
                  >
                    {copied === media.url ? (
                      <Check size={14} className="text-success" />
                    ) : (
                      <Copy size={14} className="text-gray-700" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(media.id)}
                    disabled={deleting === media.id}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    {deleting === media.id ? (
                      <Loader2 size={14} className="animate-spin text-gray-400" />
                    ) : (
                      <Trash2 size={14} className="text-red-500" />
                    )}
                  </button>
                </div>
              </div>
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-neutral-dark truncate">
                  {media.filename}
                </p>
                <p className="text-[10px] text-gray-400">
                  {formatSize(media.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
