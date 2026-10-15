"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, qs } from "@/lib/api";
import { fmtUsd } from "@/lib/format";
import {
  CONDITION_LABEL,
  STATUS_LABEL,
  type Paged,
  type Phone,
  type PhoneStatus,
} from "@/lib/types";
import { PhoneArt } from "@/components/ui/PhoneArt";
import { Pagination, PageHeader, btnGhost, btnPrimary, inputCls, selectCls, useDebounced } from "@/components/admin/ui";

export default function PhonesAdminPage() {
  const [data, setData] = useState<Paged<Phone> | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [condition, setCondition] = useState("");
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);

  const load = useCallback(() => {
    api<Paged<Phone>>(`/api/admin/phones${qs({ q: dq, status, condition, page, limit: 15 })}`)
      .then(setData)
      .catch(() => {});
  }, [dq, status, condition, page]);

  useEffect(load, [load]);
  useEffect(() => setPage(1), [dq, status, condition]);

  async function changeStatus(id: string, s: PhoneStatus) {
    await api(`/api/admin/phones/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: s }) });
    load();
  }

  async function remove(p: Phone) {
    if (!confirm(`¿Eliminar ${p.model} ${p.storageGb} GB ${p.color}? No se puede deshacer.`)) return;
    await api(`/api/admin/phones/${p.id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <PageHeader title="Teléfonos">
        <Link href="/admin/telefonos/nuevo" className={btnPrimary}>
          + Agregar
        </Link>
      </PageHeader>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_180px_180px]">
        <input className={inputCls} placeholder="Buscar modelo, color o IMEI…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select className={selectCls} value={condition} onChange={(e) => setCondition(e.target.value)}>
          <option value="">Nuevo / usado</option>
          {Object.entries(CONDITION_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-widest text-white/40">
            <tr>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Bat.</th>
              <th className="px-4 py-3">Venta</th>
              <th className="px-4 py-3">Costo</th>
              <th className="px-4 py-3">Disponibilidad</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {data?.items.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <Link href={`/admin/telefonos/${p.id}`} className="flex items-center gap-3">
                    <span className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-white/5">
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <PhoneArt color={p.color} />
                      )}
                    </span>
                    <span>
                      <span className="block font-medium">
                        {p.model} {p.featured && "★"}
                      </span>
                      <span className="text-xs text-white/45">
                        {p.storageGb} GB · {p.color}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">{CONDITION_LABEL[p.condition]}</td>
                <td className="px-4 py-3">{p.batteryHealth != null ? `${p.batteryHealth}%` : "—"}</td>
                <td className="px-4 py-3">{fmtUsd(p.priceUsd)}</td>
                <td className="px-4 py-3 text-white/50">{fmtUsd(p.costUsd ?? 0)}</td>
                <td className="px-4 py-3">
                  <select
                    value={p.status}
                    onChange={(e) => changeStatus(p.id, e.target.value as PhoneStatus)}
                    className="rounded-lg border border-white/15 bg-black px-2 py-1.5 text-xs"
                  >
                    {Object.entries(STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(p)} className={`${btnGhost} !px-3 !py-1.5 text-xs text-red-300`}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {data && data.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-white/40">
                  No hay equipos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
    </>
  );
}
