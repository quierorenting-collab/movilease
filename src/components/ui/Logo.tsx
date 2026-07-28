/**
 * Logo vectorial real (SVG). Se usa <img> normal (no next/image) porque
 * es un SVG local ya escalable — next/image bloquea SVGs por defecto
 * salvo que se active `dangerouslyAllowSVG`, innecesario aquí.
 */
export function Logo({ height = 34, className }: { height?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="MoviLease — Smart Mobility Platform"
      style={{ height, width: "auto" }}
      className={className}
    />
  );
}
