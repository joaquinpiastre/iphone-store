const PALETTE: [RegExp, string][] = [
  [/negro|medianoche|space/i, "#26262b"],
  [/blanco|plata|estelar/i, "#d9d9dc"],
  [/desierto/i, "#b79c80"],
  [/natural/i, "#8d8a83"],
  [/azul/i, "#3a5a8c"],
  [/rosa/i, "#e0a3b8"],
  [/verde/i, "#5d7d63"],
  [/amarillo/i, "#e0cf85"],
  [/morado|violeta/i, "#8574b5"],
  [/rojo/i, "#b3202e"],
  [/dorado|oro/i, "#cbb68a"],
  [/gris/i, "#5b5b60"],
];

function tint(color: string) {
  return PALETTE.find(([re]) => re.test(color))?.[1] ?? "#777777";
}

/** Ilustración CSS de un iPhone teñida con el color del equipo (placeholder cuando no hay fotos). */
export function PhoneArt({ color, className = "" }: { color: string; className?: string }) {
  const c = tint(color);
  return (
    <div className={`flex h-full w-full items-center justify-center ${className}`} aria-hidden>
      <div
        className="relative aspect-[1/2.05] h-[78%] rounded-[2rem] p-[3%] shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        style={{ background: `linear-gradient(145deg, ${c}, #0b0b0d 85%)` }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-deep via-[#2b1670] to-black">
          <div className="absolute left-1/2 top-[2.5%] h-[3%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
        </div>
        <div className="absolute -right-px top-[22%] h-[10%] w-[1.5%] rounded-r bg-white/25" />
      </div>
    </div>
  );
}
