import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/motion/Marquee";
import { Featured } from "@/components/sections/Featured";
import { Disassemble } from "@/components/sections/Disassemble";
import { TradeInCta } from "@/components/sections/TradeInCta";
import { Benefits } from "@/components/sections/Benefits";
import { Stats } from "@/components/sections/Stats";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq, FAQS } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";

const MODELS = [
  "iPhone 17 Pro Max",
  "iPhone 17",
  "iPhone 16 Pro",
  "iPhone 15",
  "iPhone 14 Pro",
  "iPhone 13",
  "iPhone 12",
  "iPhone 11",
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <Marquee items={MODELS} className="border-y border-white/10 bg-black py-10" />
      <Featured />
      <Disassemble />
      <TradeInCta />
      <Benefits />
      <Stats />
      <Testimonials />
      <Faq />
      <Contact />
    </>
  );
}
