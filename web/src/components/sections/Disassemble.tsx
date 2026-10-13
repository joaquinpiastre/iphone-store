"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const PARTS = [
  { name: "Pantalla", desc: "OLED Super Retina con ProMotion. La revisamos píxel por píxel.", color: "from-[#1c2d6b] to-[#2b1670]" },
  { name: "Cámara", desc: "Sistema de cámaras probado en foto, video y enfoque.", color: "from-titanium-500 to-titanium-700" },
  { name: "Chip", desc: "Rendimiento verificado con pruebas de estrés térmico.", color: "from-[#0b1b4d] to-[#1a1a3d]" },
  { name: "Batería", desc: "Medimos salud real. Te mostramos el % exacto.", color: "from-[#26262b] to-[#111113]" },
  { name: "Carcasa", desc: "Titanio y aluminio inspeccionado, sin golpes ocultos.", color: "from-titanium-300 to-titanium-700" },
];

export function Disassemble() {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=1800", scrub: 0.7, pin: true },
      });
      tl.to(".dz-stack", { rotateX: 58, rotateZ: -32, scale: 0.92, duration: 1, ease: "power2.inOut" }, 0);
      PARTS.forEach((_, i) => {
        tl.to(`.dz-layer-${i}`, { z: (PARTS.length - 1 - i) * 90 - 120, duration: 1, ease: "power2.inOut" }, 0);
        tl.to(`.dz-label-${i}`, { opacity: 1, x: 0, duration: 0.4 }, 0.45 + i * 0.18);
      });
    }, root);
    return () => {
      ctx.revert();
      mm.revert();
    };
  }, [reduce]);

  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden bg-black">
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-center gap-6 px-5 md:flex-row md:items-center md:px-8">
        <div className="relative z-10 md:w-[42%]">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-titanium-300">Por dentro</p>
          <h2 className="mb-8 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Lo abrimos para que <span className="text-gradient-aurora">vos no tengas que dudar.</span>
          </h2>
          <ul className="space-y-3">
            {PARTS.map((p, i) => (
              <li
                key={p.name}
                className={`dz-label-${i} flex gap-4 border-l border-white/15 pl-4 ${reduce ? "" : "translate-x-4 opacity-0"}`}
              >
                <span className="font-mono text-xs text-white/40">0{i + 1}</span>
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-white/50">{p.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex h-[44svh] flex-1 items-center justify-center [perspective:1400px] md:h-[80svh]">
          <div
            className={`dz-stack relative aspect-[1/2.05] h-[min(52svh,520px)] [transform-style:preserve-3d] ${
              reduce ? "[transform:rotateX(58deg)_rotateZ(-32deg)]" : ""
            }`}
          >
            {PARTS.map((p, i) => (
              <div
                key={p.name}
                className={`dz-layer-${i} absolute inset-0 rounded-[2rem] border border-white/20 bg-gradient-to-br ${p.color} shadow-[0_0_40px_rgba(109,74,255,0.15)]`}
                style={reduce ? { transform: `translateZ(${(PARTS.length - 1 - i) * 90 - 120}px)` } : undefined}
              >
                <span className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest text-white/60">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
