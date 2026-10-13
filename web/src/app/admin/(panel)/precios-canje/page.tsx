"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { fmtUsd } from "@/lib/format";
import type { QuoteResult } from "@/lib/types";
import { BODY_LABEL, SCREEN_LABEL } from "@/lib/types";
import { PageHeader, Toast, btnGhost, btnPrimary, inputCls, useDebounced, useToast } from "@/components/admin/ui";

interface Price {
  id: string;
  model: string;
  storageGb: number;
  basePriceUsd: number;
}
interface Modifier {
  id: string;
  group: string;
  option: string;
  label: string;
  discountPct: number;
}

const GROUP_LABEL: Record<string, string> = {
  screen: "Pantalla",
  body: "Carcasa",
  battery: "Batería",
  power: "Enciende",
  faceid: "Face ID",
  box: "Caja",
  charger: "Cargador",
};

function NumberCell({ value, onSave, suffix }: { value: number; onSave: (n: number) => void; suffix?: string }) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);
  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="number"
        min={0}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => {
          const n = Number(v);
          if (Number.isFinite(n) && n >= 0 && n !== value) onSave(Math.round(n));
          else setV(String(value));
        }}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className="w-24 rounded-lg border border-white/15 bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-white/50"
      />
      {suffix && <span className="text-xs text-white/40">{suffix}</span>}
    </span>
  );
}

