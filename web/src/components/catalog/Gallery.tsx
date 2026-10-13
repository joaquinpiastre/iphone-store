"use client";

import { useState } from "react";
import type { PhoneImage } from "@/lib/types";
import { PhoneArt } from "@/components/ui/PhoneArt";

/** Galería con miniaturas y zoom que sigue al cursor (click/tap para activar). */
export function Gallery({ images, color, alt }: { images: PhoneImage[]; color: string; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const current = images[active];

  return (
    <div>
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_50%_30%,rgba(109,74,255,0.2),transparent_65%)]"
        onClick={() => setZoom((z) => !z)}
        onPointerMove={(e) => {
          if (!zoom) return;
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
        data-cursor="hover"
      >
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={alt}
            className="h-full w-full object-contain p-4 transition-transform duration-200"
            style={{ transform: zoom ? "scale(2.2)" : "scale(1)", transformOrigin: origin }}
          />
        ) : (
          <PhoneArt color={color} />
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => {
                setActive(i);
                setZoom(false);
              }}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border ${
                i === active ? "border-white" : "border-white/15 opacity-60"
              }`}
              aria-label={`Foto ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
