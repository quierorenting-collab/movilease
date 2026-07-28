import Image from "next/image";

/**
 * Logo real (imagen), no un SVG redibujado a mano — el archivo original
 * es una imagen (sin vectorial disponible), así que se usa tal cual.
 * Fondo transparente confirmado; funciona sobre el header oscuro.
 */
export function Logo({ height = 34, className }: { height?: number; className?: string }) {
  const width = Math.round(height * 1.5);

  return (
    <Image
      src="/logo.png"
      alt="MoviLease — Smart Mobility Platform"
      width={width}
      height={height}
      priority
      className={`h-auto ${className ?? ""}`}
      style={{ height, width: "auto" }}
    />
  );
}
