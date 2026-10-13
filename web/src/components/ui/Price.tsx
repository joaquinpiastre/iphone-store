"use client";

import { useSite } from "@/components/providers/SiteProvider";
import { fmtArs, fmtUsd } from "@/lib/format";

/** Muestra el precio en la moneda elegida y el equivalente en la otra, más chico. */
export function Price({
  usd,
  className = "",
  size = "md",
}: {
  usd: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { currency, usdRate } = useSite();
  const main = currency === "USD" ? fmtUsd(usd) : fmtArs(usd * usdRate);
  const alt = currency === "USD" ? fmtArs(usd * usdRate) : fmtUsd(usd);
  const mainCls = size === "lg" ? "text-4xl md:text-5xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <span className={`inline-flex flex-col leading-tight ${className}`}>
      <span className={`${mainCls} font-semibold tracking-tight`}>{main}</span>
      <span className="text-xs text-white/40">{alt}</span>
    </span>
  );
}
