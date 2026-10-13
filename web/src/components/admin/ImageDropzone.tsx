"use client";

import { useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { PhoneImage } from "@/lib/types";

/** Drag & drop de fotos: sube al backend (que las optimiza) y permite reordenar arrastrando. */
export function ImageDropzone({
  images,
  onChange,
}: {
  images: PhoneImage[];
  onChange: (imgs: PhoneImage[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setError(null);
    let current = images;
    for (const file of list) {
      setUploading((n) => n + 1);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await api<{ url: string; publicId: string }>("/api/admin/uploads", { method: "POST", body: fd });
        current = [...current, { url: res.url, publicId: res.publicId }];
        onChange(current);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Falló la subida");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function move(from: number, to: number) {
    if (from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
        }}
        onClick={() => input.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center text-sm transition-colors ${
          over ? "border-white bg-white/10" : "border-white/20 text-white/50 hover:border-white/40"
        }`}
      >
        {uploading > 0 ? `Subiendo ${uploading}…` : "Arrastrá fotos acá o tocá para elegir"}
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {images.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((img, i) => (
            <li
              key={img.url}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dragIdx !== null) move(dragIdx, i);
                setDragIdx(null);
              }}
              className="group relative aspect-square cursor-grab overflow-hidden rounded-xl border border-white/15 bg-white/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-black">
                  Principal
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 p-1 opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100">
                <button type="button" onClick={() => move(i, Math.max(0, i - 1))} className="px-1.5 text-xs" aria-label="Mover antes">
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, j) => j !== i))}
                  className="px-1.5 text-xs text-red-300"
                  aria-label="Quitar"
                >
                  ✕
                </button>
                <button
                  type="button"
                  onClick={() => move(i, Math.min(images.length - 1, i + 1))}
                  className="px-1.5 text-xs"
                  aria-label="Mover después"
                >
                  →
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
