import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { COLORS } from "../lib/defaults.js";
import { computeQuote, quoteInput } from "../lib/quote.js";

const requestBody = quoteInput.extend({
  customerName: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(6).max(40),
  email: z.string().trim().email().optional().or(z.literal("")),
  website: z.string().optional(), // honeypot anti-bots
});

export const publicTradeInRoutes: FastifyPluginAsync = async (app) => {
  app.get("/options", async () => {
    const [prices, modifiers] = await Promise.all([
      prisma.tradeInPrice.findMany({ orderBy: [{ model: "asc" }, { storageGb: "asc" }] }),
      prisma.tradeInModifier.findMany({ orderBy: [{ group: "asc" }, { position: "asc" }] }),
    ]);
    const models: { model: string; storages: number[] }[] = [];
    for (const p of prices) {
      const found = models.find((m) => m.model === p.model);
      if (found) found.storages.push(p.storageGb);
      else models.push({ model: p.model, storages: [p.storageGb] });
    }
    return { models, colors: COLORS, modifiers };
  });

  app.post("/quote", { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } }, async (req, reply) => {
    const input = quoteInput.parse(req.body);
    const quote = await computeQuote(input);
    if (!quote) return reply.code(404).send({ error: "Ese modelo/almacenamiento no está en la tabla de canje." });
    return quote;
  });

  app.post(
    "/requests",
    { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } },
    async (req, reply) => {
      const body = requestBody.parse(req.body);
      if (body.website) return { id: "ok" }; // bot: respondemos OK sin guardar

      const quote = await computeQuote(body);
      if (!quote) return reply.code(404).send({ error: "Ese modelo/almacenamiento no está en la tabla de canje." });

      const created = await prisma.tradeInRequest.create({
        data: {
          customerName: body.customerName,
          contact: body.contact,
          email: body.email || null,
          model: body.model,
          storageGb: body.storageGb,
          color: body.color,
          screen: body.screen,
          body: body.body,
          batteryPct: body.batteryPct,
          powersOn: body.powersOn,
          faceIdWorks: body.faceIdWorks,
          hasBox: body.hasBox,
          hasCharger: body.hasCharger,
          estimatedUsd: quote.estimatedUsd,
          targetPhoneId: quote.target?.id ?? null,
          differenceUsd: quote.differenceUsd,
        },
      });
      return reply.code(201).send({
        id: created.id,
        estimatedUsd: quote.estimatedUsd,
        differenceUsd: quote.differenceUsd,
      });
    },
  );
};
