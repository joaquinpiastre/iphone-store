"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

type Layer = {
  left: string;
  top: string;
  size: number;
  blur: number;
  rotate: number;
  depth: number;
  opacity: number;
  dur: number;
};

const LAYERS: Layer[] = [
  { left: "6%", top: "18%", size: 120, blur: 6, rotate: -18, depth: 220, opacity: 0.35, dur: 7 },
  { left: "82%", top: "10%", size: 90, blur: 3, rotate: 14, depth: 120, opacity: 0.4, dur: 9 },
  { left: "88%", top: "62%", size: 170, blur: 10, rotate: 22, depth: 320, opacity: 0.25, dur: 11 },
  { left: "14%", top: "70%", size: 70, blur: 2, rotate: -8, depth: 80, opacity: 0.5, dur: 8 },
  { left: "46%", top: "84%", size: 100, blur: 8, rotate: 6, depth: 260, opacity: 0.2, dur: 10 },
];

function FloatingPhone({ l }: { l: Layer }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -l.depth]);
  const reduce = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className="absolute"
      style={{ left: l.left, top: l.top, y: reduce ? 0 : y }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -18, 0], rotate: [l.rotate, l.rotate + 4, l.rotate] }}
        transition={{ duration: l.dur, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: l.size,
          height: l.size * 2.05,
          rotate: l.rotate,
          opacity: l.opacity,
          filter: `blur(${l.blur}px)`,
        }}
        className="rounded-[22%/11%] border border-white/20 bg-gradient-to-br from-titanium-300/30 via-deep/40 to-black"
      />
    </motion.div>
  );
}

export function FloatingPhones() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {LAYERS.map((l, i) => (
        <FloatingPhone key={i} l={l} />
      ))}
    </div>
  );
}
