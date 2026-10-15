"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fmtDate, fmtUsd } from "@/lib/format";
import { Counter } from "@/components/motion/Counter";
import { PageHeader } from "@/components/admin/ui";
import { REQUEST_STATUS_LABEL, STATUS_LABEL, type PhoneStatus, type RequestStatus } from "@/lib/types";

interface DayCount {
  date: string; // YYYY-MM-DD (hora de Argentina)
  count: number;
}
interface ModelCount {
  model: string;
  count: number;
}
interface Stats {
  phones: { total: number; available: number; reserved: number; sold: number };
  sales: {
    last7Days: number;
    last30Days: number;
    revenue30DaysUsd: number;
    profit30DaysUsd: number;
    totalRevenueUsd: number;
    totalProfitUsd: number;
  };
  requests: {
    total: number;
    new: number;
    contacted: number;
    closed: number;
    rejected: number;
    last7Days: number;
    last30Days: number;
    closeRatePct: number;
  };
  daily: { requests: DayCount[]; sales: DayCount[] };
  topRequestedModels: ModelCount[];
  stockByModel: ModelCount[];
}
interface Dashboard {
  stock: { available: number; reserved: number; sold: number };
  inventoryValueUsd: number;
  inventoryCostUsd: number;
  pendingRequests: number;
  recentPhones: { id: string; model: string; storageGb: number; color: string; status: PhoneStatus; updatedAt: string }[];
  recentRequests: { id: string; customerName: string; model: string; estimatedUsd: number; status: RequestStatus; createdAt: string }[];
}

