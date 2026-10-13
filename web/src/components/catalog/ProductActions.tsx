"use client";

import Link from "next/link";
import { useSite } from "@/components/providers/SiteProvider";
import { Price } from "@/components/ui/Price";
import { CONDITION_LABEL, type Phone } from "@/lib/types";
import { fmtUsd } from "@/lib/format";

export function ProductActions({ phone }: { phone: Phone }) {
  const { wa } = useSite();
  const message =
    `Hola! Me interesa el ${phone.model} ${phone.storageGb} GB ${phone.color} ` +
    `(${CONDITION_LABEL[phone.condition]}) de ${fmtUsd(phone.priceUsd)}. ¿Sigue disponible?\n` +
    (typeof window !== "undefined" ? window.location.href : "");

  return (
    <div className="mt-8">
      <Price usd={phone.priceUsd} size="lg" />
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={wa(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-white px-7 py-4 text-center text-sm font-medium text-black transition-transform hover:scale-[1.03]"
        >
          Comprar por WhatsApp
        </a>
        <Link
          href={`/canje?target=${phone.slug}`}
          className="rounded-full border border-white/25 px-7 py-4 text-center text-sm font-medium transition-colors hover:bg-white/10"
        >
          Cotizar mi canje con este equipo
        </Link>
      </div>
    </div>
  );
}
