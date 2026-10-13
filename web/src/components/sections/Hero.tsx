"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SplitText } from "@/components/motion/SplitText";
import { Particles } from "@/components/motion/Particles";
import { FloatingPhones } from "@/components/motion/FloatingPhones";
import { HeroScene } from "@/components/three/HeroScene";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-black pb-16 pt-28 md:items-center md:pb-0">
      <div className="grid-lines absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-10">
        <Particles />
      </div>
      <div className="absolute left-1/2 top-1/3 -z-10 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-violet-glow/20 blur-[140px]" />
      <FloatingPhones />

      {/* Modelo 3D */}
      <div className="absolute inset-x-0 top-[6%] h-[58%] md:inset-y-0 md:left-[28%] md:right-0 md:h-auto">
        <HeroScene />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 md:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-titanium-300"
        >
          Nuevos · Seminuevos · Plan canje
        </motion.p>

        <h1 className="text-[clamp(4.5rem,17vw,15rem)] font-semibold leading-[0.85] tracking-[-0.05em]">
          <SplitText text="iPhone." className="text-gradient-titanium" delay={0.2} stagger={0.06} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.9 }}
          className="mt-6 max-w-md text-lg leading-relaxed text-white/60 md:text-xl"
        >
          El que querés, al precio que tiene sentido. Entregá tu usado y cambialo hoy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link
            href="/iphones"
            className="rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition-transform hover:scale-105"
          >
            Ver catálogo
          </Link>
          <Link
            href="/canje"
            className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Cotizá tu canje
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
