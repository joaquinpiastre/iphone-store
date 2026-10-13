import type { FastifyPluginAsync } from "fastify";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { csv, pagination } from "../lib/util.js";
import { publicPhone } from "../lib/phoneSchema.js";

const query = pagination.extend({
  model: z.string().optional(),
  storage: z.string().optional(),
  color: z.string().optional(),
  condition: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  minBattery: z.coerce.number().int().min(0).max(100).optional(),
  featured: z.enum(["1", "true"]).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "battery"]).default("newest"),
});

const CONDITIONS = ["NEW", "USED", "LIKE_NEW"] as const;

export const publicPhoneRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async (req) => {
    const q = query.parse(req.query);
    const models = csv(q.model);
    const storages = csv(q.storage).map(Number).filter((n) => Number.isFinite(n));
    const colors = csv(q.color);
    const conditions = csv(q.condition).filter((c): c is (typeof CONDITIONS)[number] =>
      (CONDITIONS as readonly string[]).includes(c),
    );

    const where: Prisma.PhoneWhereInput = {
      status: "AVAILABLE",
      ...(models.length && { model: { in: models } }),
      ...(storages.length && { storageGb: { in: storages } }),
      ...(colors.length && { color: { in: colors } }),
      ...(conditions.length && { condition: { in: conditions } }),
      ...((q.minPrice !== undefined || q.maxPrice !== undefined) && {
        priceUsd: { gte: q.minPrice, lte: q.maxPrice },
      }),
      ...(q.minBattery !== undefined && { batteryHealth: { gte: q.minBattery } }),
      ...(q.featured && { featured: true }),
    };

    const orderBy: Prisma.PhoneOrderByWithRelationInput[] =
      q.sort === "price_asc"
        ? [{ priceUsd: "asc" }]
        : q.sort === "price_desc"
          ? [{ priceUsd: "desc" }]
          : q.sort === "battery"
            ? [{ batteryHealth: { sort: "desc", nulls: "last" } }]
            : [{ createdAt: "desc" }];

    const [total, items, facetRows, price] = await Promise.all([
      prisma.phone.count({ where }),
      prisma.phone.findMany({
        where,
        orderBy,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        include: { images: { orderBy: { position: "asc" } } },
      }),
      prisma.phone.findMany({
        where: { status: "AVAILABLE" },
        select: { model: true, storageGb: true, color: true },
      }),
      prisma.phone.aggregate({
        where: { status: "AVAILABLE" },
        _min: { priceUsd: true },
        _max: { priceUsd: true },
      }),
    ]);

    return {
      items: items.map(publicPhone),
      total,
      page: q.page,
      pages: Math.max(1, Math.ceil(total / q.limit)),
      facets: {
        models: [...new Set(facetRows.map((r) => r.model))].sort(),
        storages: [...new Set(facetRows.map((r) => r.storageGb))].sort((a, b) => a - b),
        colors: [...new Set(facetRows.map((r) => r.color))].sort(),
        minPrice: price._min.priceUsd ?? 0,
        maxPrice: price._max.priceUsd ?? 0,
      },
    };
  });

  app.get("/:slug", async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const phone = await prisma.phone.findUnique({
      where: { slug },
      include: { images: { orderBy: { position: "asc" } } },
    });
    if (!phone || phone.status === "SOLD") return reply.code(404).send({ error: "Equipo no encontrado" });
    return { phone: publicPhone(phone) };
  });
};
