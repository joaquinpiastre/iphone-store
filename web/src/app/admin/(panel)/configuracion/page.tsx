"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Field, PageHeader, Toast, btnPrimary, inputCls, useToast } from "@/components/admin/ui";

interface Settings {
  usdRate: string;
  businessName: string;
  whatsapp: string;
  address: string;
  instagram: string;
}

export default function SettingsPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const { msg, show } = useToast();

  useEffect(() => {
    api<{ settings: Settings }>("/api/admin/settings")
      .then((r) => setS(r.settings))
      .catch(() => {});
  }, []);

  if (!s) return <div className="h-64 animate-pulse rounded-3xl bg-white/5" />;
  const set = (k: keyof Settings, v: string) => setS({ ...s, [k]: v });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/admin/settings", { method: "PUT", body: JSON.stringify(s) });
      show("Configuración guardada");
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Configuración" />
      <form onSubmit={save} className="max-w-xl space-y-5">
        <Field label="Cotización del dólar (ARS por US$ 1)" hint="Se usa para mostrar precios en pesos en toda la web.">
          <input required type="number" min={1} step="0.01" className={inputCls} value={s.usdRate} onChange={(e) => set("usdRate", e.target.value)} />
        </Field>
        <Field label="Nombre del negocio">
          <input required className={inputCls} value={s.businessName} onChange={(e) => set("businessName", e.target.value)} />
        </Field>
        <Field label="WhatsApp (con código de país, solo números)" hint="Ej: 5491155550000">
          <input required inputMode="numeric" className={inputCls} value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </Field>
        <Field label="Dirección">
          <input className={inputCls} value={s.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
        <Field label="Instagram (URL)">
          <input className={inputCls} value={s.instagram} onChange={(e) => set("instagram", e.target.value)} />
        </Field>
        <button disabled={saving} className={btnPrimary}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </form>
      <Toast message={msg} />
    </>
  );
}
