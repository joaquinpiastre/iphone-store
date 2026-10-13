import Link from "next/link";
import type { Phone } from "@/lib/types";
import { CONDITION_LABEL } from "@/lib/types";
import { TiltCard } from "@/components/motion/TiltCard";
import { PhoneArt } from "./PhoneArt";
import { Price } from "./Price";

export function PhoneCard({ phone }: { phone: Phone }) {
  const img = phone.images[0]?.url;
  return (
    <TiltCard className="rounded-3xl">
      <Link
        href={`/iphones/${phone.slug}`}
        className="block overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-graphite-800 to-black"
      >
        <div className="relative aspect-[4/5] bg-[radial-gradient(circle_at_50%_30%,rgba(109,74,255,0.18),transparent_65%)]">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={`${phone.model} ${phone.color}`} loading="lazy" className="h-full w-full object-contain p-6" />
          ) : (
            <PhoneArt color={phone.color} />
          )}
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs backdrop-blur">
            {CONDITION_LABEL[phone.condition]}
          </span>
          {phone.status === "RESERVED" && (
            <span className="absolute right-4 top-4 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-medium text-black">
              Reservado
            </span>
          )}
        </div>
        <div className="space-y-3 p-5">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{phone.model}</h3>
            <p className="text-sm text-white/50">
              {phone.storageGb} GB · {phone.color}
              {phone.batteryHealth != null && phone.condition !== "NEW" ? ` · 🔋 ${phone.batteryHealth}%` : ""}
            </p>
          </div>
          <Price usd={phone.priceUsd} />
        </div>
      </Link>
    </TiltCard>
  );
}
