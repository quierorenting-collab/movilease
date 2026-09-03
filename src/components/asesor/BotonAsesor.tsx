"use client";

import { abrirAsesor, type ContextoCoche } from "./abrirAsesor";

/**
 * Boton que abre la ventana del asesor desde cualquier punto de la web.
 *
 * Es una isla de cliente minuscula —un onClick y nada mas— precisamente para
 * poder colocarla dentro de paginas de servidor como la ficha de coche o el
 * catalogo sin convertirlas en cliente.
 *
 * ABRE LA VENTANA, NO NAVEGA A /asesor. Es la diferencia que importa: quien
 * esta mirando un coche y pincha aqui sigue viendo el coche mientras pregunta.
 * Mandarlo a otra pagina le haria perder el sitio justo cuando estaba
 * decidiendo, que es el peor momento posible.
 *
 * `coche` viaja entero con el evento: nombre, version, la cuota mas baja, el
 * kilometraje, el plazo, los servicios y TODAS las filas de la tabla de
 * cuotas. Asi la ventana se abre sabiendo de que coche habla y puede enseñar
 * sus cuotas sin pedir nada a la red y sin riesgo de decir un precio distinto
 * del que el visitante acaba de ver en la pagina.
 */
export function BotonAsesor({
  children,
  className,
  coche,
  conIcono = true,
}: {
  children: React.ReactNode;
  className?: string;
  coche?: ContextoCoche;
  conIcono?: boolean;
}) {
  return (
    <button type="button" onClick={() => abrirAsesor({ coche })} className={className}>
      {conIcono && (
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-current" aria-hidden="true">
          <path d="M12 3c-4.97 0-9 3.36-9 7.5 0 2.3 1.25 4.36 3.2 5.73-.13.98-.5 2.2-1.4 3.28-.2.24-.02.6.29.55 1.9-.3 3.4-1.15 4.35-1.83.82.17 1.68.27 2.56.27 4.97 0 9-3.36 9-7.5S16.97 3 12 3z" />
        </svg>
      )}
      {children}
    </button>
  );
}
