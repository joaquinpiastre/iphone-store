import Link from "next/link";
import { SplitText } from "@/components/motion/SplitText";
import { Counter } from "@/components/motion/Counter";

export function TradeInCta() {
  return (
    <section className="relative overflow-hidden bg-black px-5 py-28 md:px-8 md:py-40">
      <div className="absolute -left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-deep/60 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-titanium-300">Plan canje</p>
          <SplitText
            as="h2"
            text="Tu iPhone usado vale más de lo que pensás."
            className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
          />
          <p className="mt-6 max-w-md text-lg text-white/55">
            Respondé unas preguntas, te damos una cotización al instante y la diferencia a pagar por el equipo que
            elijas.
          </p>
          <Link
            href="/canje"
            className="mt-8 inline-block rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition-transform hover:scale-105"
          >
            Cotizar mi iPhone
          </Link>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-graphite-800 to-black p-8 md:p-12">
          <p className="text-sm text-white/50">Hasta</p>
          <Counter
            to={900}
            prefix="US$ "
            className="text-gradient-titanium block text-7xl font-semibold tracking-tighter md:text-8xl"
          />
          <p className="mt-2 text-white/50">por tu equipo, según modelo y estado.</p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-white/60">
            {["1. Elegís modelo", "2. Contás el estado", "3. Recibís precio"].map((s) => (
              <div key={s} className="rounded-2xl border border-white/10 px-2 py-4">
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
