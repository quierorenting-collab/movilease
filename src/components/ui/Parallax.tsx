"use client";

import { useEffect, useRef } from "react";

/**
 * Parallax de fondo muy contenido: el hijo se desplaza una fracción de lo que
 * se desplaza la página, así el fondo "arrastra" respecto al contenido y da
 * profundidad sin llamar la atención.
 *
 * Detalles que importan:
 * - Sólo se toca `transform`, nunca `top`, y se escribe dentro de un
 *   requestAnimationFrame, así que el scroll no dispara layout ni paint.
 * - El listener es pasivo: no puede bloquear el hilo de scroll.
 * - Se desactiva por completo con prefers-reduced-motion y en pantallas
 *   pequeñas, donde el efecto no se aprecia y sí cuesta batería.
 */
export function Parallax({
  children,
  speed = 0.18,
  className = "",
}: {
  children: React.ReactNode;
  /** Fracción del scroll que recorre el fondo (0.18 = se mueve un 18%). */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 1023px)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.parentElement?.getBoundingClientRect();
      if (!rect) return;
      // Sólo cuando la sección está en pantalla: fuera no hay nada que mover
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      el.style.transform = `translate3d(0, ${-rect.top * speed}px, 0)`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
