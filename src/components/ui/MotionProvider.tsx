"use client";

import { MotionConfig } from "framer-motion";

/**
 * Hace que framer-motion respete "reducir movimiento" en toda la web pública.
 *
 * La excepción de globals.css que pone las duraciones a 0,001 ms **no le
 * afecta**: framer-motion no usa transiciones CSS, escribe `style.transform` y
 * `style.opacity` fotograma a fotograma desde requestAnimationFrame. Así que
 * con el ajuste del sistema activado, la cabecera seguía entrando desde
 * y:-40, el menú móvil seguía deslizando sus siete entradas escalonadas y el
 * pop-up seguía saltando. Justo lo que ese ajuste existe para evitar.
 *
 * `reducedMotion="user"` deja pasar las animaciones de opacidad y anula las de
 * transform, scale, x e y: el contenido sigue apareciendo, pero sin
 * desplazarse. Los componentes que ya consultan matchMedia por su cuenta
 * —Reveal, Parallax, HeroVideo, HeroImage y VideoBackdrop— siguen funcionando
 * igual; esto solo cubre lo que se les escapaba.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
