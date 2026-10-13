import { randomBytes } from "node:crypto";
import { z } from "zod";

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function phoneSlug(model: string, storageGb: number, color: string) {
  return `${slugify(`${model} ${storageGb}gb ${color}`)}-${randomBytes(2).toString("hex")}`;
}

export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export function csv(value: string | undefined) {
  return value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}
