import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

const useCloudinary = !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export const uploadRoot = path.resolve(env.UPLOAD_DIR);
if (!useCloudinary) mkdirSync(uploadRoot, { recursive: true });

export const storageMode = useCloudinary ? "cloudinary" : "local";

/** Redimensiona (máx. 1600px) y convierte a WebP antes de guardar. */
export async function optimizeImage(input: Buffer) {
  return sharp(input)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

export async function saveImage(buffer: Buffer): Promise<{ url: string; publicId: string }> {
  if (useCloudinary) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "phones", resource_type: "image" }, (err, res) => {
          if (err || !res) return reject(err ?? new Error("Falló la subida"));
          resolve({ url: res.secure_url, publicId: res.public_id });
        })
        .end(buffer);
    });
  }
  const name = `${randomUUID()}.webp`;
  writeFileSync(path.join(uploadRoot, name), buffer);
  return { url: `/api/uploads/${name}`, publicId: name };
}

export async function deleteImage(publicId: string | null | undefined) {
  if (!publicId) return;
  try {
    if (useCloudinary) await cloudinary.uploader.destroy(publicId);
    else unlinkSync(path.join(uploadRoot, path.basename(publicId)));
  } catch {
    /* best-effort */
  }
}
