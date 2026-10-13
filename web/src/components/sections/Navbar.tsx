"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { useSite } from "@/components/providers/SiteProvider";

const links = [
  { href: "/iphones", label: "iPhones" },
  { href: "/canje", label: "Plan canje" },
  { href: "/#beneficios", label: "Beneficios" },
  { href: "/#faq", label: "Preguntas" },
  { href: "/#contacto", label: "Contacto" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { currency, setCurrency, wa } = useSite();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "bg-black/75 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight" onClick={() => setOpen(false)}>
          {siteConfig.name}
        </Link>

        <ul className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          {links.slice(0, 4).map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrency(currency === "ARS" ? "USD" : "ARS")}
            aria-label="Cambiar moneda"
            className="rounded-full border border-white/20 px-3 py-1.5 font-mono text-xs text-white/80 transition-colors hover:bg-white/10"
          >
            {currency === "ARS" ? "ARS $" : "USD US$"}
          </button>
          <a
            href={wa()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-105 sm:block"
          >
            WhatsApp
          </a>
          <button
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menú"
            aria-expanded={open}
          >
            <span className={`h-px w-5 bg-white transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
            <span className={`h-px w-5 bg-white transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden md:hidden"
          >
            <ul className="space-y-1 px-5 pb-8 pt-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-white/10 py-4 text-2xl font-semibold tracking-tight"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
