import { Suspense } from "react";
import type { Metadata } from "next";
import { TradeInWizard } from "@/components/tradein/TradeInWizard";

export const metadata: Metadata = {
  title: "Cotizá tu canje",
  description: "Cotizá tu iPhone usado al instante y conocé la diferencia a pagar por el equipo que quieras.",
};

export default function CanjePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-28 md:pt-36">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-titanium-300">Plan canje</p>
      <h1 className="mb-10 text-5xl font-semibold leading-none tracking-[-0.04em] md:text-7xl">
        <span className="text-gradient-titanium">Cotizá tu iPhone.</span>
      </h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/5" />}>
        <TradeInWizard />
      </Suspense>
    </div>
  );
}
