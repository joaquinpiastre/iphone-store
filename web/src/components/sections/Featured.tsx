"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { CatalogResponse, Phone } from "@/lib/types";
import { PhoneCard } from "@/components/ui/PhoneCard";
import { SplitText } from "@/components/motion/SplitText";

export function Featured() {
  const [items, setItems] = useState<Phone[] | null>(null);

  useEffect(() => {
    api<CatalogResponse>("/api/phones?featured=1&limit=4")
      .then((r) => setItems(r.items))
      .catch(() => setItems([]));
  }, []);

  return (
    <section className="bg-black px-5 py-28 md:px-8 md:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <SplitText
            as="h2"
            text="Los que más se llevan."
            className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
          />
          <Link href="/iphones" className="text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">
            Ver todo el catálogo →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items === null
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/6] animate-pulse rounded-3xl bg-white/5" />
              ))
            : items.map((p) => <PhoneCard key={p.id} phone={p} />)}
        </div>
        {items?.length === 0 && (
          <p className="text-white/50">Pronto vamos a tener novedades. Escribinos por WhatsApp y te contamos qué hay.</p>
        )}
      </div>
    </section>
  );
}
