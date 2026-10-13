"use client";

import { siteConfig } from "@/config/site";
import { useSite } from "@/components/providers/SiteProvider";
import { SplitText } from "@/components/motion/SplitText";

export function Contact() {
  const { wa } = useSite();
  const c = siteConfig.contact;
  return (
    <section id="contacto" className="relative overflow-hidden bg-black px-5 py-28 md:px-8 md:py-40">
      <div className="absolute right-0 top-0 h-[480px] w-[480px] rounded-full bg-violet-glow/15 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl">
        <SplitText
          as="h2"
          text="Hablemos."
          className="text-gradient-titanium text-[clamp(3.5rem,13vw,11rem)] font-semibold leading-[0.9] tracking-[-0.05em]"
        />
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-white/40">WhatsApp</p>
            <a
              href={wa()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition-transform hover:scale-105"
            >
              Escribinos ahora
            </a>
          </div>
          <div className="text-white/70">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-white/40">Local</p>
            <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              {c.address}
            </a>
          </div>
          <div className="text-white/70">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-white/40">Horarios</p>
            {c.hours.map((h) => (
              <p key={h.days}>
                {h.days}: {h.time}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
