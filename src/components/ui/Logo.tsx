import { useId } from "react";

export function LogoMark({ size = 36 }: { size?: number }) {
  const id = useId();

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-m`} x1="8" y1="92" x2="70" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4DA3FF" />
          <stop offset="0.6" stopColor="#0068FF" />
          <stop offset="1" stopColor="#0042A6" />
        </linearGradient>
        <linearGradient id={`${id}-flag`} x1="45" y1="55" x2="97" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0068FF" />
          <stop offset="1" stopColor="#7CC3FF" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="#061B3F" />

      {/* Pata izquierda de la M (bloque diagonal) */}
      <path d="M10 90 L10 34 L34 16 L34 90 Z" fill={`url(#${id}-m)`} />
      {/* Pata derecha de la M */}
      <path d="M62 90 L62 40 L90 90 Z" fill={`url(#${id}-m)`} />
      <path d="M62 40 L90 90 L66 90 L54 68 Z" fill={`url(#${id}-m)`} />

      {/* Carretera con perspectiva atravesando el valle */}
      <path d="M20 94 L38 94 L58 34 L50 34 Z" fill="#04101F" />
      <path d="M20 94 L38 94 L58 34 L50 34 Z" stroke="#8FB8FF" strokeWidth="0.8" opacity="0.4" />
      <rect x="46" y="72" width="4" height="8" rx="1.5" fill="#ffffff" opacity="0.9" transform="rotate(-12 48 76)" />
      <rect x="51" y="55" width="3.4" height="7" rx="1.4" fill="#ffffff" opacity="0.85" transform="rotate(-12 52.7 58.5)" />
      <rect x="55" y="40" width="2.8" height="6" rx="1.2" fill="#ffffff" opacity="0.8" transform="rotate(-12 56.4 43)" />

      {/* Vaina / flag: destello diagonal que sale disparado hacia arriba-derecha */}
      <path d="M46 58 L58 34 L95 4 L62 42 Z" fill={`url(#${id}-flag)`} />
    </svg>
  );
}

export function Logo({ tagline = true, size = 36 }: { tagline?: boolean; size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="leading-none">
        <span
          className="block font-bold tracking-wider text-white"
          style={{ fontFamily: "var(--font-space-grotesk)", fontSize: size * 0.44 }}
        >
          MOVILE
          <span className="text-primary">A</span>
          SE<sup className="text-[0.4em] text-primary">®</sup>
        </span>
        {tagline && (
          <span className="block text-[8px] tracking-[0.2em] text-primary font-medium uppercase">
            Smart Mobility Platform
          </span>
        )}
      </span>
    </span>
  );
}
