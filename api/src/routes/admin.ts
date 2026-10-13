import type { FastifyPluginAsync } from "fastify";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../lib/auth.js";
import { pagination, phoneSlug } from "../lib/util.js";
import { phoneInput } from "../lib/phoneSchema.js";
import { deleteImage, optimizeImage, saveImage } from "../lib/storage.js";
import { loadSettings } from "./settings.js";

const idParam = z.object({ id: z.string().min(1) });

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", requireAdmin);

  /* ------------------------------ Dashboard ------------------------------ */
  app.get("/dashboard", async () => {
    const [byStatus, stock, pending, recentPhones, recentRequests] = await Promise.all([
      prisma.phone.groupBy({ by: ["status"], _count: true }),
      prisma.phone.findMany({
        where: { status: { in: ["AVAILABLE", "RESERVED"] } },
        select: { priceUsd: true, costUsd: true },
      }),
      prisma.tradeInRequest.count({ where: { status: "NEW" } }),
      prisma.phone.findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { id: true, model: true, storageGb: true, color: true, status: true, updatedAt: true },
      }),
      prisma.tradeInRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, customerName: true, model: true, estimatedUsd: true, status: true, createdAt: true },
      }),
    ]);
    const count = (s: string) => byStatus.find((b) => b.status === s)?._count ?? 0;
    return {
      stock: { available: count("AVAILABLE"), reserved: count("RESERVED"), sold: count("SOLD") },
      inventoryValueUsd: stock.reduce((a, p) => a + p.priceUsd, 0),
      inventoryCostUsd: stock.reduce((a, p) => a + p.costUsd, 0),
      pendingRequests: pending,
      recentPhones,
      recentRequests,
    };
  });

  /* ------------------------------- Teléfonos ------------------------------ */
  app.get("/phones", async (req) => {
    const q = pagination
      .extend({
        q: z.string().optional(),
        status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]).optional(),
        condition: z.enum(["NEW", "USED", "LIKE_NEW"]).optional(),
      })
      .parse(req.query);

    const where: Prisma.PhoneWhereInput = {
      ...(q.status && { status: q.status }),
      ...(q.condition && { condition: q.condition }),
      ...(q.q && {
        OR: [
          { model: { contains: q.q, mode: "insensitive" } },
          { color: { contains: q.q, mode: "insensitive" } },
          { imei: { contains: q.q } },
        ],
      }),
    };
    const [total, items] = await Promise.all([
      prisma.phone.count({ where }),
      prisma.phone.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
      }),
    ]);
    return { items, total, page: q.page, pages: Math.max(1, Math.ceil(total / q.limit)) };
  });

  app.get("/phones/:id", async (req, reply) => {
    const { id } = idParam.parse(req.params);
    const phone = await prisma.phone.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } } },
    });
    if (!phone) return reply.code(404).send({ error: "No encontrado" });
    return { phone };
  });

  app.post("/phones", async (req, reply) => {
    const { images, ...data } = phoneInput.parse(req.body);
    const phone = await prisma.phone.create({
      data: {
        ...data,
        slug: phoneSlug(data.model, data.storageGb, data.color),
        soldAt: data.status === "SOLD" ? new Date() : null,
        images: { create: images.map((img, position) => ({ ...img, position })) },
      },
      include: { images: true },
    });
    return reply.code(201).send({ phone });
  });

  app.put("/phones/:id", async (req) => {
    const { id } = idParam.parse(req.params);
    const { images, ...data } = phoneInput.parse(req.body);
    const current = await prisma.phone.findUniqueOrThrow({ where: { id }, include: { images: true } });

    const keep = new Set(images.map((i) => i.url));
    const removed = current.images.filter((i) => !keep.has(i.url));

    const phone = await prisma.$transaction(async (tx) => {
      await tx.phoneImage.deleteMany({ where: { phoneId: id } });
      return tx.phone.update({
        where: { id },
        data: {
          ...data,
          soldAt: data.status === "SOLD" ? (current.soldAt ?? new Date()) : null,
          images: { create: images.map((img, position) => ({ ...img, position })) },
        },
        include: { images: { orderBy: { position: "asc" } } },
      });
    });
    await Promise.all(removed.map((i) => deleteImage(i.publicId)));
    return { phone };
  });

  app.patch("/phones/:id/status", async (req) => {
    const { id } = idParam.parse(req.params);
    const { status } = z.object({ status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]) }).parse(req.body);
    const current = await prisma.phone.findUniqueOrThrow({ where: { id }, select: { soldAt: true } });
    const phone = await prisma.phone.update({
      where: { id },
      data: { status, soldAt: status === "SOLD" ? (current.soldAt ?? new Date()) : null },
    });
    return { phone };
  });

  app.delete("/phones/:id", async (req) => {
    const { id } = idParam.parse(req.params);
    const images = await prisma.phoneImage.findMany({ where: { phoneId: id } });
    await prisma.phone.delete({ where: { id } });
    await Promise.all(images.map((i) => deleteImage(i.publicId)));
    return { ok: true };
  });

  /* -------------------------------- Uploads ------------------------------- */
  app.post("/uploads", async (req, reply) => {
    const file = await req.file();
    if (!file) return reply.code(400).send({ error: "Falta el archivo" });
    if (!file.mimetype.startsWith("image/")) return reply.code(400).send({ error: "Solo se aceptan imágenes" });
    const buffer = await file.toBuffer();
    const optimized = await optimizeImage(buffer);
    return saveImage(optimized);
  });

  /* ------------------------- Tabla de precios de canje -------------------- */
  app.get("/tradein/prices", async () => ({
    items: await prisma.tradeInPrice.findMany({ orderBy: [{ model: "asc" }, { storageGb: "asc" }] }),
  }));

  app.post("/tradein/prices", async (req, reply) => {
    const body = z
      .object({
        model: z.string().trim().min(2),
        storageGb: z.coerce.number().int().positive(),
        basePriceUsd: z.coerce.number().int().min(0),
      })
      .parse(req.body);
    return reply.code(201).send({ item: await prisma.tradeInPrice.create({ data: body }) });
  });

  app.put("/tradein/prices/:id", async (req) => {
    const { id } = idParam.parse(req.params);
    const { basePriceUsd } = z.object({ basePriceUsd: z.coerce.number().int().min(0) }).parse(req.body);
    return { item: await prisma.tradeInPrice.update({ where: { id }, data: { basePriceUsd } }) };
  });

  app.delete("/tradein/prices/:id", async (req) => {
    const { id } = idParam.parse(req.params);
    await prisma.tradeInPrice.delete({ where: { id } });
    return { ok: true };
  });

  app.get("/tradein/modifiers", async () => ({
    items: await prisma.tradeInModifier.findMany({ orderBy: [{ group: "asc" }, { position: "asc" }] }),
  }));

  app.put("/tradein/modifiers/:id", async (req) => {
    const { id } = idParam.parse(req.params);
    const { discountPct } = z.object({ discountPct: z.coerce.number().int().min(0).max(100) }).parse(req.body);
    return { item: await prisma.tradeInModifier.update({ where: { id }, data: { discountPct } }) };
  });

  /* --------------------------- Solicitudes de canje ----------------------- */
  app.get("/tradein/requests", async (req) => {
    const q = pagination
      .extend({
        q: z.string().optional(),
        status: z.enum(["NEW", "CONTACTED", "CLOSED", "REJECTED"]).optional(),
      })
      .parse(req.query);
    const where: Prisma.TradeInRequestWhereInput = {
      ...(q.status && { status: q.status }),
      ...(q.q && {
        OR: [
          { customerName: { contains: q.q, mode: "insensitive" } },
          { contact: { contains: q.q } },
          { model: { contains: q.q, mode: "insensitive" } },
        ],
      }),
    };
    const [total, items] = await Promise.all([
      prisma.tradeInRequest.count({ where }),
      prisma.tradeInRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        include: { targetPhone: { select: { id: true, model: true, storageGb: true, color: true, priceUsd: true } } },
      }),
    ]);
    return { items, total, page: q.page, pages: Math.max(1, Math.ceil(total / q.limit)) };
  });

  app.patch("/tradein/requests/:id", async (req) => {
    const { id } = idParam.parse(req.params);
    const body = z
      .object({
        status: z.enum(["NEW", "CONTACTED", "CLOSED", "REJECTED"]).optional(),
        notes: z.string().max(2000).nullable().optional(),
      })
      .parse(req.body);
    return { item: await prisma.tradeInRequest.update({ where: { id }, data: body }) };
  });

  app.delete("/tradein/requests/:id", async (req) => {
    const { id } = idParam.parse(req.params);
    await prisma.tradeInRequest.delete({ where: { id } });
    return { ok: true };
  });

  /* ------------------------------ Configuración --------------------------- */
  app.get("/settings", async () => ({ settings: await loadSettings() }));

  app.put("/settings", async (req) => {
    const body = z
      .object({
        usdRate: z.coerce.number().positive(),
        businessName: z.string().trim().min(1),
        whatsapp: z.string().trim().regex(/^\d{8,15}$/, "Solo números, con código de país"),
        address: z.string().trim(),
        instagram: z.string().trim(),
      })
      .parse(req.body);
    await prisma.$transaction(
      Object.entries(body).map(([key, value]) =>
        prisma.setting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } }),
      ),
    );
    return { settings: await loadSettings() };
  });
};
