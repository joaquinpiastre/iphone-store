import { SplitText } from "@/components/motion/SplitText";

// Reemplazá por testimonios reales de tus clientes.
const items = [
  { name: "Martín G.", text: "Entregué mi 12 y salí con un 15 Pro el mismo día. Cero vueltas.", model: "iPhone 15 Pro" },
  { name: "Lucía P.", text: "Me mandaron fotos reales y el estado de batería exacto. Llegó impecable.", model: "iPhone 14" },
  { name: "Nicolás R.", text: "La cotización del canje fue justa y la diferencia, clarísima.", model: "iPhone 16" },
  { name: "Camila S.", text: "Compré por WhatsApp, me asesoraron súper bien y el envío llegó en 48 hs.", model: "iPhone 13" },
  { name: "Joaquín V.", text: "Tercera vez que compro acá. Garantía respetada sin ningún problema.", model: "iPhone 15" },
];

export function Testimonials() {
  return (
    <section className="bg-black py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SplitText
          as="h2"
          text="Lo dicen quienes ya cambiaron."
          className="mb-12 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
        />
      </div>
      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 md:px-[max(2rem,calc((100vw-80rem)/2+2rem))] [scrollbar-width:none]">
        {items.map((t) => (
          <figure
            key={t.name}
            className="w-[82vw] max-w-sm shrink-0 snap-start rounded-3xl border border-white/10 bg-gradient-to-b from-graphite-800 to-black p-7"
          >
            <p className="text-lg leading-relaxed text-white/85">“{t.text}”</p>
            <figcaption className="mt-8 text-sm">
              <span className="font-medium">{t.name}</span>
              <span className="text-white/40"> · {t.model}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
