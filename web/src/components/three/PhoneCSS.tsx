/** Fallback CSS 3D: se usa sin WebGL, con reduced-motion o mientras carga el canvas. */
export function PhoneCSS({ spin = true }: { spin?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center [perspective:1200px]">
      <div
        className={`relative h-[min(60vh,420px)] aspect-[1/2.05] [transform-style:preserve-3d] ${
          spin ? "animate-[phone-spin_14s_ease-in-out_infinite]" : "[transform:rotateY(-25deg)]"
        }`}
      >
        <div className="absolute inset-0 rounded-[2.2rem] border border-white/25 bg-gradient-to-br from-titanium-300/40 via-titanium-700/40 to-black p-[3%] shadow-[0_0_80px_rgba(109,74,255,0.25)]">
          <div className="relative h-full w-full overflow-hidden rounded-[1.9rem] bg-gradient-to-br from-deep via-[#2b1670] to-black">
            <div className="absolute left-1/2 top-[2.5%] h-[3%] w-[28%] -translate-x-1/2 rounded-full bg-black" />
            <div className="absolute inset-x-0 top-[24%] text-center text-5xl font-semibold text-white/90">9:41</div>
          </div>
        </div>
      </div>
      <style>{`@keyframes phone-spin{0%,100%{transform:rotateY(-35deg) rotateX(4deg)}50%{transform:rotateY(25deg) rotateX(-3deg)}}`}</style>
    </div>
  );
}
