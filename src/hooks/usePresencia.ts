"use client";

import { useEffect, useState } from "react";

/**
 * Mantiene un nodo montado mientras dura su animación de salida.
 *
 * Es lo único que hacía falta de framer-motion en la cabecera, el banner de
 * cookies y el pop-up: entrar y salir con opacidad y desplazamiento. Esa
 * librería son 43,9 KB comprimidos que se cargaban en TODAS las páginas
 * públicas, porque la cabecera vive en el layout. La entrada se puede hacer con
 * una animación CSS; lo único que CSS no da por sí solo es esperar a que
 * termine la salida antes de desmontar, que es esto.
 *
 * Devuelve `montado` (pinta o no) y `saliendo` (ponle la clase de salida).
 */
export function usePresencia(abierto: boolean, msSalida = 300) {
  const [montado, setMontado] = useState(abierto);

  useEffect(() => {
    if (abierto) {
      setMontado(true);
      return;
    }
    const t = setTimeout(() => setMontado(false), msSalida);
    return () => clearTimeout(t);
  }, [abierto, msSalida]);

  return { montado, saliendo: montado && !abierto };
}
