import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = siteConfig.name;

export default function OgImage() {
  const subtitle = `${siteConfig.name} · Nuevos, seminuevos y plan canje`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at 70% 30%, #2b1670 0%, #000 60%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", fontSize: 160, fontWeight: 700, letterSpacing: -8 }}>iPhone.</div>
        <div style={{ display: "flex", fontSize: 40, color: "#bfbcb4" }}>{subtitle}</div>
      </div>
    ),
    size,
  );
}
