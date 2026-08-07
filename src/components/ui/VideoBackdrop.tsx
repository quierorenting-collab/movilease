"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fondo de vídeo para secciones, pensado para no costar nada a quien no llega
 * a verlo:
 *
 * - `preload="none"` y las <source> no se montan hasta que la sección está
 *   cerca del viewport: el vídeo no entra en la carga inicial ni afecta al LCP.
 * - El póster se pinta como imagen de fondo desde el primer render, así que la
 *   sección nunca aparece vacía ni da salto de layout.
 * - No se descarga vídeo si el visitante pide menos movimiento
 *   (prefers-reduced-motion) o tiene el ahorro de datos activado.
 * - Si el archivo no existe todavía, o falla, se queda el póster / el degradado:
 *   la sección sigue siendo correcta sin ningún asset.
 *
 * El velo (`veil`) es lo que mantiene legible el contenido encima. Sin él, un
 * vídeo real destroza el contraste del texto.
 */
export function VideoBackdrop({
  mp4,
  webm,
  poster,
  /** Color/degradado del velo que va sobre el vídeo. */
  veil = "linear-gradient(180deg, rgba(244,246,250,0.92) 0%, rgba(244,246,250,0.80) 45%, rgba(244,246,250,0.94) 100%)",
  /** Base visible mientras no hay póster ni vídeo. */
  base = "#F4F6FA",
  /** Pensado para fondo claro (aclara y desatura). Secciones oscuras pasan
   *  algo más apagado, p. ej. "brightness(0.55) saturate(0.7) contrast(1.1)". */
  filter = "saturate(0.55) brightness(1.08) contrast(0.95)",
  className = "",
}: {
  mp4?: string;
  webm?: string;
  poster?: string;
  veil?: string;
  base?: string;
  filter?: string;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !(mp4 || webm)) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    // @ts-expect-error saveData no está en el tipo estándar de Navigator
    const saveData = navigator.connection?.saveData === true;
    if (media.matches || saveData) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    // 400px de margen: empieza a cargar justo antes de entrar en pantalla
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [mp4, webm]);

  // Pausa el vídeo cuando la sección no está a la vista: no gasta CPU de fondo
  useEffect(() => {
    const host = hostRef.current;
    const video = videoRef.current;
    if (!host || !video || !shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) void video.play().catch(() => {});
          else video.pause();
        }
      },
      { threshold: 0 }
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        background: poster ? `${base} center/cover no-repeat url(${poster})` : base,
      }}
    >
      {shouldLoad && (mp4 || webm) && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
          style={{ opacity: playing ? 1 : 0, filter }}
        >
          {webm && <source src={webm} type="video/webm" />}
          {mp4 && <source src={mp4} type="video/mp4" />}
        </video>
      )}

      {/* Velo: sin esto el texto de la sección no se lee sobre el vídeo.
          La clase lo aligera en móvil, donde si no el vídeo no se aprecia. */}
      <div className="video-veil absolute inset-0" style={{ background: veil }} />
    </div>
  );
}
