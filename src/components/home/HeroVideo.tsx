"use client";

import { useEffect, useRef, useState } from "react";
import { Parallax } from "@/components/ui/Parallax";

/* Escritorio va casi sin oscurecer (0,95) porque ahí el texto se apoya en el
   degradado lateral, no en el filtro: bajarlo a 0,6 apagaba el vídeo entero
   para sostener una columna de texto que ya estaba sostenida. Móvil sí necesita
   el 0,6, porque el texto cae encima del coche y no hay a dónde apartarlo; con
   0,74 la etiqueta de 11 px se quedaba en 2,99:1, por debajo del 4,5 de AA.
   Todo medido en el navegador componiendo el fotograma real con su velo. */
/**
 * Versión de los ficheros del hero. Se sube UN número cada vez que se
 * reemplaza un vídeo o un póster conservando el nombre.
 *
 * Sin esto, reemplazar el clip no llega a nadie: /videos/ se sirve con
 * `max-age=604800` (siete días, en next.config.ts), así que cualquiera que ya
 * hubiera entrado seguía viendo el vídeo viejo durante una semana. Pasó con el
 * cambio a Full HD: el fichero estaba publicado y no se veía.
 *
 * El navegador cachea por URL completa, interrogante incluido, así que cambiar
 * este número es una URL nueva y una descarga nueva. Es preferible a renombrar
 * los ficheros porque no hay que tocar dos webs y un Drive cada vez.
 */
const V = "4";

const FILTRO_ESCRITORIO = "brightness(0.95) saturate(1.02) contrast(1.02)";
const FILTRO_MOVIL = "brightness(0.6) saturate(0.9) contrast(1.04)";