export default function TradeInPricesPage() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [mods, setMods] = useState<Modifier[]>([]);
  const [version, setVersion] = useState(0);
  const { msg, show } = useToast();
  const [newRow, setNewRow] = useState({ model: "", storageGb: "128", basePriceUsd: "" });

  const load = useCallback(async () => {
    const [p, m] = await Promise.all([
      api<{ items: Price[] }>("/api/admin/tradein/prices"),
      api<{ items: Modifier[] }>("/api/admin/tradein/modifiers"),
    ]);
    setPrices(p.items);
    setMods(m.items);
  }, []);
  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const savePrice = async (id: string, basePriceUsd: number) => {
    await api(`/api/admin/tradein/prices/${id}`, { method: "PUT", body: JSON.stringify({ basePriceUsd }) });
    setPrices((ps) => ps.map((p) => (p.id === id ? { ...p, basePriceUsd } : p)));
    setVersion((v) => v + 1);
    show("Guardado");
  };
  const saveMod = async (id: string, discountPct: number) => {
    await api(`/api/admin/tradein/modifiers/${id}`, { method: "PUT", body: JSON.stringify({ discountPct }) });
    setMods((ms) => ms.map((m) => (m.id === id ? { ...m, discountPct } : m)));
    setVersion((v) => v + 1);
    show("Guardado");
  };
  const removePrice = async (p: Price) => {
    if (!confirm(`¿Quitar ${p.model} ${p.storageGb} GB de la tabla?`)) return;
    await api(`/api/admin/tradein/prices/${p.id}`, { method: "DELETE" });
    load();
  };
  const addPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/api/admin/tradein/prices", {
        method: "POST",
        body: JSON.stringify({
          model: newRow.model,
          storageGb: Number(newRow.storageGb),
          basePriceUsd: Number(newRow.basePriceUsd),
        }),
      });
      setNewRow({ model: "", storageGb: "128", basePriceUsd: "" });
      load();
      show("Agregado");
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Error");
    }
  };

  const grouped = useMemo(() => {
    const m = new Map<string, Price[]>();
    prices.forEach((p) => m.set(p.model, [...(m.get(p.model) ?? []), p]));
    return [...m.entries()];
  }, [prices]);

  const modGroups = useMemo(() => {
    const m = new Map<string, Modifier[]>();
    mods.forEach((x) => m.set(x.group, [...(m.get(x.group) ?? []), x]));
    return [...m.entries()];
  }, [mods]);

  return (
    <>
      <PageHeader title="Precios de canje" />
      <div className="grid gap-10 xl:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          {/* precios base */}
          <section>
            <h2 className="mb-1 text-lg font-semibold">Precio base que tomamos (USD)</h2>
            <p className="mb-4 text-sm text-white/45">Editá el valor y salí del campo (o Enter) para guardar.</p>
            <div className="divide-y divide-white/10 rounded-2xl border border-white/10">
              {grouped.map(([model, rows]) => (
                <div key={model} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
                  <p className="w-40 font-medium">{model}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {rows.map((r) => (
                      <div key={r.id} className="flex items-center gap-2 text-sm">
                        <span className="w-14 text-white/50">{r.storageGb} GB</span>
                        <NumberCell value={r.basePriceUsd} onSave={(n) => savePrice(r.id, n)} suffix="US$" />
                        <button onClick={() => removePrice(r)} className="text-xs text-red-300/70 hover:text-red-300" aria-label="Quitar">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={addPrice} className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px_140px_auto]">
              <input required placeholder="Modelo (ej: iPhone 15 Pro)" className={inputCls} value={newRow.model} onChange={(e) => setNewRow({ ...newRow, model: e.target.value })} />
              <select className={`${inputCls} bg-black`} value={newRow.storageGb} onChange={(e) => setNewRow({ ...newRow, storageGb: e.target.value })}>
                {[64, 128, 256, 512, 1024].map((s) => (
                  <option key={s} value={s}>
                    {s} GB
                  </option>
                ))}
              </select>
              <input required type="number" min={0} placeholder="Precio US$" className={inputCls} value={newRow.basePriceUsd} onChange={(e) => setNewRow({ ...newRow, basePriceUsd: e.target.value })} />
              <button className={btnPrimary}>Agregar</button>
            </form>
          </section>

          {/* modificadores */}
          <section>
            <h2 className="mb-1 text-lg font-semibold">Descuentos por estado (%)</h2>
            <p className="mb-4 text-sm text-white/45">Se suman y se descuentan del precio base (máximo 90%).</p>
            <div className="grid gap-4 md:grid-cols-2">
              {modGroups.map(([group, items]) => (
                <div key={group} className="rounded-2xl border border-white/10 p-4">
                  <p className="mb-3 text-xs uppercase tracking-widest text-white/40">{GROUP_LABEL[group] ?? group}</p>
                  <div className="space-y-2">
                    {items.map((m) => (
                      <div key={m.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-white/75">{m.label}</span>
                        <NumberCell value={m.discountPct} onSave={(n) => saveMod(m.id, Math.min(100, n))} suffix="%" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <Preview prices={prices} version={version} />
      </div>
      <Toast message={msg} />
    </>
  );
}

function Preview({ prices, version }: { prices: Price[]; version: number }) {
  const models = useMemo(() => [...new Set(prices.map((p) => p.model))], [prices]);
  const [s, setS] = useState({
    model: "",
    storageGb: 0,
    screen: "perfect",
    body: "perfect",
    batteryPct: 90,
    powersOn: true,
    faceIdWorks: true,
    hasBox: true,
    hasCharger: true,
  });
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const deb = useDebounced(s, 250);

  const storages = prices.filter((p) => p.model === s.model).map((p) => p.storageGb);

  useEffect(() => {
    if (!deb.model || !deb.storageGb) return;
    api<QuoteResult>("/api/tradein/quote", { method: "POST", body: JSON.stringify({ ...deb, color: "-" }) })
      .then((q) => {
        setQuote(q);
        setErr(null);
      })
      .catch((e) => {
        setQuote(null);
        setErr(e instanceof ApiError ? e.message : "Error");
      });
  }, [deb, version]);

  return (
    <aside className="xl:sticky xl:top-8 xl:self-start">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-graphite-800 to-black p-5">
        <h2 className="mb-4 text-lg font-semibold">Vista previa de cotización</h2>
        <div className="space-y-3">
          <select
            className={`${inputCls} bg-black`}
            value={s.model}
            onChange={(e) => {
              const m = e.target.value;
              const first = prices.find((p) => p.model === m)?.storageGb ?? 0;
              setS({ ...s, model: m, storageGb: first });
            }}
          >
            <option value="">Elegí un modelo</option>
            {models.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select className={`${inputCls} bg-black`} value={s.storageGb} onChange={(e) => setS({ ...s, storageGb: Number(e.target.value) })}>
            {storages.map((g) => (
              <option key={g} value={g}>
                {g} GB
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select className={`${inputCls} bg-black`} value={s.screen} onChange={(e) => setS({ ...s, screen: e.target.value })}>
              {Object.entries(SCREEN_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  Pantalla: {v}
                </option>
              ))}
            </select>
            <select className={`${inputCls} bg-black`} value={s.body} onChange={(e) => setS({ ...s, body: e.target.value })}>
              {Object.entries(BODY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  Carcasa: {v}
                </option>
              ))}
            </select>
          </div>
          <label className="block text-sm text-white/60">
            Batería: <span className="font-mono text-white">{s.batteryPct}%</span>
            <input type="range" min={60} max={100} value={s.batteryPct} onChange={(e) => setS({ ...s, batteryPct: Number(e.target.value) })} className="mt-1 w-full accent-white" />
          </label>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {(
              [
                ["powersOn", "Enciende"],
                ["faceIdWorks", "Face ID"],
                ["hasBox", "Caja"],
                ["hasCharger", "Cargador"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2">
                <input type="checkbox" className="accent-white" checked={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.checked })} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          {err && <p className="text-sm text-amber-300">{err}</p>}
          {quote ? (
            <>
              <p className="text-xs text-white/40">Base {fmtUsd(quote.basePriceUsd)} · −{quote.totalDiscountPct}%</p>
              <p className="text-4xl font-semibold tracking-tight">{fmtUsd(quote.estimatedUsd)}</p>
              <ul className="mt-2 space-y-0.5 text-xs text-white/45">
                {quote.lines.map((l) => (
                  <li key={l.label}>
                    {l.label}: −{l.discountPct}%
                  </li>
                ))}
              </ul>
            </>
          ) : (
            !err && <p className="text-sm text-white/40">Elegí un modelo para ver la cotización.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
