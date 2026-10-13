"use client";

import { useEffect, useState } from "react";

export const inputCls =
  "w-full rounded-xl border border-white/15 bg-transparent px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-white/50";
export const btnPrimary =
  "rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.03] disabled:opacity-40";
export const btnGhost =
  "rounded-full border border-white/20 px-4 py-2 text-sm transition-colors hover:bg-white/10 disabled:opacity-40";

export function useDebounced<T>(value: T, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-white/40">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-white/35">{hint}</span>}
    </label>
  );
}

export function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-4">
      <button className={btnGhost} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ←
      </button>
      <span className="text-sm text-white/50">
        {page} / {pages}
      </span>
      <button className={btnGhost} disabled={page >= pages} onClick={() => onChange(page + 1)}>
        →
      </button>
    </div>
  );
}

export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
      {children}
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black shadow-xl md:bottom-8">
      {message}
    </div>
  );
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const show = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2200);
  };
  return { msg, show };
}
