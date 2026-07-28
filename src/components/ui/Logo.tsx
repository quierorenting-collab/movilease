import { useId } from "react";

export function LogoMark({ size = 36 }: { size?: number }) {
  const id = useId();

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-m`} x1="10" y1="90" x2="90" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4DA3FF" />
          <stop offset="0.55" stopColor="#0068FF" />
          <stop offset="1" stopColor="#0042A6" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="#061B3F" />
      {/* Isotipo M — dos picos, como una carretera de montaña */}
      <path
        d="M18 84 L18 22 L50 60 L82 10 L82 84"
        stroke={`url(#${id}-m)`}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Carretera atravesando el valle de la M, con perspectiva hacia el horizonte */}
      <path
        d="M25 91 L50 59 L85 13"
        stroke="#04101F"
        strokeWidth="7.5"
        strokeLinecap="round"
      />
      <path
        d="M25 91 L50 59 L85 13"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="6 7"
        opacity="0.85"
      />
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
