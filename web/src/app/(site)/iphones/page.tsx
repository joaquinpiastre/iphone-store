import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogClient } from "@/components/catalog/CatalogClient";

export const metadata: Metadata = {
  title: "Catálogo de iPhone",
  description: "iPhone nuevos, seminuevos y usados con garantía. Filtrá por modelo, almacenamiento, color y batería.",
};

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 pt-28 md:px-8 md:pt-36">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-titanium-300">Catálogo</p>
      <h1 className="mb-12 text-5xl font-semibold leading-none tracking-[-0.04em] md:text-8xl">
        <span className="text-gradient-titanium">Elegí tu iPhone.</span>
      </h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/5" />}>
        <CatalogClient />
      </Suspense>
    </div>
  );
}
