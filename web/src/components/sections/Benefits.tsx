import { SplitText } from "@/components/motion/SplitText";
import { TiltCard } from "@/components/motion/TiltCard";

const items = [
  { title: "Garantía real", text: "Hasta 12 meses según el equipo, por escrito y con respaldo.", span: "md:col-span-2 md:row-span-2", big: "12" , unit: "meses" },
  { title: "Envíos a todo el país", text: "Despachamos asegurado y con seguimiento.", span: "", big: "24h", unit: "despacho" },
  { title: "Financiación", text: "Cuotas con tarjeta y opciones a tu medida. Consultanos.", span: "", big: "6", unit: "cuotas" },
  { title: "Equipos testeados", text: "Más de 40 puntos de control antes de salir.", span: "md:col-span-2", big: "40+", unit: "controles" },
];

export function Benefits() {
  return (
    <section id="beneficios" className="bg-black px-5 py-28 md:px-8 md:py-40">
      <div className="mx-auto max-w-7xl">
        <SplitText
          as="h2"
          text="Comprar un iPhone tiene que ser tranquilo."
          className="mb-14 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
        />
        <div className="grid auto-rows-[minmax(190px,auto)] gap-4 md:grid-cols-4">
          {items.map((it) => (
            <TiltCard key={it.title} className={`rounded-3xl ${it.span}`} max={5}>
              <div className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-graphite-800 to-black p-7">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{it.title}</h3>
                  <p className="mt-2 max-w-sm text-sm text-white/55">{it.text}</p>
                </div>
                <p className="mt-8">
                  <span className="text-gradient-titanium text-6xl font-semibold tracking-tighter md:text-7xl">{it.big}</span>{" "}
                  <span className="text-sm text-white/40">{it.unit}</span>
                </p>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
