/**
 * Logo vectorial real (SVG). Se usa <img> normal (no next/image) porque
 * es un SVG local ya escalable — next/image bloquea SVGs por defecto
 * salvo que se active `dangerouslyAllowSVG`, innecesario aquí.
 *
 * El archivo trae el texto "MOVILEASE" en azul marino: sobre fondo claro
 * se lee perfectamente, pero en el header y el footer (fondo oscuro) se
 * volvía casi invisible. `variant="white"` lo vuelve blanco sólido vía
 * filtro CSS — sin generar un segundo SVG — para usarlo directo sobre
 * fondo oscuro, sin la caja blanca que llevaba antes.
 */
export function Logo({
  height,
  variant = "white",
  className,
}: {
  /**
   * Número (px) fijo. Si se omite, el tamaño lo controla `className` con
   * utilidades h-* de Tailwind — necesario para tamaños responsive
   * (clamp() en el alto de un <img> con width:auto se comportó de forma
   * inconsistente entre navegadores, así que el breakpoint por clases es
   * la vía fiable).
   */
  height?: number;
  variant?: "color" | "white";
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="MoviLease — Smart Mobility Platform"
      /* Sin width/height el navegador no conoce la proporción hasta que llegan
         los 13 KB del SVG, así que el ancho usado es 0 y la fila del header
         —un flex con justify-between— se recoloca de golpe al llegar. Es un
         salto de maquetación encima del pliegue, en todas las páginas. Los dos
         números salen del viewBox del propio fichero: "193 315 1131 266". Con
         un alto fijado por CSS y width auto, el ancho queda reservado. */
      width={1131}
      height={266}
      style={{
        height,
        width: "auto",
        filter: variant === "white" ? "brightness(0) invert(1)" : undefined,
      }}
      className={className}
    />
  );
}
