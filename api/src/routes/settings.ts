import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";
import { DEFAULT_SETTINGS } from "../lib/defaults.js";

export async function loadSettings() {
  const rows = await prisma.setting.findMany();
  return { ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) };
}

export const settingsPublicRoutes: FastifyPluginAsync = async (app) => {
  app.get("/public", async () => {
    const s = await loadSettings();
    return {
      usdRate: Number(s.usdRate) || Number(DEFAULT_SETTINGS.usdRate),
      businessName: s.businessName,
      whatsapp: s.whatsapp,
      address: s.address,
      instagram: s.instagram,
    };
  });
};
