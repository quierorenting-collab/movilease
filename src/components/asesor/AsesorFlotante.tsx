"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* El asesor compilado son unos 11 KB, pero lo caro no son los bytes: su efecto
   de arranque pide /api/asesor/faq nada mas montarse. Importado de forma
   normal, cada visita a cada pagina publica pagaria esa peticion aunque nadie
   abriera el panel. Con la importacion diferida el codigo y la peticion no
   existen hasta que alguien pulsa el boton.

   `ssr: false` porque no hay nada que pre-renderizar de una ventana cerrada.
   Tiene que declararse en este archivo, que es de cliente: escrito dentro de
   (public)/layout.tsx, que es de servidor, el compilador aborta el build. */
const Asesor = dynamic(() => import("./Asesor").then((m) => m.Asesor), {
  ssr: false,
  loading: () => (
    <p className="py-6 text-center text-[13px] text-white/60">Abriendo el asesor…</p>
  ),
});

/**
 * Boton flotante que abre el asesor en una ventana, sin salir de la pagina.
 *
 * POR QUE UNA VENTANA Y NO UN ENLACE A /asesor: el asesor estaba publicado
 * pero solo se llegaba a el desde el pie y desde un boton al final de la home.
 * Estaba hecho y no lo veia casi nadie.
 *
 * POR QUE ENCIMA DEL DE WHATSAPP Y NO AL LADO: compartir el carril obligaba a
 * apartar el verde, que lleva ahi desde el principio y es el canal que mas
 * convierte. Apilarlo deja los dos, y la clase .bottom-fab-2 los sube juntos
 * cuando el banner de cookies reserva su franja.
 *
 * POR QUE NO ES UN MODAL: no lleva velo, no bloquea el scroll y no atrapa el
 * tabulador, a proposito. Es un panel que convive con la pagina, como el chat
 * de cualquier web: la pagina de detras sigue siendo util mientras esta
 * abierto, asi que secuestrar el teclado seria mentirle a quien navega con el.
 * Por eso lleva role="dialog" pero NO aria-modal. Lo que si hace, porque es lo
 * que se espera de un dialogo: Escape lo cierra y el foco vuelve al boton.
 *
 * OJO con el bloqueo de scroll: Header y LeadPopup escriben los dos en
 * document.body.style.overflow sin contador, asi que se pisan entre ellos.
 * Este componente no toca esa propiedad justamente para no meter un tercero
 * en esa pelea.
 */
export function AsesorFlotante() {
  /* Dos estados y no uno: `montado` no vuelve nunca a false, asi que el codigo
     del asesor se pide una sola vez y el visitante que cierra y reabre
     encuentra su conversacion donde la dejo. Desmontarlo al cerrar le haria
     empezar de cero y, si volviera a dejar su telefono, crearia un segundo
     expediente con los mismos datos. */
  const [montado, setMontado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const botonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  function abrir() {
    setMontado(true);
    setAbierto(true);
  }

  useEffect(() => {
    if (!abierto) return;

    /* El pop-up de captacion salta a los 5 s o al 10 % de scroll y va a z-60,
       muy por encima de esta ventana: si coinciden, tapa al asesor justo
       cuando el visitante estaba usandolo. Esta marca en el <html> le dice que
       espere, con el mismo criterio que ya usa con el banner de cookies. */
    document.documentElement.dataset.asesorAbierto = "1";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", onKey);

    /* El foco entra en el panel para que quien navega con teclado no tenga que
       recorrer la pagina entera hasta encontrarlo. Va al primer control real
       si ya hay uno; si el codigo aun se esta descargando, al propio panel. */
    const primero = panelRef.current?.querySelector<HTMLElement>(
      "button:not([disabled]), a[href], input:not([disabled])"
    );
    (primero ?? panelRef.current)?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      delete document.documentElement.dataset.asesorAbierto;
    };
  }, [abierto]);

  /* El foco vuelve al boton al cerrar, pero solo si la ventana llego a estar
     abierta: sin esta comprobacion, el boton robaria el foco en la primera
     carga de todas las paginas. */
  const estuvoAbierto = useRef(false);
  useEffect(() => {
    if (abierto) estuvoAbierto.current = true;
    else if (estuvoAbierto.current) botonRef.current?.focus();
  }, [abierto]);

  /* En /asesor el asistente ya ocupa la pagina entera: un boton flotante para
     abrir lo mismo que se esta mirando solo tapa contenido. Mismo criterio que
     sigue el pop-up con SILENCED_PATHS. La comprobacion va DESPUES de los
     hooks, que no pueden ejecutarse condicionalmente. */
  if (pathname?.startsWith("/asesor")) return null;

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        aria-expanded={abierto}
        aria-label={abierto ? "Cerrar el asesor" : "Abrir el asesor de renting"}
        title={abierto ? "Cerrar el asesor" : "Habla con nuestro asesor"}
        /* Sin ninguna clase .btn-*: esas fijan min-height 54px y padding
           1rem 2rem sin @layer, asi que ganarian a las utilidades y romperian
           el circulo. Se copia la construccion del boton de WhatsApp. */
        className="bottom-fab-2 fab-enter-2 fixed right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF] shadow-[0_8px_28px_rgba(0,104,255,0.35)] transition-[background-color,box-shadow,transform] duration-300 hover:scale-105 hover:bg-[#0057D6] hover:shadow-[0_12px_36px_rgba(0,104,255,0.45)]"
      >
        {abierto ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white" aria-hidden="true">
            <path d="M12 3c-4.97 0-9 3.36-9 7.5 0 2.3 1.25 4.36 3.2 5.73-.13.98-.5 2.2-1.4 3.28-.2.24-.02.6.29.55 1.9-.3 3.4-1.15 4.35-1.83.82.17 1.68.27 2.56.27 4.97 0 9-3.36 9-7.5S16.97 3 12 3z" />
          </svg>
        )}
      </button>

      {/* Se oculta con `display` en linea y no con una clase: globals.css no
          tiene ninguna @layer, asi que cualquier regla suya con `display`
          ganaria a una utilidad de Tailwind. Ya paso una vez con el boton de
          WhatsApp, que se veia en movil pese a llevar `hidden`. */}
      {montado && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Asesor de renting"
          tabIndex={-1}
          style={{ display: abierto ? "flex" : "none" }}
          /* z-[35] deja la ventana por encima de todo el contenido (que no
             pasa de 30) y por debajo de la cabecera, el menu movil y el banner
             de cookies (40-50), que tienen que seguir siendo alcanzables.

             Fondo OPACO obligatorio: el asesor es bg-white/[0.03] con texto
             blanco y hasta ahora el oscuro se lo daba la seccion de /asesor.
             Abierto sobre una ficha, que es clara, quedaria blanco sobre
             blanco. */
          className="asesor-ventana fixed right-4 left-4 z-[35] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#10306B] shadow-[0_24px_64px_rgba(0,0,0,0.45)] sm:left-auto sm:right-6 sm:w-[380px]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
            <div>
              <p className="text-[13px] font-semibold text-white">Asesor MoviLease</p>
              <p className="text-[11px] text-white/55">Siempre el mismo asesor</p>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar el asesor"
              className="-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </button>
          </div>

          {/* Scroll propio: el paso final con perfil de empresa son nueve
              requisitos documentales que a este ancho pasan de los 560 px de
              alto, y sin scroll el boton de WhatsApp del cierre se quedaria
              fuera de la ventana justo en el momento de convertir. */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <Asesor variante="ventana" />
          </div>
        </div>
      )}
    </>
  );
}
