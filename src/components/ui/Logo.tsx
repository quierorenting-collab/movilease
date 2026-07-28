let gradientId = 0;

export function LogoMark({ size = 36 }: { size?: number }) {
  const id = `movilease-logo-grad-${gradientId++}`;

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="4" y1="34" x2="36" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4DA3FF" />
          <stop offset="1" stopColor="#0068FF" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="9" fill="#061B3F" />
      <path
        d="M8 30V12l8 10 8-10v18"
        stroke={`url(#${id})`}
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 20 L34 8" stroke={`url(#${id})`} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
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
          MOVILEASE<sup className="text-[0.4em] text-primary">®</sup>
        </span>
        {tagline && (
          <span className="block text-[8px] tracking-[0.2em] text-primary font-medium uppercase">
            Smart Mobility Company
          </span>
        )}
      </span>
    </span>
  );
}
