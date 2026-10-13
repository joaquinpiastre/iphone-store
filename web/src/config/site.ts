/**
 * Configuración central del negocio.
 * Cambiá estos valores y se actualizan en toda la web.
 * (Placeholders: reemplazalos por los datos reales.)
 */
export const siteConfig = {
  name: "Nova Mobile",
  tagline: "iPhone, sin vueltas.",
  description:
    "Comprá y canjeá iPhone nuevos, seminuevos y usados con garantía, equipos testeados y financiación.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  whatsapp: {
    // Formato internacional, sin + ni espacios
    number: "5491100000000",
    defaultMessage: "Hola! Quiero consultar por un iPhone.",
  },

  social: {
    instagram: "https://instagram.com/tunegocio",
    tiktok: "https://tiktok.com/@tunegocio",
  },

  contact: {
    email: "hola@tunegocio.com",
    address: "Av. Siempre Viva 123, Buenos Aires",
    mapsUrl: "https://maps.google.com/?q=Buenos+Aires",
    hours: [
      { days: "Lunes a viernes", time: "10:00 – 19:00" },
      { days: "Sábados", time: "10:00 – 14:00" },
    ],
  },

  /** Cotización por defecto; el valor real se edita desde el panel admin. */
  defaultUsdRate: 1200,
} as const;

export function whatsappLink(message: string = siteConfig.whatsapp.defaultMessage) {
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(message)}`;
}
