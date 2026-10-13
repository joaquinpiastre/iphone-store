"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/config/site";
import { api } from "@/lib/api";

type Currency = "ARS" | "USD";

interface SiteState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  usdRate: number;
  whatsapp: string;
  /** Link de WhatsApp con mensaje prearmado */
  wa: (message?: string) => string;
}

const Ctx = createContext<SiteState | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("ARS");
  const [usdRate, setUsdRate] = useState<number>(siteConfig.defaultUsdRate);
  const [whatsapp, setWhatsapp] = useState<string>(siteConfig.whatsapp.number);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("currency");
      if (saved === "ARS" || saved === "USD") setCurrencyState(saved);
    } catch {}
    api<{ usdRate: number; whatsapp: string }>("/api/settings/public")
      .then((s) => {
        if (s.usdRate > 0) setUsdRate(s.usdRate);
        if (s.whatsapp) setWhatsapp(s.whatsapp);
      })
      .catch(() => {});
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem("currency", c);
    } catch {}
  }, []);

  const value = useMemo<SiteState>(
    () => ({
      currency,
      setCurrency,
      usdRate,
      whatsapp,
      wa: (message = siteConfig.whatsapp.defaultMessage) =>
        `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`,
    }),
    [currency, setCurrency, usdRate, whatsapp],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSite() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSite fuera de SiteProvider");
  return v;
}
