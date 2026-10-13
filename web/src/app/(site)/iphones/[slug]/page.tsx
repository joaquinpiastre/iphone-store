import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Phone } from "@/lib/types";
import { CONDITION_LABEL } from "@/lib/types";
import { siteConfig } from "@/config/site";
import { Gallery } from "@/components/catalog/Gallery";
import { ProductActions } from "@/components/catalog/ProductActions";

export const dynamic = "force-dynamic";

async function load(slug: string): Promise<Phone | null> {
  try {
    const { phone } = await api<{ phone: Phone }>(`/api/phones/${slug}`);
    return phone;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const phone = await load(slug).catch(() => null);
  if (!phone) return { title: "Equipo no encontrado" };
  const title = `${phone.model} ${phone.storageGb} GB ${phone.color}`;
  return {
    title,
    description: `${title} · ${CONDITION_LABEL[phone.condition]} con ${phone.warrantyMonths} meses de garantía. US$ ${phone.priceUsd}.`,
    openGraph: { images: phone.images[0] ? [phone.images[0].url] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const phone = await load(slug);
  if (!phone) notFound();

  const specs: [string, string][] = [
    ["Modelo", phone.model],
    ["Almacenamiento", `${phone.storageGb} GB`],
    ["Color", phone.color],
    ["Estado", CONDITION_LABEL[phone.condition]],
    ["Batería", phone.batteryHealth != null ? `${phone.batteryHealth}%` : "—"],
    ["Garantía", phone.warrantyMonths ? `${phone.warrantyMonths} meses` : "Sin garantía"],
    ["Accesorios", phone.accessories.length ? phone.accessories.join(", ") : "Solo el equipo"],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${phone.model} ${phone.storageGb} GB ${phone.color}`,
    image: phone.images.map((i) => i.url),
    description: phone.description ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: phone.priceUsd,
      availability: phone.status === "AVAILABLE" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
      url: `${siteConfig.url}/iphones/${phone.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/iphones" className="text-sm text-white/50 hover:text-white">
        ← Volver al catálogo
      </Link>
      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <Gallery images={phone.images} color={phone.color} alt={`${phone.model} ${phone.color}`} />

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-titanium-300">
            {CONDITION_LABEL[phone.condition]}
            {phone.status === "RESERVED" ? " · Reservado" : ""}
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">{phone.model}</h1>
          <p className="mt-2 text-lg text-white/55">
            {phone.storageGb} GB · {phone.color}
          </p>

          <ProductActions phone={phone} />

          {phone.batteryHealth != null && phone.condition !== "NEW" && (
            <div className="mt-10">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-white/60">Salud de batería</span>
                <span className="font-mono">{phone.batteryHealth}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#9db4ff] to-[#6d4aff]"
                  style={{ width: `${phone.batteryHealth}%` }}
                />
              </div>
            </div>
          )}

          {phone.description && <p className="mt-8 text-white/65">{phone.description}</p>}

          <dl className="mt-10 divide-y divide-white/10 border-y border-white/10 text-sm">
            {specs.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3.5">
                <dt className="text-white/50">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
