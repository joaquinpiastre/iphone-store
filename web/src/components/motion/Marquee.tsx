type Props = {
  items: string[];
  className?: string;
};

/** Marquee infinito en CSS puro (sin JS por frame). */
export function Marquee({ items, className = "" }: Props) {
  const row = [...items, ...items];
  return (
    <div
      className={`relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] ${className}`}
      aria-hidden
    >
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap will-change-transform motion-reduce:animate-none">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-12">
            <span className="text-5xl font-semibold tracking-tight text-white/90 md:text-7xl">
              {item}
            </span>
            <span className="h-2 w-2 rounded-full bg-violet-glow/70" />
          </span>
        ))}
      </div>
    </div>
  );
}
