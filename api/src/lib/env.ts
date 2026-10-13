import "dotenv/config";
import { z } from "zod";

const empty = (v: unknown) => (v === "" ? undefined : v);

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatoria"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET debe tener al menos 16 caracteres"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  ADMIN_EMAIL: z.preprocess(empty, z.string().email().optional()),
  ADMIN_PASSWORD: z.preprocess(empty, z.string().min(8).optional()),
  ADMIN_NAME: z.string().default("Admin"),
  CLOUDINARY_CLOUD_NAME: z.preprocess(empty, z.string().optional()),
  CLOUDINARY_API_KEY: z.preprocess(empty, z.string().optional()),
  CLOUDINARY_API_SECRET: z.preprocess(empty, z.string().optional()),
  UPLOAD_DIR: z.string().default("uploads"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Variables de entorno inválidas:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