/**
 * Fondo de vídeo del hero.
 *
 * DOS CLIPS, NO UNO RECORTADO. En escritorio va un clip apaisado (1276x646) y
 * en móvil uno VERTICAL propio (720x1228), porque un 16:9 dentro de una
 * pantalla 9:19,5 pierde el 74 % del ancho: se veía una franja estrecha del
 * centro, y de ahí la sensación de que "en móvil no se aprecia".
 *
 * La elección se hace en JavaScript y no con dos <video> y clases `lg:hidden`
 * porque los dos se descargarían: son 800 KB cada uno. Se lee una sola vez al
 * montar y NO se reacciona al `resize` a propósito — cambiar el `src` de un
 * <video> lo reinicia y enseña el póster un instante, y la única forma real de
 * cruzar los 1024 px en un dispositivo es girar una tablet grande. Estabilidad
 * antes que exactitud en un caso que casi no ocurre.
 *
 * El PÓSTER sí va en el HTML inicial, con <picture>, para que el primer pintado
 * ya sea el correcto en cada tamaño y no haya salto del apaisado al vertical.
 * Es el único sitio del proyecto, junto al logo, donde no se usa next/image:
 * hace falta dirección de arte real (dos ficheros distintos según el ancho) y
 * eso es exactamente lo que resuelve <picture>. Con dos next/image y clases de
 * Tailwind el móvil se bajaría también los 144 KB del póster de escritorio,
 * compitiendo con su propio LCP.
 */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  /* null = todavía no se sabe. Las <source> no se montan hasta saberlo, para
     no llegar a pedir el clip que no toca. */
  const [esMovil, setEsMovil] = useState<boolean | null>(null);
  /* La <source> no se monta en el primer render. Con autoPlay, es montarla lo
     que dispara la descarga, así que este estado es el interruptor. */
  const [fuenteLista, setFuenteLista] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    // El corte coincide con el `lg:` de Tailwind, que es el que separa los dos
    // velos de aquí abajo. Si se cambia uno hay que cambiar el otro.
    setEsMovil(window.matchMedia("(max-width: 1023px)").matches);
  }, []);

  /* El vídeo se pide EN CUANTO el póster está cargado, ni antes ni después.
     Antes se esperaba a que el navegador estuviese ocioso, con hasta 1,2 s de
     margen, y eso es lo que se notaba como "tarda un segundo en arrancar": no
     era la descarga, era la espera.
     El póster es el recurso del LCP. Mientras no ha llegado, pedir 700 KB de
     fondo decorativo le quita ancho de banda a lo que el visitante ha venido a
     ver; en cuanto ha llegado, ya no compite con nada crítico. Así que ese es
     el momento exacto, y además es un hecho medible y no un plazo inventado. */
  useEffect(() => {
    if (reducedMotion) return;
    /* Con ahorro de datos activado, o en 2G/3G, el fondo no compensa: son
       700-800 KB de adorno en la conexión de alguien que ha pedido
       explícitamente que no se gasten. Se queda el póster, que es el mismo
       fotograma. Es lo que ya hace VideoBackdrop en el resto de la web; el
       hero era el único sitio que no lo comprobaba. */
    const conexion = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (conexion?.saveData === true) return;
    if (conexion?.effectiveType && /^(slow-2g|2g|3g)$/.test(conexion.effectiveType)) return;

    const arranca = () => setFuenteLista(true);
    const img = posterRef.current;
    // Si viene de caché el evento `load` ya ha pasado y no volverá a dispararse.
    if (img?.complete) {
      arranca();
      return;
    }
    img?.addEventListener("load", arranca, { once: true });
    // Red de seguridad: si el póster falla, el vídeo no se queda esperándolo.
    const t = window.setTimeout(arranca, 1500);
    return () => {
      img?.removeEventListener("load", arranca);
      window.clearTimeout(t);
    };
  }, [reducedMotion]);

  /* Todo el arranque del vídeo va aquí, y no en un efecto de montaje, porque
     al montar todavía no hay <source>: un escuchador registrado entonces no
     sirve de nada, y para cuando la fuente aparece el evento puede haber
     pasado ya. Por eso además del evento se comprueba el readyState, que es lo
     que ocurría en la práctica — el vídeo llegaba a HAVE_ENOUGH_DATA pero se
     quedaba en pausa y con opacidad 0, o sea que el hero se quedaba sin fondo.
     Y montar la <source> tampoco basta: un <video> que ya intentó cargar no
     vuelve a hacerlo solo porque le aparezca una fuente nueva. */
  useEffect(() => {
    if (!fuenteLista || esMovil === null) return;
    const v = videoRef.current;
    if (!v) return;
    const listo = () => {
      setLoaded(true);
      // Va muted, así que la política de autorreproducción lo permite. Si aun
      // así lo rechaza, se traga: el póster ya está pintado.
      v.play().catch(() => {});
    };
    v.addEventListener("canplay", listo);
    v.load();
    if (v.readyState >= 3) listo();
    return () => v.removeEventListener("canplay", listo);
  }, [fuenteLista, esMovil]);

  const filtro = esMovil ? FILTRO_MOVIL : FILTRO_ESCRITORIO;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#071A3D]">
      {/* El fondo se mueve una fracción de lo que se mueve el contenido: al
          bajar, el texto se despega del vídeo. El -10%/120% extra evita que
          asome el borde inferior mientras el fondo se desplaza. */}
      <Parallax speed={0.18} className="absolute inset-x-0 -top-[10%] h-[120%]">
        {/* Póster — visible desde el primer render y resultado final si se pide
            menos movimiento. Cada ancho se lleva solo su fichero. */}
        <picture>
          <source
            media="(max-width: 1023px)"
            srcSet={`/videos/hero-movil-poster.webp?v=${V}`}
            type="image/webp"
          />
          {/* Dirección de arte: dos ficheros distintos según el ancho, que es
              justo lo que next/image no sabe hacer y <picture> sí. La regla
              no-img-element no salta aquí porque el <img> va dentro de un
              <picture>, que es el uso legítimo. Ver la cabecera. */}
          <img
            ref={posterRef}
            src={`/videos/hero-escritorio-poster.webp?v=${V}`}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: filtro }}
          />
        </picture>

        {!reducedMotion && esMovil !== null && (
          /* El zoom vive en un envoltorio propio: si fuese en el mismo elemento
             que el fade, la transición de opacity y la animación de scale se
             pisarían la una a la otra en la misma propiedad `transform`. */
          <div className={loaded ? "absolute inset-0 cinematic-zoom" : "absolute inset-0"}>
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              /* La panorámica existía SOLO para rescatar el encuadre del clip
                 apaisado en una pantalla vertical. Con el clip vertical sobra,
                 y además descentraría el coche, que va en el eje. */
              /* Sin transición de opacidad. El póster y el primer fotograma
                 del vídeo son la MISMA imagen —1,8/255 de diferencia, medido—,
                 así que el fundido de 1,4 s que había aquí estaba fundiendo una
                 foto consigo misma: no disimulaba ningún salto y retrasaba el
                 momento en que el movimiento se ve a plena intensidad. Ahora el
                 relevo es instantáneo y, por ser el mismo fotograma, invisible. */
              className={`absolute inset-0 h-full w-full object-cover ${
                esMovil ? "" : "cinematic-pan"
              }`}
              style={{ opacity: loaded ? 1 : 0, filter: filtro }}
            >
              {fuenteLista &&
                (esMovil ? (
                  <>
                    {/* WebM primero: Chrome, Android y Firefox se lo llevan y
                        pesa 691 KB frente a los 807 KB del MP4, con mejor
                        SSIM. Safari cae al MP4, que es H.264 y lo reproduce
                        cualquier iPhone. */}
                    <source src={`/videos/hero-movil.webm?v=${V}`} type="video/webm" />
                    <source src={`/videos/hero-movil.mp4?v=${V}`} type="video/mp4" />
                  </>
                ) : (
                  <>
                    {/* Mismo criterio que en móvil: el WebM va primero porque
                        pesa 942 KB frente a los 1.029 KB del MP4 y además da
                        mejor SSIM (0,985 contra 0,975). Safari cae al MP4. */}
                    <source src={`/videos/hero-escritorio.webm?v=${V}`} type="video/webm" />
                    <source src={`/videos/hero-escritorio.mp4?v=${V}`} type="video/mp4" />
                  </>
                ))}
            </video>
          </div>
        )}
      </Parallax>

      {/* Móvil — velo VERTICAL, no un lavado plano.

          Antes el vídeo era apaisado y había que taparlo casi entero (0,82 y
          0,93 en la mitad inferior); ahora el encuadre es el bueno, así que la
          banda del coche pasa a 0,26-0,56 y el coche se ve de verdad.

          Los valores no son de ojo. Se midió en el navegador, componiendo el
          fotograma real con su filtro y este degradado, y leyendo la ratio de
          contraste bajo cada texto:

            etiqueta 11 px      5,64:1   (AA pide 4,5)
            párrafo 16 px       6,98:1
            titular 34 px      muy por encima

          Medido en los CUATRO extremos del bucle, no en un fotograma suelto:
          el cielo del clip cambia de brillo y la etiqueta oscilaba entre 3,70
          y 4,28, o sea que a ratos NO pasaba AA. Estas cifras son la peor de
          las cuatro.

          La forma de la curva es deliberada. La etiqueta va en el 22-24 % y el
          coche en el 45-70 %, así que se aprieta arriba (0,84 hasta el 24 %)
          y se abre justo donde está el coche (0,20 en el 48 %). Es la
          combinación que da MÁS luz al coche de todas las probadas y a la vez
          la que más contraste da al texto: apretar en el centro habría hecho
          lo contrario en las dos cosas. */}
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,26,61,0.96) 0%, rgba(7,26,61,0.90) 12%, rgba(7,26,61,0.84) 24%, rgba(7,26,61,0.46) 34%, rgba(7,26,61,0.20) 48%, rgba(7,26,61,0.50) 60%, rgba(7,26,61,0.86) 72%, rgba(7,26,61,0.95) 100%)",
        }}
      />

      {/* Escritorio — velo de izquierda a derecha, denso donde va el texto.

          Antes empezaba con DIECIOCHO POR CIENTO del ancho en #071A3D opaco:
          una banda azul sólida que tapaba el vídeo por completo, y encima el
          filtro lo bajaba al 60 % de brillo. Entre las dos cosas el clip se
          veía apagado y arrinconado a la derecha.

          Ahora no hay ningún tramo opaco: arranca en 0,86 y se abre. Medido en
          el navegador sobre el fotograma real, el hero pasa de brillo medio 39
          a 61 —un 56 % más de vídeo visible— y el texto sigue holgado:

            titular 34 px      15,74:1
            párrafo 16 px      10,89:1
            etiqueta 11 px      6,41:1   (AA pide 4,5)

          La etiqueta es la que marca el suelo, como siempre: es azul claro y
          pequeña. Aflojar más el arranque del degradado la baja de AA.

          Respira muy lentamente (veil-breathe) para que el fondo nunca quede
          del todo estático; el rango es tan corto que no se lee como cambio
          de brillo, sólo como profundidad. */}
      <div
        className="veil-breathe absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(7,26,61,0.86) 0%, rgba(7,26,61,0.78) 20%, rgba(7,26,61,0.48) 38%, rgba(7,26,61,0.18) 54%, rgba(7,26,61,0.04) 70%, transparent 100%)",
        }}
      />

      {/* Franja superior — mantiene legibles el logo y el nav */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#071A3D] via-[#071A3D]/55 to-transparent" />

      {/* Franja inferior — funde con la siguiente sección */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#071A3D] to-transparent" />

      {/* Acento de marca */}
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-[560px] w-[560px]"
        style={{ background: "radial-gradient(circle, rgba(0,104,255,0.12) 0%, transparent 70%)" }}
      />
    </div>
  );
}
