import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";
import {
  DEFAULT_MODIFIERS,
  DEFAULT_PRICES,
  DEFAULT_SETTINGS,
  SAMPLE_PHONES,
} from "../src/lib/defaults.js";
import { phoneSlug } from "../src/lib/util.js";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@demo.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin1234";
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, name: "Admin", passwordHash: await bcrypt.hash(password, 12) },
  });

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  for (const m of DEFAULT_MODIFIERS) {
    await prisma.tradeInModifier.upsert({
      where: { group_option: { group: m.group, option: m.option } },
      update: {},
      create: m,
    });
  }

  for (const p of DEFAULT_PRICES) {
    await prisma.tradeInPrice.upsert({
      where: { model_storageGb: { model: p.model, storageGb: p.storageGb } },
      update: {},
      create: p,
    });
  }

  if ((await prisma.phone.count()) === 0) {
    for (const p of SAMPLE_PHONES) {
      await prisma.phone.create({
        data: { ...p, slug: phoneSlug(p.model, p.storageGb, p.color), status: p.status ?? "AVAILABLE" },
      });
    }
  }

  console.log(`Seed listo. Admin: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
