"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fmtDate, fmtUsd } from "@/lib/format";
import { PageHeader } from "@/components/admin/ui";
import { REQUEST_STATUS_LABEL, STATUS_LABEL, type PhoneStatus, type RequestStatus } from "@/lib/types";

interface Dashboard {
  stock: { available: number; reserved: number; sold: number };
  inventoryValueUsd: number;
  inventoryCostUsd: number;
  pendingRequests: number;
  recentPhones: { id: string; model: string; storageGb: number; color: string; status: PhoneStatus; updatedAt: string }[];
  recentRequests: { id: string; customerName: string; model: string; estimatedUsd: number; status: RequestStatus; createdAt: string }[];
}

function Stat({ label, value, sub, href }: { label: string; value: string; sub?: string; href?: string }) {
  const body = (
    <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-graphite-800 to-black p-5">
      <p className="text-xs uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default function DashboardPage() {
  const [d, setD] = useState<Dashboard | null>(null);
  useEffect(() => {
    api<Dashboard>("/api/admin/dashboard").then(setD).catch(() => {});
  }, []);

  if (!d) return <div className="h-64 animate-pulse rounded-3xl bg-white/5" />;

  return (
    <>
      <PageHeader title="Resumen" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="En stock" value={String(d.stock.available)} sub={`${d.stock.reserved} reservados · ${d.stock.sold} vendidos`} href="/admin/telefonos" />
        <Stat label="Valor inventario" value={fmtUsd(d.inventoryValueUsd)} sub="a precio de venta" />
        <Stat
          label="Ganancia potencial"
          value={fmtUsd(d.inventoryValueUsd - d.inventoryCostUsd)}
          sub={`costo ${fmtUsd(d.inventoryCostUsd)}`}
        />
        <Stat label="Canjes pendientes" value={String(d.pendingRequests)} href="/admin/solicitudes" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
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
