import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-black text-white">{children}</div>;
}
