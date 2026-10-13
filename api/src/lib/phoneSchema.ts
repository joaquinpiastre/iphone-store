import { z } from "zod";

const nullableText = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((v) => (v ? v : null));

export const phoneInput = z.object({
  model: z.string().trim().min(2),
  storageGb: z.coerce.number().int().positive(),
  color: z.string().trim().min(1),
  condition: z.enum(["NEW", "USED", "LIKE_NEW"]),
  batteryHealth: z.coerce.number().int().min(0).max(100).nullable().optional(),
  imei: nullableText,
  accessories: z.array(z.string().trim().min(1)).default([]),
  warrantyMonths: z.coerce.number().int().min(0).default(0),
  priceUsd: z.coerce.number().int().min(0),
  costUsd: z.coerce.number().int().min(0).default(0),
  description: nullableText,
  featured: z.boolean().default(false),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]).default("AVAILABLE"),
  images: z
    .array(z.object({ url: z.string().min(1), publicId: z.string().nullable().optional() }))
    .default([]),
});

export type PhoneInput = z.infer<typeof phoneInput>;

/** Quita datos internos (costo, IMEI) antes de exponer un equipo al público. */
export function publicPhone<T extends { costUsd?: unknown; imei?: unknown }>(phone: T) {
  const { costUsd: _c, imei: _i, ...rest } = phone;
  return rest;
}
