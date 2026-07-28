import Image from "next/image";

/**
 * Logo real (imagen), no un SVG redibujado a mano — el archivo original
 * es una imagen (sin vectorial disponible), así que se usa tal cual.
 * Fondo transparente confirmado; funciona sobre el header oscuro.
 */
export function Logo({ height = 34 }: { height?: number }) {
  // Proporción real del archivo: 1536x1024 ≈ 1.5:1
  const width = Math.round(height * 1.5);

  return (
    <Image
      src="/brand/movilease-logo.png"
      alt="MoviLease — Smart Mobility Platform"
      width={width}
      height={height}
      priority
      className="h-auto"
      style={{ height, width: "auto" }}
    />
  );
}
