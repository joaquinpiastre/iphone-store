import { Counter } from "@/components/motion/Counter";

const stats = [
  { to: 3200, suffix: "+", label: "equipos entregados" },
  { to: 4800, suffix: "+", label: "clientes conformes" },
  { to: 98, suffix: "%", label: "recomiendan la tienda" },
];

export function Stats() {
  return (
    <section className="bg-black px-5 py-24 md:px-8 md:py-36">
      <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="border-t border-white/15 pt-6">
            <Counter
              to={s.to}
              suffix={s.suffix}
              className="text-gradient-aurora block text-7xl font-semibold tracking-tighter md:text-8xl"
            />
            <p className="mt-3 text-white/55">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
