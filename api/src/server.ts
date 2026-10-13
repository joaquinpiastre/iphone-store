import bcrypt from "bcryptjs";
import { env } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";
import {
  DEFAULT_MODIFIERS,
  DEFAULT_PRICES,
  DEFAULT_SETTINGS,
  SAMPLE_PHONES,
} from "./lib/defaults.js";
import { phoneSlug } from "./lib/util.js";
import { buildApp } from "./app.js";

/** Deja el sistema usable en un deploy limpio: admin inicial, ajustes y modificadores. */
async function bootstrap(log: { info: (m: string) => void }) {
  const admins = await prisma.adminUser.count();
  if (admins === 0 && env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    await prisma.adminUser.create({
      data: {
        email: env.ADMIN_EMAIL.toLowerCase(),
        name: env.ADMIN_NAME,
        passwordHash: await bcrypt.hash(env.ADMIN_PASSWORD, 12),
      },
    });
    log.info(`Admin inicial creado: ${env.ADMIN_EMAIL}`);
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  if ((await prisma.tradeInModifier.count()) === 0) {
    await prisma.tradeInModifier.createMany({ data: DEFAULT_MODIFIERS });
  }

  // SEED_DEMO=true: carga tabla de canje y equipos de ejemplo si la base está vacía (se puede quitar después).
  if (process.env.SEED_DEMO === "true") {
    if ((await prisma.tradeInPrice.count()) === 0) {
      await prisma.tradeInPrice.createMany({ data: DEFAULT_PRICES });
    }
    if ((await prisma.phone.count()) === 0) {
      for (const p of SAMPLE_PHONES) {
        await prisma.phone.create({
          data: { ...p, slug: phoneSlug(p.model, p.storageGb, p.color), status: p.status ?? "AVAILABLE" },
        });
      }
      log.info("Datos de ejemplo cargados");
    }
  }
}

const app = await buildApp();

try {
  await bootstrap(app.log);
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, async () => {
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}
