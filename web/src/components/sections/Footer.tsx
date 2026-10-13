import { siteConfig } from "@/config/site";

export function Footer() {
  const c = siteConfig.contact;
  return (
    <footer className="border-t border-white/10 bg-black px-5 py-16 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-3">
        <div>
          <p className="text-xl font-semibold">{siteConfig.name}</p>
          <p className="mt-3 max-w-xs text-sm text-white/50">{siteConfig.description}</p>
        </div>
        <div className="text-sm text-white/60">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-white/40">Contacto</p>
          <p>{c.address}</p>
          <p className="mt-1">{c.email}</p>
          <div className="mt-4 flex gap-4">
            <a href={siteConfig.social.instagram} className="hover:text-white">Instagram</a>
            <a href={siteConfig.social.tiktok} className="hover:text-white">TikTok</a>
          </div>
        </div>
        <div className="text-sm text-white/60">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-white/40">Horarios</p>
          {c.hours.map((h) => (
            <p key={h.days}>
              {h.days}: {h.time}
            </p>
          ))}
        </div>
      </div>
      <p className="mx-auto mt-14 max-w-7xl text-xs leading-relaxed text-white/35">
        {siteConfig.name} es un revendedor independiente y no está afiliado, autorizado ni patrocinado por Apple Inc.
        Apple e iPhone son marcas registradas de Apple Inc.
      </p>
    </footer>
  );
}
