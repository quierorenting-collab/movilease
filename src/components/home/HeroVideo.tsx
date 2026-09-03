"use client";

import { useEffect, useRef, useState } from "react";
import { Parallax } from "@/components/ui/Parallax";

/* Mismo brillo en los dos, y no por comodidad: subirlo a 0,74 en móvil dejaba
   la etiqueta "SMART MOBILITY PLATFORM" —azul claro, 11 px— en 2,99:1 sobre el
   cielo del clip, por debajo del 4,5 que exige AA. Medido en el navegador
   componiendo el fotograma real con su velo, no estimado. Lo que sí sube en
   móvil es la saturación: el clip vertical es de exterior y aguanta más color
   sin que el texto pierda. */
const FILTRO_ESCRITORIO = "brightness(0.6) saturate(0.75) contrast(1.05)";
const FILTRO_MOVIL = "brightness(0.6) saturate(0.9) contrast(1.04)";

/**
 * Fondo de vídeo del hero.
 *
 * DOS CLIPS, NO UNO RECORTADO. En escritorio va el ambiente urbano apaisado de
 * siempre. En móvil va un clip VERTICAL propio (720x1228), porque un 16:9
 * dentro de una pantalla 9:19,5 pierde el 74 % del ancho: se veía una franja
 * estrecha del centro, y de ahí la sensación de que "en móvil no se aprecia".
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

  /* El vídeo son ~800 KB y con preload="auto" el navegador los pedía a los
     65 ms, ANTES de que terminara de llegar el póster, que es el recurso del
     LCP. O sea que el fondo decorativo competía con lo que el visitante ha
     venido a leer. Se espera a que el navegador esté ocioso: el póster ya está
     pintado desde el primer render, así que el hero se ve igual mientras tanto. */
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
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    };
    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(arranca, { timeout: 1200 });
      return;
    }
    const t = window.setTimeout(arranca, 1200);
    return () => window.clearTimeout(t);
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
            srcSet="/videos/hero-movil-poster.webp"
            type="image/webp"
          />
          {/* Dirección de arte: dos ficheros distintos según el ancho, que es
              justo lo que next/image no sabe hacer y <picture> sí. La regla
              no-img-element no salta aquí porque el <img> va dentro de un
              <picture>, que es el uso legítimo. Ver la cabecera. */}
          <img
            src="/videos/hero-poster.webp"
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
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-out ${
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
                    <source src="/videos/hero-movil.webm" type="video/webm" />
                    <source src="/videos/hero-movil.mp4" type="video/mp4" />
                  </>
                ) : (
                  <source src="/videos/hero.mp4" type="video/mp4" />
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
          Respira muy lentamente (veil-breathe) para que el fondo nunca quede
          del todo estático; el rango es tan corto que no se lee como cambio
          de brillo, sólo como profundidad. */}
      <div
        className="veil-breathe absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, #071A3D 0%, #071A3D 18%, rgba(7,26,61,0.88) 34%, rgba(7,26,61,0.5) 50%, rgba(7,26,61,0.2) 66%, rgba(7,26,61,0.06) 80%, transparent 100%)",
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
