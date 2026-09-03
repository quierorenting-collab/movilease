/**
 * Canal para que cualquier punto de la web abra la ventana del asesor.
 *
 * Se hace con un evento del navegador y no con un contexto de React por una
 * razon concreta de este proyecto: la home, las fichas y el catalogo son
 * componentes de SERVIDOR. Envolverlos en un proveedor obligaria a convertir
 * en cliente arboles enteros que hoy no lo son, y este repositorio acaba de
 * bajar los bytes del primer pintado de 1,2 MB a 300 KB. Un evento no obliga a
 * nada: cada boton es una isla diminuta de cliente y la ventana escucha.
 */
export const EVENTO_ABRIR_ASESOR = "movilease:abrir-asesor";

/** Una fila de la tabla de cuotas, tal y como se publica en la ficha. */
export type CuotaCoche = {
  meses: number;
  km: number;
  /** Ya formateado ("263 €"): el asesor NUNCA calcula un precio, solo repite el publicado. */
  precio: string;
};

/**
 * Todo lo que el asesor sabe del coche desde el que se le ha abierto.
 *
 * Viaja entero y ya formateado a proposito. La alternativa era mandar solo el
 * slug y que la ventana volviera a pedir los datos, pero eso son una peticion
 * de red y una espera para enseñar algo que la pagina YA tiene pintado. Y
 * sobre todo: mandando los mismos textos que ya se ven en la ficha se elimina
 * de raiz que el asesor diga una cuota y la pagina otra.
 */
export type ContextoCoche = {
  nombre: string;
  marca: string;
  modelo: string;
  version?: string;
  slug?: string;
  /** La cuota mas baja publicada, formateada. */
  desde?: string;
  kmAnuales?: number;
  meses?: number;
  serviciosIncluidos?: string[];
  cuotas?: CuotaCoche[];
};

export type DetalleAbrirAsesor = { coche?: ContextoCoche };

export function abrirAsesor(detalle?: DetalleAbrirAsesor) {
  window.dispatchEvent(new CustomEvent(EVENTO_ABRIR_ASESOR, { detail: detalle ?? {} }));
}
