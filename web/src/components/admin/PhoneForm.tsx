"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { CONDITION_LABEL, STATUS_LABEL, type Condition, type Phone, type PhoneImage, type PhoneStatus } from "@/lib/types";
import { ImageDropzone } from "./ImageDropzone";
import { Field, btnGhost, btnPrimary, inputCls, selectCls } from "./ui";

const MODELS = [
  "iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
  "iPhone 17", "iPhone 17 Air", "iPhone 17 Pro", "iPhone 17 Pro Max",
];
const ACCESSORIES = ["Caja", "Cargador", "Cable USB-C", "Cable Lightning", "Auriculares", "Funda", "Vidrio templado"];

interface FormState {
  model: string;
  storageGb: string;
  color: string;
  condition: Condition;
  batteryHealth: string;
  imei: string;
  accessories: string[];
  warrantyMonths: string;
  priceUsd: string;
  costUsd: string;
  description: string;
  featured: boolean;
  status: PhoneStatus;
  images: PhoneImage[];
}

function fromPhone(p?: Phone): FormState {
  return {
    model: p?.model ?? "",
    storageGb: p ? String(p.storageGb) : "128",
    color: p?.color ?? "",
    condition: p?.condition ?? "USED",
    batteryHealth: p?.batteryHealth != null ? String(p.batteryHealth) : "",
    imei: p?.imei ?? "",
    accessories: p?.accessories ?? [],
    warrantyMonths: p ? String(p.warrantyMonths) : "3",
    priceUsd: p ? String(p.priceUsd) : "",
    costUsd: p ? String(p.costUsd ?? 0) : "",
    description: p?.description ?? "",
    featured: p?.featured ?? false,
    status: p?.status ?? "AVAILABLE",
    images: p?.images ?? [],
  };
}

export function PhoneForm({ phone }: { phone?: Phone }) {
  const router = useRouter();
  const [f, setF] = useState<FormState>(() => fromPhone(phone));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = {
      model: f.model,
      storageGb: Number(f.storageGb),
      color: f.color,
      condition: f.condition,
      batteryHealth: f.condition === "NEW" && !f.batteryHealth ? 100 : f.batteryHealth === "" ? null : Number(f.batteryHealth),
      imei: f.imei || null,
      accessories: f.accessories,
      warrantyMonths: Number(f.warrantyMonths || 0),
      priceUsd: Number(f.priceUsd),
      costUsd: Number(f.costUsd || 0),
      description: f.description || null,
      featured: f.featured,
      status: f.status,
      images: f.images.map((i) => ({ url: i.url, publicId: i.publicId ?? null })),
    };
    try {
      if (phone) await api(`/api/admin/phones/${phone.id}`, { method: "PUT", body: JSON.stringify(body) });
      else await api("/api/admin/phones", { method: "POST", body: JSON.stringify(body) });
      router.push("/admin/telefonos");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar");
      setSaving(false);
    }
  }

  const toggleAcc = (a: string) =>
    set("accessories", f.accessories.includes(a) ? f.accessories.filter((x) => x !== a) : [...f.accessories, a]);

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-8">
      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Modelo">
          <input required list="models" className={inputCls} value={f.model} onChange={(e) => set("model", e.target.value)} />
          <datalist id="models">
            {MODELS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </Field>
        <Field label="Almacenamiento (GB)">
          <select className={selectCls} value={f.storageGb} onChange={(e) => set("storageGb", e.target.value)}>
            {[64, 128, 256, 512, 1024, 2048].map((s) => (
              <option key={s} value={s}>
                {s} GB
              </option>
            ))}
          </select>
        </Field>
        <Field label="Color">
          <input required className={inputCls} value={f.color} onChange={(e) => set("color", e.target.value)} />
        </Field>
        <Field label="Estado">
          <select className={selectCls} value={f.condition} onChange={(e) => set("condition", e.target.value as Condition)}>
            {Object.entries(CONDITION_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Batería (%)">
          <input type="number" min={0} max={100} className={inputCls} value={f.batteryHealth} onChange={(e) => set("batteryHealth", e.target.value)} />
        </Field>
        <Field label="IMEI" hint="Solo visible en el panel">
          <input className={inputCls} value={f.imei} onChange={(e) => set("imei", e.target.value)} />
        </Field>
        <Field label="Precio de venta (USD)">
          <input required type="number" min={0} className={inputCls} value={f.priceUsd} onChange={(e) => set("priceUsd", e.target.value)} />
        </Field>
        <Field label="Costo de compra (USD)">
          <input type="number" min={0} className={inputCls} value={f.costUsd} onChange={(e) => set("costUsd", e.target.value)} />
        </Field>
        <Field label="Garantía (meses)">
          <input type="number" min={0} className={inputCls} value={f.warrantyMonths} onChange={(e) => set("warrantyMonths", e.target.value)} />
        </Field>
        <Field label="Disponibilidad">
          <select className={selectCls} value={f.status} onChange={(e) => set("status", e.target.value as PhoneStatus)}>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <section>
        <p className="mb-2 text-xs uppercase tracking-widest text-white/40">Accesorios incluidos</p>
        <div className="flex flex-wrap gap-2">
          {ACCESSORIES.map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => toggleAcc(a)}
              aria-pressed={f.accessories.includes(a)}
              className={`rounded-full border px-3.5 py-1.5 text-sm ${
                f.accessories.includes(a) ? "border-white bg-white text-black" : "border-white/15 text-white/70"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      <Field label="Descripción">
        <textarea rows={4} className={inputCls} value={f.description} onChange={(e) => set("description", e.target.value)} />
      </Field>

      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-white" />
        Destacado en la home
      </label>

      <section>
        <p className="mb-2 text-xs uppercase tracking-widest text-white/40">Fotos</p>
        <ImageDropzone images={f.images} onChange={(imgs) => set("images", imgs)} />
      </section>

      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? "Guardando…" : phone ? "Guardar cambios" : "Crear equipo"}
        </button>
        <button type="button" onClick={() => router.push("/admin/telefonos")} className={btnGhost}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
