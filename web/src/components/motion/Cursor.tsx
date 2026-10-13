"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring } from "framer-motion";

/** Cursor personalizado: punto + aro con resorte. Solo con mouse y sin reduced-motion. */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 220, damping: 22, mass: 0.4 });
  const ry = useSpring(y, { stiffness: 220, damping: 22, mass: 0.4 });

  const pathname = usePathname();
  const inAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (inAdmin) return;
    const ok =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;
    setEnabled(true);
    document.documentElement.classList.add("custom-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setActive(!!t?.closest("a, button, [data-cursor='hover']"));
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, [x, y, inAdmin]);

  if (!enabled || inAdmin) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border border-white/60 mix-blend-difference"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: active ? 64 : 32, height: active ? 64 : 32 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />
    </>
  );
}
