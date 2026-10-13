import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { api } from "@/lib/api";
import type { CatalogResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base: MetadataRoute.Sitemap = ["", "/iphones", "/canje"].map((p) => ({
    url: `${siteConfig.url}${p}`,
    lastModified: now,
  }));
  try {
    const { items } = await api<CatalogResponse>("/api/phones?limit=100");
    return [
      ...base,
      ...items.map((p) => ({ url: `${siteConfig.url}/iphones/${p.slug}`, lastModified: new Date(p.updatedAt) })),
    ];
  } catch {
    return base;
  }
}
