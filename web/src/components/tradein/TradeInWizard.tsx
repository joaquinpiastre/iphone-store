"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { api, ApiError } from "@/lib/api";
import { useSite } from "@/components/providers/SiteProvider";
import { Counter } from "@/components/motion/Counter";
import { fmtArs, fmtUsd, phoneTitle } from "@/lib/format";
import { BODY_LABEL, SCREEN_LABEL, type CatalogResponse, type Phone, type QuoteResult } from "@/lib/types";

interface Options {
  models: { model: string; storages: number[] }[];
  colors: string[];
}

const STEPS = ["Equipo", "Estado", "Extras", "Resultado"];

function Choice({
  active,
  onClick,
  children,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border px-4 py-3.5 text-left transition-colors ${
        active ? "border-white bg-white text-black" : "border-white/15 hover:border-white/40"
      }`}
    >
      <span className="block text-sm font-medium">{children}</span>
      {hint && <span className={`block text-xs ${active ? "text-black/60" : "text-white/40"}`}>{hint}</span>}
    </button>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 px-4 py-3.5">
      <span className="text-sm">{label}</span>
      <div className="flex gap-2">
        <Choice active={value} onClick={() => onChange(true)}>Sí</Choice>
        <Choice active={!value} onClick={() => onChange(false)}>No</Choice>
      </div>
    </div>
  );
}

export function TradeInWizard() {
  const params = useSearchParams();
  const { wa, usdRate } = useSite();
  const [options, setOptions] = useState<Options | null>(null);
  const [step, setStep] = useState(0);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [form, setForm] = useState({
    model: "",
    storageGb: 0,
    color: "",
    screen: "perfect",
    body: "perfect",
    batteryPct: 90,
    powersOn: true,
    faceIdWorks: true,
    hasBox: true,
    hasCharger: true,
    targetPhoneId: "",
    customerName: "",
    contact: "",
    email: "",
    website: "",
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    api<Options>("/api/tradein/options").then(setOptions).catch(() => setOptions({ models: [], colors: [] }));
    api<CatalogResponse>("/api/phones?limit=100&sort=price_asc")
      .then((r) => setPhones(r.items))
      .catch(() => {});
    const target = params.get("target");
    if (target) {
      api<{ phone: Phone }>(`/api/phones/${target}`)
        .then(({ phone }) => setForm((f) => ({ ...f, targetPhoneId: phone.id })))
        .catch(() => {});
    }
  }, [params]);

  const storages = useMemo(
    () => options?.models.find((m) => m.model === form.model)?.storages ?? [],
    [options, form.model],
  );
  const target = phones.find((p) => p.id === form.targetPhoneId) ?? null;

  const canNext =
    step === 0 ? !!(form.model && form.storageGb && form.color) : step === 3 ? false : true;

  // Cotización al entrar al paso 4 (y si cambia algo)
  useEffect(() => {
    if (step !== 3) return;
    let cancelled = false;
    setQuote(null);
    setQuoteError(null);
    api<QuoteResult>("/api/tradein/quote", {
      method: "POST",
      body: JSON.stringify({
        model: form.model,
        storageGb: form.storageGb,
        color: form.color,
        screen: form.screen,
        body: form.body,
        batteryPct: form.batteryPct,
        powersOn: form.powersOn,
        faceIdWorks: form.faceIdWorks,
        hasBox: form.hasBox,
        hasCharger: form.hasCharger,
        targetPhoneId: form.targetPhoneId || null,
      }),
    })
      .then((q) => !cancelled && setQuote(q))
      .catch((e) => !cancelled && setQuoteError(e instanceof ApiError ? e.message : "No pudimos cotizar."));
    return () => {
      cancelled = true;
    };
  }, [step, form]);

  const yn = (v: boolean) => (v ? "Sí" : "No");
  const message = () =>
    [
      `Hola! Quiero cotizar mi canje 📱`,
      ``,
      `Mi equipo: ${form.model} ${form.storageGb} GB ${form.color}`,
      `• Pantalla: ${SCREEN_LABEL[form.screen]}`,
      `• Carcasa: ${BODY_LABEL[form.body]}`,
      `• Batería: ${form.batteryPct}%`,
      `• Enciende: ${yn(form.powersOn)} · Face ID: ${yn(form.faceIdWorks)}`,
      `• Caja: ${yn(form.hasBox)} · Cargador: ${yn(form.hasCharger)}`,
      quote ? `\nCotización estimada: ${fmtUsd(quote.estimatedUsd)} (≈ ${fmtArs(quote.estimatedUsd * usdRate)})` : "",
      target ? `Quiero cambiarlo por: ${phoneTitle(target)} (${fmtUsd(target.priceUsd)})` : "",
      quote && quote.differenceUsd !== null
        ? `Diferencia estimada: ${fmtUsd(Math.abs(quote.differenceUsd))}${quote.differenceUsd < 0 ? " a mi favor" : ""}`
        : "",
      ``,
      `Mi nombre: ${form.customerName}`,
    ]
      .filter((l) => l !== "")
      .join("\n");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSendError(null);
    try {
      await api("/api/tradein/requests", {
        method: "POST",
        body: JSON.stringify({ ...form, targetPhoneId: form.targetPhoneId || null }),
      });
      setSent(true);
    } catch (err) {
      setSendError(
        err instanceof ApiError && err.status === 429
          ? "Hiciste muchas solicitudes seguidas. Escribinos directo por WhatsApp."
          : "No pudimos guardar la solicitud, pero podés enviarla igual por WhatsApp.",
      );
    } finally {
      setSending(false);
      window.open(wa(message()), "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div>
      {/* progreso */}
      <ol className="mb-10 flex gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <div className={`h-1 rounded-full transition-colors ${i <= step ? "bg-white" : "bg-white/15"}`} />
            <span className={`mt-2 block text-xs ${i === step ? "text-white" : "text-white/40"}`}>{s}</span>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 && (
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-xl font-semibold">¿Qué modelo tenés?</h2>
                {!options ? (
                  <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {options.models.map((m) => (
                      <Choice
                        key={m.model}
                        active={form.model === m.model}
                        onClick={() => setForm((f) => ({ ...f, model: m.model, storageGb: 0 }))}
                      >
                        {m.model}
                      </Choice>
                    ))}
                  </div>
                )}
              </div>
              {form.model && (
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Almacenamiento</h2>
                  <div className="flex flex-wrap gap-3">
                    {storages.map((s) => (
                      <Choice key={s} active={form.storageGb === s} onClick={() => set("storageGb", s)}>
                        {s} GB
                      </Choice>
                    ))}
                  </div>
                </div>
              )}
              {form.storageGb > 0 && (
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Color</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {options?.colors.map((c) => (
                      <Choice key={c} active={form.color === c} onClick={() => set("color", c)}>
                        {c}
                      </Choice>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-xl font-semibold">Estado de la pantalla</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {Object.entries(SCREEN_LABEL).map(([k, v]) => (
                    <Choice key={k} active={form.screen === k} onClick={() => set("screen", k)}>
                      {v}
                    </Choice>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="mb-4 text-xl font-semibold">Estado de la carcasa</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {Object.entries(BODY_LABEL).map(([k, v]) => (
                    <Choice key={k} active={form.body === k} onClick={() => set("body", k)}>
                      {v}
                    </Choice>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="mb-2 text-xl font-semibold">
                  Salud de batería: <span className="font-mono">{form.batteryPct}%</span>
                </h2>
                <p className="mb-4 text-sm text-white/45">Ajustes → Batería → Estado de la batería.</p>
                <input
                  type="range"
                  min={60}
                  max={100}
                  value={form.batteryPct}
                  onChange={(e) => set("batteryPct", Number(e.target.value))}
                  className="w-full accent-white"
                  aria-label="Salud de batería"
                />
              </div>
              <div className="space-y-3">
                <Toggle label="¿Enciende correctamente?" value={form.powersOn} onChange={(v) => set("powersOn", v)} />
                <Toggle label="¿Funciona Face ID?" value={form.faceIdWorks} onChange={(v) => set("faceIdWorks", v)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="space-y-3">
                <Toggle label="¿Tenés la caja original?" value={form.hasBox} onChange={(v) => set("hasBox", v)} />
                <Toggle label="¿Tenés cargador / cable?" value={form.hasCharger} onChange={(v) => set("hasCharger", v)} />
              </div>
              <div>
                <h2 className="mb-2 text-xl font-semibold">¿Por cuál lo querés cambiar? (opcional)</h2>
                <p className="mb-4 text-sm text-white/45">Te mostramos la diferencia a pagar.</p>
                <select
                  value={form.targetPhoneId}
                  onChange={(e) => set("targetPhoneId", e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-black px-4 py-3.5 text-sm outline-none focus:border-white/50"
                >
                  <option value="">Solo quiero saber cuánto vale</option>
                  {phones.map((p) => (
                    <option key={p.id} value={p.id}>
                      {phoneTitle(p)} — {fmtUsd(p.priceUsd)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              {quoteError ? (
                <p className="rounded-2xl border border-white/10 p-6 text-white/70">{quoteError}</p>
              ) : !quote ? (
                <div className="h-48 animate-pulse rounded-3xl bg-white/5" />
              ) : (
                <div className="space-y-8">
                  <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-graphite-800 to-black p-8">
                    <p className="text-sm text-white/50">Te tomamos tu {form.model} en aproximadamente</p>
                    <Counter
                      to={quote.estimatedUsd}
                      prefix="US$ "
                      className="text-gradient-aurora block text-6xl font-semibold tracking-tighter md:text-8xl"
                    />
                    <p className="mt-1 text-white/45">≈ {fmtArs(quote.estimatedUsd * usdRate)}</p>

                    {quote.lines.length > 0 && (
                      <ul className="mt-6 space-y-1.5 border-t border-white/10 pt-5 text-sm text-white/55">
                        {quote.lines.map((l) => (
                          <li key={l.label} className="flex justify-between">
                            <span>{l.label}</span>
                            <span className="font-mono">−{l.discountPct}%</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {quote.target && quote.differenceUsd !== null && (
                      <div className="mt-6 border-t border-white/10 pt-5">
                        <p className="text-sm text-white/50">
                          Diferencia para llevarte el {quote.target.model} {quote.target.storageGb} GB
                        </p>
                        <p className="mt-1 text-3xl font-semibold tracking-tight">
                          {quote.differenceUsd >= 0
                            ? `${fmtUsd(quote.differenceUsd)} a pagar`
                            : `${fmtUsd(-quote.differenceUsd)} a tu favor`}
                        </p>
                        <p className="text-sm text-white/45">≈ {fmtArs(Math.abs(quote.differenceUsd) * usdRate)}</p>
                      </div>
                    )}
                  </div>

                  {sent ? (
                    <div className="rounded-2xl border border-white/15 p-6">
                      <p className="font-medium">¡Listo! Recibimos tu solicitud.</p>
                      <p className="mt-1 text-sm text-white/55">
                        Te abrimos WhatsApp con el detalle. Si no se abrió,{" "}
                        <a className="underline" href={wa(message())} target="_blank" rel="noopener noreferrer">
                          tocá acá
                        </a>
                        .
                      </p>
                      {sendError && <p className="mt-3 text-sm text-amber-300">{sendError}</p>}
                    </div>
                  ) : (
                    <form onSubmit={submit} className="space-y-4">
                      <h2 className="text-xl font-semibold">Enviá tu cotización</h2>
                      <input
                        required
                        minLength={2}
                        placeholder="Tu nombre"
                        value={form.customerName}
                        onChange={(e) => set("customerName", e.target.value)}
                        className="w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3.5 outline-none focus:border-white/50"
                      />
                      <input
                        required
                        minLength={6}
                        inputMode="tel"
                        placeholder="Tu WhatsApp / teléfono"
                        value={form.contact}
                        onChange={(e) => set("contact", e.target.value)}
                        className="w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3.5 outline-none focus:border-white/50"
                      />
                      <input
                        type="email"
                        placeholder="Email (opcional)"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        className="w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3.5 outline-none focus:border-white/50"
                      />
                      {/* honeypot */}
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden
                        value={form.website}
                        onChange={(e) => set("website", e.target.value)}
                        className="absolute -left-[9999px] h-0 w-0 opacity-0"
                      />
                      <button
                        type="submit"
                        disabled={sending}
                        className="w-full rounded-full bg-white px-7 py-4 text-sm font-medium text-black transition-transform hover:scale-[1.02] disabled:opacity-60"
                      >
                        {sending ? "Enviando…" : "Enviar por WhatsApp"}
                      </button>
                      <p className="text-xs text-white/35">
                        Valor estimado. El precio final se confirma al revisar el equipo en persona.
                      </p>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-full border border-white/20 px-6 py-3 text-sm disabled:opacity-0"
        >
          Atrás
        </button>
        {step < 3 && (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            className="rounded-full bg-white px-8 py-3 text-sm font-medium text-black disabled:opacity-30"
          >
            {step === 2 ? "Ver cotización" : "Siguiente"}
          </button>
        )}
      </div>
    </div>
  );
}
