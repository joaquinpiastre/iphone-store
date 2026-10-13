import { SplitText } from "@/components/motion/SplitText";

export const FAQS = [
  { q: "¿Los equipos tienen garantía?", a: "Sí. Todos incluyen garantía propia por escrito: los nuevos hasta 12 meses y los usados/seminuevos entre 1 y 6 meses según el equipo." },
  { q: "¿Cómo funciona el plan canje?", a: "Cotizás tu iPhone en la web, te damos un precio estimado y la diferencia contra el equipo que elijas. Confirmamos el valor final al revisarlo en persona." },
  { q: "¿Hacen envíos?", a: "Sí, enviamos a todo el país asegurados y con seguimiento. También podés retirar por el local." },
  { q: "¿Qué medios de pago aceptan?", a: "Efectivo, transferencia, tarjetas de crédito y débito, y opciones de financiación. Consultanos por WhatsApp." },
  { q: "¿Los iPhone usados están testeados?", a: "Cada equipo pasa más de 40 controles: pantalla, cámaras, Face ID, batería, sensores y conectividad. Te mostramos el estado de batería real." },
  { q: "¿Son equipos liberados?", a: "Sí, todos los equipos se entregan liberados y listos para usar con cualquier operador." },
];

export function Faq() {
  return (
    <section id="faq" className="bg-black px-5 py-28 md:px-8 md:py-40">
      <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-[1fr_1.4fr]">
        <SplitText
          as="h2"
          text="Preguntas frecuentes"
          className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
        />
        <div className="divide-y divide-white/10 border-y border-white/10">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-2xl text-white/40 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-xl text-white/55">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