/** Tarjeta con un número que cuenta hasta su valor. */
function Stat({
  label,
  to,
  prefix,
  suffix,
  sub,
  href,
}: {
  label: string;
  to: number;
  prefix?: string;
  suffix?: string;
  sub?: string;
  href?: string;
}) {
  const body = (
    <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-graphite-800 to-black p-5 transition-colors hover:border-white/25">
      <p className="text-xs uppercase tracking-widest text-white/40">{label}</p>
      <Counter
        to={to}
        prefix={prefix}
        suffix={suffix}
        duration={1.4}
        className="mt-2 block text-3xl font-semibold tracking-tight tabular-nums"
      />
      {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm uppercase tracking-widest text-white/40">{title}</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{children}</div>
    </section>
  );
}

/** Barras por día (últimos 14). La de hoy va resaltada. */
function DailyBars({ title, data, unit }: { title: string; data: DayCount[]; unit: string }) {
  const total = data.reduce((a, d) => a + d.count, 0);
  const max = Math.max(1, ...data.map((d) => d.count));
  const label = (iso: string) => {
    const [, m, d] = iso.split("-");
    return `${d}/${m}`;
  };
  return (
    <div className="rounded-2xl border border-white/10 p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-white/40">
          <span className="font-mono text-white">{total}</span> en 14 días
        </p>
      </div>
      <div
        role="img"
        aria-label={`${title}: ${total} ${unit} en los últimos 14 días`}
        className="mt-5 flex h-28 items-end gap-1.5"
      >
        {data.map((d, i) => {
          const today = i === data.length - 1;
          return (
            <div
              key={d.date}
              title={`${label(d.date)}: ${d.count} ${unit}`}
              className="flex h-full flex-1 flex-col justify-end"
            >
              <div
                className={`w-full rounded-t-sm ${today ? "bg-white" : "bg-white/35"} ${d.count === 0 ? "opacity-40" : ""}`}
                style={{ height: d.count === 0 ? 2 : `${Math.max(6, (d.count / max) * 100)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-white/35">
        <span>{data[0] ? label(data[0].date) : ""}</span>
        <span>hoy</span>
      </div>
    </div>
  );
}

/** Ranking horizontal de modelos. */
function RankList({ title, items, empty }: { title: string; items: ModelCount[]; empty: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="rounded-2xl border border-white/10 p-5">
      <h3 className="mb-4 text-sm font-medium">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-white/40">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.model}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{i.model}</span>
                <span className="font-mono text-white/60">{i.count}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-white/70" style={{ width: `${(i.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [d, setD] = useState<Dashboard | null>(null);
  const [s, setS] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    api<Dashboard>("/api/admin/dashboard")
      .then(setD)
      .catch(() => setFailed(true));
    // Los contadores son un extra: si fallan, el resto del resumen se muestra igual.
    api<Stats>("/api/admin/stats")
      .then(setS)
      .catch(() => {});
  }, []);

  if (failed) {
    return (
      <>
        <PageHeader title="Resumen" />
        <p className="rounded-2xl border border-white/10 p-6 text-white/60">
          No pudimos cargar el resumen. Recargá la página en unos segundos.
        </p>
      </>
    );
  }
  if (!d) return <div className="h-64 animate-pulse rounded-3xl bg-white/5" />;

  return (
    <>
      <PageHeader title="Resumen" />

      <Group title="Inventario">
        <Stat
          label="En stock"
          to={d.stock.available}
          sub={`${d.stock.reserved} reservados · ${d.stock.sold} vendidos`}
          href="/admin/telefonos"
        />
        <Stat label="Reservados" to={d.stock.reserved} href="/admin/telefonos" />
        <Stat label="Valor inventario" to={d.inventoryValueUsd} prefix="US$ " sub="a precio de venta" />
        <Stat
          label="Ganancia potencial"
          to={d.inventoryValueUsd - d.inventoryCostUsd}
          prefix="US$ "
          sub={`costo ${fmtUsd(d.inventoryCostUsd)}`}
        />
      </Group>

      {s && (
        <>
          <Group title="Ventas">
            <Stat label="Vendidos · 7 días" to={s.sales.last7Days} />
            <Stat label="Vendidos · 30 días" to={s.sales.last30Days} sub={`${s.phones.sold} en total`} />
            <Stat label="Ingresos · 30 días" to={s.sales.revenue30DaysUsd} prefix="US$ " sub="a precio de lista" />
            <Stat
              label="Ganancia · 30 días"
              to={s.sales.profit30DaysUsd}
              prefix="US$ "
              sub={`${fmtUsd(s.sales.totalProfitUsd)} histórica`}
            />
          </Group>

          <Group title="Canjes">
            <Stat label="Solicitudes" to={s.requests.total} sub="desde el inicio" href="/admin/solicitudes" />
            <Stat
              label="Pendientes"
              to={s.requests.new}
              sub={`${s.requests.contacted} contactadas`}
              href="/admin/solicitudes"
            />
            <Stat label="Últimos 7 días" to={s.requests.last7Days} sub={`${s.requests.last30Days} en 30 días`} />
            <Stat
              label="Tasa de cierre"
              to={s.requests.closeRatePct}
              suffix="%"
              sub={`${s.requests.closed} cerradas · ${s.requests.rejected} rechazadas`}
            />
          </Group>
        </>
      )}

      {!s && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Canjes pendientes" to={d.pendingRequests} href="/admin/solicitudes" />
        </div>
      )}

      {s && (
        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          <DailyBars title="Solicitudes de canje por día" data={s.daily.requests} unit="solicitudes" />
          <DailyBars title="Ventas por día" data={s.daily.sales} unit="ventas" />
          <RankList
            title="Modelos más cotizados en canje"
            items={s.topRequestedModels}
            empty="Todavía no hay solicitudes."
          />
          <RankList title="Stock disponible por modelo" items={s.stockByModel} empty="Sin equipos disponibles." />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm uppercase tracking-widest text-white/40">Últimos movimientos</h2>
          <ul className="divide-y divide-white/10 rounded-2xl border border-white/10">
            {d.recentPhones.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/telefonos/${p.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/5">
                  <span className="text-sm">
                    {p.model} {p.storageGb} GB · {p.color}
                  </span>
                  <span className="shrink-0 text-xs text-white/45">
                    {STATUS_LABEL[p.status]} · {fmtDate(p.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
            {d.recentPhones.length === 0 && <li className="px-4 py-6 text-sm text-white/40">Sin equipos todavía.</li>}
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-sm uppercase tracking-widest text-white/40">Últimas solicitudes de canje</h2>
          <ul className="divide-y divide-white/10 rounded-2xl border border-white/10">
            {d.recentRequests.map((r) => (
              <li key={r.id}>
                <Link href="/admin/solicitudes" className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/5">
                  <span className="text-sm">
                    {r.customerName} · {r.model}
                  </span>
                  <span className="shrink-0 text-xs text-white/45">
                    {fmtUsd(r.estimatedUsd)} · {REQUEST_STATUS_LABEL[r.status]}
                  </span>
                </Link>
              </li>
            ))}
            {d.recentRequests.length === 0 && <li className="px-4 py-6 text-sm text-white/40">Sin solicitudes todavía.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
