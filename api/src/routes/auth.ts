import type { FastifyPluginAsync } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { isProd } from "../lib/env.js";
import { requireAdmin } from "../lib/auth.js";

const loginBody = z.object({ email: z.string().email(), password: z.string().min(1) });

// Hash de relleno para igualar tiempos cuando el usuario no existe
const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8b3vC9s2kQb6y9y8gk7m3w2cB8hH1K";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/login",
    { config: { rateLimit: { max: 8, timeWindow: "10 minutes" } } },
    async (req, reply) => {
      const { email, password } = loginBody.parse(req.body);
      const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
      const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
      if (!user || !ok) return reply.code(401).send({ error: "Email o contraseña incorrectos" });

      const token = app.jwt.sign({ sub: user.id, email: user.email });
      reply.setCookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return { user: { id: user.id, email: user.email, name: user.name } };
    },
  );

  app.post("/logout", async (_req, reply) => {
    reply.clearCookie("token", { path: "/" });
    return { ok: true };
  });

  app.get("/me", { onRequest: requireAdmin }, async (req, reply) => {
    const user = await prisma.adminUser.findUnique({
      where: { id: req.user.sub },
      select: { id: true, email: true, name: true },
    });
    if (!user) return reply.code(401).send({ error: "No autorizado" });
    return { user };
  });
};
