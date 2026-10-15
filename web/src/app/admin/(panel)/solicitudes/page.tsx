"use client";

import { useCallback, useEffect, useState } from "react";
import { api, qs } from "@/lib/api";
import { fmtDate, fmtUsd } from "@/lib/format";
import {
  BODY_LABEL,
  REQUEST_STATUS_LABEL,
  SCREEN_LABEL,
  type Paged,
  type RequestStatus,
  type TradeInRequest,
} from "@/lib/types";
import { PageHeader, Pagination, btnGhost, inputCls, selectCls, useDebounced } from "@/components/admin/ui";

const STATUS_STYLE: Record<RequestStatus, string> = {
  NEW: "bg-violet-glow/20 text-violet-200",
  CONTACTED: "bg-sky-400/15 text-sky-200",
  CLOSED: "bg-emerald-400/15 text-emerald-200",
  REJECTED: "bg-white/10 text-white/50",
};

export default function RequestsPage() {
  const [data, setData] = useState<Paged<TradeInRequest> | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);

  const load = useCallback(() => {
    api<Paged<TradeInRequest>>(`/api/admin/tradein/requests${qs({ q: dq, status, page, limit: 10 })}`)
      .then(setData)
      .catch(() => {});
  }, [dq, status, page]);
  useEffect(load, [load]);
  useEffect(() => setPage(1), [dq, status]);

  async function patch(id: string, body: { status?: RequestStatus; notes?: string }) {
    await api(`/api/admin/tradein/requests/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    if (body.status) load();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta solicitud?")) return;
    await api(`/api/admin/tradein/requests/${id}`, { method: "DELETE" });
    load();
  }

  const waLink = (r: TradeInRequest) => {
    const digits = r.contact.replace(/\D/g, "");
    const msg = `Hola ${r.customerName}! Te escribimos por tu cotización de canje del ${r.model} ${r.storageGb} GB (≈ ${fmtUsd(r.estimatedUsd)}).`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <>
      <PageHeader title="Solicitudes de canje" />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_200px]">
        <input className={inputCls} placeholder="Buscar cliente, teléfono o modelo…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todas</option>
          {Object.entries(REQUEST_STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {data?.items.map((r) => (
          <article key={r.id} className="rounded-2xl border border-white/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{r.customerName}</p>
                <p className="text-sm text-white/50">
                  {r.contact}
                  {r.email ? ` · ${r.email}` : ""} · {fmtDate(r.createdAt)}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${STATUS_STYLE[r.status]}`}>{REQUEST_STATUS_LABEL[r.status]}</span>
            </div>

            <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40">Entrega</p>
                <p className="font-medium">
                  {r.model} {r.storageGb} GB · {r.color}
                </p>
                <p className="text-white/50">
                  Pantalla {SCREEN_LABEL[r.screen]?.toLowerCase()} · Carcasa {BODY_LABEL[r.body]?.toLowerCase()} · Bat. {r.batteryPct}%
                </p>
                <p className="text-white/50">
                  {r.powersOn ? "Enciende" : "No enciende"} · Face ID {r.faceIdWorks ? "ok" : "falla"} ·{" "}
                  {r.hasBox ? "con caja" : "sin caja"} · {r.hasCharger ? "con cargador" : "sin cargador"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40">Cotización</p>
                <p className="text-2xl font-semibold">{fmtUsd(r.estimatedUsd)}</p>
                {r.targetPhone && (
                  <p className="text-white/50">
                    Quiere: {r.targetPhone.model} {r.targetPhone.storageGb} GB ({fmtUsd(r.targetPhone.priceUsd)}) · dif.{" "}
                    {r.differenceUsd !== null ? fmtUsd(r.differenceUsd) : "—"}
                  </p>
                )}
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-widest text-white/40">Notas internas</p>
                <textarea
                  rows={3}
                  defaultValue={r.notes ?? ""}
                  onBlur={(e) => e.target.value !== (r.notes ?? "") && patch(r.id, { notes: e.target.value })}
                  className={inputCls}
                  placeholder="Escribí una nota…"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <select
                value={r.status}
                onChange={(e) => patch(r.id, { status: e.target.value as RequestStatus })}
                className="rounded-full border border-white/20 bg-black px-3 py-2 text-sm"
              >
                {Object.entries(REQUEST_STATUS_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <a href={waLink(r)} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                Abrir WhatsApp
              </a>
              <button onClick={() => remove(r.id)} className={`${btnGhost} text-red-300`}>
                Eliminar
              </button>
            </div>
          </article>
        ))}
        {data && data.items.length === 0 && <p className="py-10 text-center text-white/40">No hay solicitudes.</p>}
      </div>
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
    </>
  );
}
