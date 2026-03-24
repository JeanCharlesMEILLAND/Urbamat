"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: { src: string; alt: string }[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) return null;

  function navigate(dir: -1 | 1) {
    setSelected((prev) => (prev + dir + images.length) % images.length);
  }

  return (
    <>
      <div className="space-y-3">
        {/* Image principale */}
        <button
          onClick={() => setLightbox(true)}
          className="w-full aspect-[16/10] bg-neutral-light rounded-lg overflow-hidden relative group cursor-zoom-in"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${images[selected].src})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-6xl font-mono text-primary/20">URBAQUAI</span>
          </div>
        </button>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={cn(
                  "shrink-0 w-20 h-14 rounded border-2 overflow-hidden transition-all",
                  i === selected ? "border-primary" : "border-gray-200 hover:border-gray-400"
                )}
              >
                <div className="w-full h-full bg-neutral-light flex items-center justify-center">
                  <span className="text-xs text-gray-400">{i + 1}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            aria-label="Fermer"
          >
            <X size={28} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            className="absolute left-4 text-white/70 hover:text-white p-2"
            aria-label="Précédent"
          >
            <ChevronLeft size={32} />
          </button>

          <div className="max-w-4xl max-h-[80vh] mx-16" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-[16/10] bg-neutral-dark rounded-lg flex items-center justify-center">
              <span className="text-4xl font-mono text-white/20">URBAQUAI — {selected + 1}/{images.length}</span>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); navigate(1); }}
            className="absolute right-4 text-white/70 hover:text-white p-2"
            aria-label="Suivant"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </>
  );
}
