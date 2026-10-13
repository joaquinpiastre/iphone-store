"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { PhoneCSS } from "./PhoneCSS";

const HeroPhone = dynamic(() => import("./HeroPhone"), {
  ssr: false,
  loading: () => <PhoneCSS spin={false} />,
});

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "100px" });
  const reduce = useReducedMotion();
  const [gl, setGl] = useState<boolean | null>(null);

  useEffect(() => setGl(hasWebGL()), []);

  return (
    <div ref={ref} className="absolute inset-0">
      {gl === false || reduce ? <PhoneCSS spin={!reduce} /> : gl ? <HeroPhone active={inView} /> : null}
    </div>
  );
}
