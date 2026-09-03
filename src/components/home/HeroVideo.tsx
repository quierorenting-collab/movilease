"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Parallax } from "@/components/ui/Parallax";

const FILTER = "brightness(0.6) saturate(0.75) contrast(1.05)";

/**
 * Fondo de vídeo del hero — mismo tratamiento de contraste que tenía
 * HeroImage (velo fuerte a la izquierda, donde va el texto; se aclara hacia
 * la derecha) pero a pantalla completa, porque aquí no hay un coche que
 * aislar en una columna: es ambiente urbano, no producto.
 *
 * Clip propio (no Pexels), generado con scripts/build-section-video.mjs a
 * partir de public/videos/hero.mp4. El póster es el primer fotograma del
 * propio vídeo, así no hay salto de escena al empezar a reproducir.
 */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  /* La <source> no se monta en el primer render. Con autoPlay, es montarla lo
     que dispara la descarga, así que este estado es el interruptor. */
  const [fuenteLista, setFuenteLista] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);


  /* El vídeo son 840 KB —el 54 % de todo lo que pide la home— y con
     preload="auto" el navegador los pedía a los 65 ms, ANTES de que terminara
     de llegar el póster, que es el recurso del LCP. O sea que el fondo
     decorativo competía con lo que el visitante ha venido a leer.
     Se espera a que el navegador esté ocioso: el póster ya está pintado desde
     el primer render, así que el hero se ve igual mientras tanto. */
  useEffect(() => {
    if (reducedMotion) return;
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
    if (!fuenteLista) return;
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
  }, [fuenteLista]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#071A3D]">
      {/* El fondo se mueve una fracción de lo que se mueve el contenido: al
          bajar, el texto se despega del vídeo. El -10%/120% extra evita que
          asome el borde inferior mientras el fondo se desplaza. */}
      <Parallax speed={0.18} className="absolute inset-x-0 -top-[10%] h-[120%]">
      {/* Póster — visible desde el primer render y resultado final si se pide menos movimiento */}
      <Image
        src="/videos/hero-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 object-cover"
        style={{ filter: FILTER }}
      />

      {!reducedMotion && (
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
            className="cinematic-pan absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-out"
            style={{ opacity: loaded ? 1 : 0, filter: FILTER }}
          >
            {fuenteLista && <source src="/videos/hero.mp4" type="video/mp4" />}
          </video>
        </div>
      )}
      </Parallax>

      {/* Móvil — velo VERTICAL, no un lavado plano.

          Antes era `bg-[#071A3D]/78` sobre toda la pantalla: el vídeo estaba
          ahí, reproduciéndose, y se veía al 22 % de brillo. Sumado al 74 % de
          ancho que se pierde por el object-cover en vertical, el visitante de
          móvil veía una franja estrecha y casi negra. De ahí la sensación de
          que "en móvil no se aprecia".

          Ahora el velo hace lo mismo que el de escritorio pero en el eje que
          tiene sentido en un teléfono: una franja densa arriba para el logo y
          el menú, luego se abre casi del todo (0,14) en el tramo del 20 % al
          33 %, que es donde el vídeo por fin se ve, y a partir del 42 % vuelve
          a cerrarse para sostener el titular y los botones, que ahora van
          abajo. Los tramos densos caen exactamente sobre el texto, medido, no
          estimado. */}
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,26,61,0.92) 0%, rgba(7,26,61,0.55) 9%, rgba(7,26,61,0.18) 20%, rgba(7,26,61,0.14) 33%, rgba(7,26,61,0.42) 42%, rgba(7,26,61,0.82) 52%, rgba(7,26,61,0.93) 64%, rgba(7,26,61,0.96) 100%)",
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
