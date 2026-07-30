"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onCanPlay = () => setLoaded(true);
    v.addEventListener("canplay", onCanPlay, { once: true });
    return () => v.removeEventListener("canplay", onCanPlay);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#071A3D]">
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
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
          style={{ opacity: loaded ? 1 : 0, filter: FILTER }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      )}

      {/* Móvil — oscurecido fuerte para que el texto siempre se lea */}
      <div className="absolute inset-0 bg-[#071A3D]/78 lg:hidden" />

      {/* Escritorio — velo de izquierda a derecha, denso donde va el texto */}
      <div
        className="absolute inset-0 hidden lg:block"
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
