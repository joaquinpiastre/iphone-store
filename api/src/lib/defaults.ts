/** Datos por defecto: se usan en el seed y para completar modificadores faltantes. */

export const COLORS = [
  "Negro",
  "Blanco",
  "Titanio natural",
  "Titanio negro",
  "Titanio blanco",
  "Titanio desierto",
  "Azul",
  "Rosa",
  "Verde",
  "Amarillo",
  "Morado",
  "Rojo",
  "Dorado",
  "Plata",
  "Gris espacial",
];

export const DEFAULT_MODIFIERS = [
  { group: "screen", option: "perfect", label: "Pantalla impecable", discountPct: 0, position: 0 },
  { group: "screen", option: "scratched", label: "Pantalla con rayones", discountPct: 8, position: 1 },
  { group: "screen", option: "cracked", label: "Pantalla rota / quebrada", discountPct: 35, position: 2 },
  { group: "body", option: "perfect", label: "Carcasa impecable", discountPct: 0, position: 0 },
  { group: "body", option: "worn", label: "Carcasa con marcas de uso", discountPct: 7, position: 1 },
  { group: "body", option: "dented", label: "Carcasa golpeada / doblada", discountPct: 20, position: 2 },
  { group: "battery", option: "high", label: "Batería 90% o más", discountPct: 0, position: 0 },
  { group: "battery", option: "mid", label: "Batería entre 80% y 89%", discountPct: 7, position: 1 },
  { group: "battery", option: "low", label: "Batería por debajo de 80%", discountPct: 15, position: 2 },
  { group: "power", option: "off", label: "No enciende", discountPct: 60, position: 0 },
  { group: "faceid", option: "broken", label: "Face ID no funciona", discountPct: 20, position: 0 },
  { group: "box", option: "missing", label: "Sin caja", discountPct: 3, position: 0 },
  { group: "charger", option: "missing", label: "Sin cargador / cable", discountPct: 2, position: 0 },
];

/** Precios base de canje de ejemplo (USD). Ajustalos desde el panel. */
export const DEFAULT_PRICES: { model: string; storageGb: number; basePriceUsd: number }[] = [
  { model: "iPhone 11", storageGb: 64, basePriceUsd: 110 },
  { model: "iPhone 11", storageGb: 128, basePriceUsd: 130 },
  { model: "iPhone 12", storageGb: 64, basePriceUsd: 170 },
  { model: "iPhone 12", storageGb: 128, basePriceUsd: 190 },
  { model: "iPhone 12", storageGb: 256, basePriceUsd: 215 },
  { model: "iPhone 13", storageGb: 128, basePriceUsd: 260 },
  { model: "iPhone 13", storageGb: 256, basePriceUsd: 290 },
  { model: "iPhone 13", storageGb: 512, basePriceUsd: 330 },
  { model: "iPhone 14", storageGb: 128, basePriceUsd: 330 },
  { model: "iPhone 14", storageGb: 256, basePriceUsd: 370 },
  { model: "iPhone 14 Pro", storageGb: 128, basePriceUsd: 450 },
  { model: "iPhone 14 Pro", storageGb: 256, basePriceUsd: 490 },
  { model: "iPhone 14 Pro", storageGb: 512, basePriceUsd: 540 },
  { model: "iPhone 15", storageGb: 128, basePriceUsd: 430 },
  { model: "iPhone 15", storageGb: 256, basePriceUsd: 470 },
  { model: "iPhone 15 Pro", storageGb: 128, basePriceUsd: 560 },
  { model: "iPhone 15 Pro", storageGb: 256, basePriceUsd: 610 },
  { model: "iPhone 15 Pro", storageGb: 512, basePriceUsd: 670 },
  { model: "iPhone 15 Pro Max", storageGb: 256, basePriceUsd: 700 },
  { model: "iPhone 15 Pro Max", storageGb: 512, basePriceUsd: 760 },
  { model: "iPhone 16", storageGb: 128, basePriceUsd: 560 },
  { model: "iPhone 16", storageGb: 256, basePriceUsd: 610 },
  { model: "iPhone 16 Pro", storageGb: 128, basePriceUsd: 700 },
  { model: "iPhone 16 Pro", storageGb: 256, basePriceUsd: 760 },
  { model: "iPhone 16 Pro Max", storageGb: 256, basePriceUsd: 860 },
  { model: "iPhone 16 Pro Max", storageGb: 512, basePriceUsd: 930 },
  { model: "iPhone 17", storageGb: 256, basePriceUsd: 760 },
  { model: "iPhone 17 Pro", storageGb: 256, basePriceUsd: 1000 },
  { model: "iPhone 17 Pro Max", storageGb: 256, basePriceUsd: 1100 },
];

