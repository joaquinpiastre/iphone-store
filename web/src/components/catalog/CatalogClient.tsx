"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api, qs } from "@/lib/api";
import { CONDITION_LABEL, type CatalogResponse, type Condition } from "@/lib/types";
import { PhoneCard } from "@/components/ui/PhoneCard";
import { useSite } from "@/components/providers/SiteProvider";

const LIST_KEYS = ["model", "storage", "color", "condition"] as const;
type ListKey = (typeof LIST_KEYS)[number];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active ? "border-white bg-white text-black" : "border-white/15 text-white/70 hover:border-white/40"
      }`}
    >
      {children}
    </button>
  );
}

export function CatalogClient() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { usdRate, currency } = useSite();
  const [data, setData] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [drawer, setDrawer] = useState(false);

  const spKey = sp.toString();
  const get = (k: string) => sp.get(k) ?? "";
  const list = (k: ListKey) => get(k).split(",").filter(Boolean);

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(spKey);
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      if (!("page" in patch)) next.delete("page");
      router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
    },
    [router, pathname, spKey],
  );

  const toggle = (k: ListKey, value: string) => {
    const cur = list(k);
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    update({ [k]: next.join(",") });
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    api<CatalogResponse>(`/api/phones${qs({ ...Object.fromEntries(new URLSearchParams(spKey)), limit: 12 })}`)
      .then((r) => !cancelled && setData(r))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [spKey]);

  const activeCount = useMemo(
    () => LIST_KEYS.reduce((n, k) => n + list(k).length, 0) + (get("minBattery") ? 1 : 0) + (get("minPrice") || get("maxPrice") ? 1 : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spKey],
  );

  const facets = data?.facets;

  const filters = (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-white/40">Modelo</p>
        <div className="flex flex-wrap gap-2">
          {facets?.models.map((m) => (
            <Chip key={m} active={list("model").includes(m)} onClick={() => toggle("model", m)}>
              {m.replace("iPhone ", "")}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-white/40">Almacenamiento</p>
        <div className="flex flex-wrap gap-2">
          {facets?.storages.map((s) => (
            <Chip key={s} active={list("storage").includes(String(s))} onClick={() => toggle("storage", String(s))}>
              {s} GB
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-white/40">Color</p>
        <div className="flex flex-wrap gap-2">
          {facets?.colors.map((c) => (
            <Chip key={c} active={list("color").includes(c)} onClick={() => toggle("color", c)}>
              {c}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-white/40">Estado</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CONDITION_LABEL) as Condition[]).map((c) => (
            <Chip key={c} active={list("condition").includes(c)} onClick={() => toggle("condition", c)}>
              {CONDITION_LABEL[c]}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-white/40">Batería mínima</p>
        <div className="flex flex-wrap gap-2">
          {["", "80", "85", "90", "95"].map((b) => (
            <Chip key={b} active={get("minBattery") === b} onClick={() => update({ minBattery: b })}>
              {b ? `${b}%+` : "Cualquiera"}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-white/40">
          Precio (USD){currency === "ARS" ? ` · 1 US$ = $${usdRate.toLocaleString("es-AR")}` : ""}
        </p>
        <div className="flex items-center gap-2">
          {(["minPrice", "maxPrice"] as const).map((k, i) => (
            <input
              key={`${k}-${get(k)}`}
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={i === 0 ? `Desde ${facets?.minPrice ?? ""}` : `Hasta ${facets?.maxPrice ?? ""}`}
              defaultValue={get(k)}
              onBlur={(e) => update({ [k]: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/50"
            />
          ))}
        </div>
      </div>
      {activeCount > 0 && (
        <button
          onClick={() => router.replace(pathname, { scroll: false })}
          className="text-sm text-white/60 underline underline-offset-4 hover:text-white"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      {/* filtros desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">{filters}</div>
      </aside>

      <div>
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={() => setDrawer(true)}
            className="rounded-full border border-white/20 px-4 py-2 text-sm lg:hidden"
          >
            Filtros{activeCount ? ` (${activeCount})` : ""}
          </button>
          <p className="text-sm text-white/50">{data ? `${data.total} equipos` : "Cargando…"}</p>
          <select
            value={get("sort") || "newest"}
            onChange={(e) => update({ sort: e.target.value === "newest" ? null : e.target.value })}
            className="rounded-full border border-white/20 bg-black px-4 py-2 text-sm outline-none"
            aria-label="Ordenar"
          >
            <option value="newest">Novedades</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
            <option value="battery">Mejor batería</option>
          </select>
        </div>

        {error && (
          <p className="rounded-2xl border border-white/10 p-8 text-white/60">
            No pudimos cargar el catálogo. Probá de nuevo en un momento.
          </p>
        )}

        <div className={`grid gap-5 sm:grid-cols-2 xl:grid-cols-3 ${loading ? "opacity-60" : ""} transition-opacity`}>
          {data?.items.map((p) => <PhoneCard key={p.id} phone={p} />)}
        </div>

        {data && data.items.length === 0 && !error && (
          <p className="rounded-2xl border border-white/10 p-8 text-white/60">
            No hay equipos con esos filtros. Probá con otros o escribinos por WhatsApp.
          </p>
        )}

        {data && data.pages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              disabled={data.page <= 1}
              onClick={() => update({ page: String(data.page - 1) })}
              className="rounded-full border border-white/20 px-5 py-2 text-sm disabled:opacity-30"
            >
              ← Anterior
            </button>
            <span className="text-sm text-white/50">
              {data.page} / {data.pages}
            </span>
            <button
              disabled={data.page >= data.pages}
              onClick={() => update({ page: String(data.page + 1) })}
              className="rounded-full border border-white/20 px-5 py-2 text-sm disabled:opacity-30"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* drawer mobile */}
      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-graphite-900 p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-lg font-semibold">Filtros</p>
              <button onClick={() => setDrawer(false)} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
                Ver {data?.total ?? ""} equipos
              </button>
            </div>
            {filters}
          </div>
        </div>
      )}
    </div>
  );
}
