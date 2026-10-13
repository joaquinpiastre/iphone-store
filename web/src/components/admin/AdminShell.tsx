"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const NAV = [
  { href: "/admin", label: "Resumen", icon: "◧" },
  { href: "/admin/telefonos", label: "Teléfonos", icon: "▯" },
  { href: "/admin/precios-canje", label: "Precios canje", icon: "$" },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: "✉" },
  { href: "/admin/configuracion", label: "Config", icon: "⚙" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    api<{ user: { name: string; email: string } }>("/api/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-black md:grid md:grid-cols-[230px_1fr]">
      <aside className="hidden border-r border-white/10 p-5 md:block">
        <div className="sticky top-5 flex h-[calc(100vh-2.5rem)] flex-col">
          <p className="mb-8 text-lg font-semibold tracking-tight">Panel</p>
          <nav className="flex-1 space-y-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive(n.href) ? "bg-white text-black" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="w-4 text-center">{n.icon}</span>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-white/10 pt-4 text-xs text-white/40">
            <p className="truncate">{user?.email}</p>
            <button onClick={logout} className="mt-2 text-white/70 hover:text-white">
              Cerrar sesión
            </button>
            <Link href="/" className="mt-2 block text-white/40 hover:text-white">
              Ver sitio →
            </Link>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-5 pb-28 pt-8 md:px-10 md:pb-12">{children}</main>

      {/* tab bar mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-white/10 bg-black/90 backdrop-blur md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex flex-col items-center gap-0.5 py-3 text-[11px] ${
              isActive(n.href) ? "text-white" : "text-white/40"
            }`}
          >
            <span className="text-base leading-none">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