export const DEFAULT_SETTINGS: Record<string, string> = {
  usdRate: "1200",
  businessName: "Nova Mobile",
  whatsapp: "5491100000000",
  address: "Av. Siempre Viva 123, Buenos Aires",
  instagram: "https://instagram.com/tunegocio",
};

type SamplePhone = {
  model: string;
  storageGb: number;
  color: string;
  condition: "NEW" | "USED" | "LIKE_NEW";
  batteryHealth: number | null;
  accessories: string[];
  warrantyMonths: number;
  priceUsd: number;
  costUsd: number;
  featured: boolean;
  description: string;
  status?: "AVAILABLE" | "RESERVED" | "SOLD";
};

export const SAMPLE_PHONES: SamplePhone[] = [
  { model: "iPhone 17 Pro Max", storageGb: 256, color: "Titanio desierto", condition: "NEW", batteryHealth: 100, accessories: ["Caja", "Cable USB-C"], warrantyMonths: 12, priceUsd: 1450, costUsd: 1280, featured: true, description: "Sellado, con factura y garantía de 12 meses." },
  { model: "iPhone 17 Pro", storageGb: 256, color: "Titanio negro", condition: "NEW", batteryHealth: 100, accessories: ["Caja", "Cable USB-C"], warrantyMonths: 12, priceUsd: 1290, costUsd: 1140, featured: true, description: "Sellado, con factura y garantía de 12 meses." },
  { model: "iPhone 16 Pro", storageGb: 256, color: "Titanio natural", condition: "LIKE_NEW", batteryHealth: 96, accessories: ["Caja", "Cable USB-C"], warrantyMonths: 6, priceUsd: 980, costUsd: 820, featured: true, description: "Seminuevo impecable, sin marcas. Batería al 96%." },
  { model: "iPhone 16", storageGb: 128, color: "Azul", condition: "LIKE_NEW", batteryHealth: 98, accessories: ["Caja", "Cable USB-C"], warrantyMonths: 6, priceUsd: 760, costUsd: 640, featured: false, description: "Seminuevo, uso mínimo. Con caja y accesorios." },
  { model: "iPhone 15 Pro", storageGb: 128, color: "Titanio azul", condition: "USED", batteryHealth: 89, accessories: ["Cable USB-C"], warrantyMonths: 3, priceUsd: 760, costUsd: 640, featured: true, description: "Usado en muy buen estado. Detalles mínimos de uso." },
  { model: "iPhone 15", storageGb: 128, color: "Rosa", condition: "USED", batteryHealth: 91, accessories: ["Cable USB-C"], warrantyMonths: 3, priceUsd: 590, costUsd: 480, featured: false, description: "Usado, funciona perfecto. Pantalla sin rayones." },
  { model: "iPhone 14 Pro", storageGb: 256, color: "Morado", condition: "USED", batteryHealth: 87, accessories: ["Cable Lightning"], warrantyMonths: 3, priceUsd: 640, costUsd: 530, featured: false, description: "Usado, batería al 87%. Totalmente testeado." },
  { model: "iPhone 13", storageGb: 128, color: "Medianoche", condition: "USED", batteryHealth: 85, accessories: [], warrantyMonths: 3, priceUsd: 410, costUsd: 330, featured: false, description: "Usado, ideal primer iPhone. Testeado completo." },
  { model: "iPhone 12", storageGb: 64, color: "Blanco", condition: "USED", batteryHealth: 82, accessories: [], warrantyMonths: 1, priceUsd: 290, costUsd: 220, featured: false, description: "Usado, económico. Batería al 82%." },
];
