import { z } from "zod";
import { prisma } from "./prisma.js";

export const quoteInput = z.object({
  model: z.string().min(2),
  storageGb: z.coerce.number().int().positive(),
  color: z.string().min(1).default("-"),
  screen: z.enum(["perfect", "scratched", "cracked"]),
  body: z.enum(["perfect", "worn", "dented"]),
  batteryPct: z.coerce.number().int().min(0).max(100),
  powersOn: z.boolean(),
  faceIdWorks: z.boolean(),
  hasBox: z.boolean(),
  hasCharger: z.boolean(),
  targetPhoneId: z.string().optional().nullable(),
});

export type QuoteInput = z.infer<typeof quoteInput>;

export function batteryBucket(pct: number) {
  if (pct >= 90) return "high";
  if (pct >= 80) return "mid";
  return "low";
}

const MAX_DISCOUNT = 90;

export async function computeQuote(input: QuoteInput) {
  const base = await prisma.tradeInPrice.findUnique({
    where: { model_storageGb: { model: input.model, storageGb: input.storageGb } },
  });
  if (!base) return null;

  const modifiers = await prisma.tradeInModifier.findMany();
  const byKey = new Map(modifiers.map((m) => [`${m.group}.${m.option}`, m]));

  const keys = [`screen.${input.screen}`, `body.${input.body}`, `battery.${batteryBucket(input.batteryPct)}`];
  if (!input.powersOn) keys.push("power.off");
  if (!input.faceIdWorks) keys.push("faceid.broken");
  if (!input.hasBox) keys.push("box.missing");
  if (!input.hasCharger) keys.push("charger.missing");

  const lines = keys
    .map((k) => byKey.get(k))
    .filter((m): m is NonNullable<typeof m> => !!m && m.discountPct > 0)
    .map((m) => ({ label: m.label, discountPct: m.discountPct }));

  const totalDiscountPct = Math.min(
    MAX_DISCOUNT,
    lines.reduce((acc, l) => acc + l.discountPct, 0),
  );
  const raw = base.basePriceUsd * (1 - totalDiscountPct / 100);
  const estimatedUsd = Math.max(0, Math.round(raw / 5) * 5);

  let differenceUsd: number | null = null;
  let target: { id: string; model: string; storageGb: number; priceUsd: number } | null = null;
  if (input.targetPhoneId) {
    const phone = await prisma.phone.findUnique({
      where: { id: input.targetPhoneId },
      select: { id: true, model: true, storageGb: true, priceUsd: true },
    });
    if (phone) {
      target = phone;
      differenceUsd = phone.priceUsd - estimatedUsd;
    }
  }

  return {
    basePriceUsd: base.basePriceUsd,
    totalDiscountPct,
    estimatedUsd,
    lines,
    differenceUsd,
    target,
  };
}
