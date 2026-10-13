import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { ZodError } from "zod";
import { env, isProd } from "./lib/env.js";
import { storageMode, uploadRoot } from "./lib/storage.js";
import { prisma } from "./lib/prisma.js";
import { authRoutes } from "./routes/auth.js";
import { publicPhoneRoutes } from "./routes/phones.js";
import { publicTradeInRoutes } from "./routes/tradein.js";
import { settingsPublicRoutes } from "./routes/settings.js";
import { adminRoutes } from "./routes/admin.js";

export async function buildApp() {
  const app = Fastify({
    trustProxy: true,
    logger: {
      level: isProd ? "info" : "debug",
      redact: ["req.headers.cookie", "req.headers.authorization"],
    },
  });

  await app.register(helmet, { crossOriginResourcePolicy: { policy: "cross-origin" } });
  await app.register(cors, { origin: env.FRONTEND_URL, credentials: true });
  await app.register(cookie);
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: "token", signed: false },
    sign: { expiresIn: "7d" },
  });
  await app.register(rateLimit, { global: false });
  await app.register(multipart, { limits: { fileSize: 12 * 1024 * 1024, files: 1 } });

  if (storageMode === "local") {
    await app.register(fastifyStatic, { root: uploadRoot, prefix: "/api/uploads/", decorateReply: false });
  }

  app.setErrorHandler((err: any, _req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({ error: "Datos inválidos", issues: err.flatten() });
    }
    if (err?.code === "P2002") {
      return reply.code(409).send({ error: "Ya existe un registro con esos datos (valor duplicado)." });
    }
    if (err?.code === "P2025") {
      return reply.code(404).send({ error: "No encontrado" });
    }
    if (err?.statusCode && err.statusCode < 500) {
      return reply.code(err.statusCode).send({ error: err.message });
    }
    app.log.error(err);
    return reply.code(500).send({ error: "Error interno del servidor" });
  });

  app.get("/health", async (_req, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "ok" };
    } catch {
      return reply.code(503).send({ status: "db_unavailable" });
    }
  });

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(publicPhoneRoutes, { prefix: "/api/phones" });
  await app.register(publicTradeInRoutes, { prefix: "/api/tradein" });
  await app.register(settingsPublicRoutes, { prefix: "/api/settings" });
  await app.register(adminRoutes, { prefix: "/api/admin" });

  return app;
}
