"use client";

import { useState } from "react";
import Image from "next/image";
import { fotoHeroMovil } from "@/lib/utils";
import type { VehicleGalleryImage } from "@/lib/data/vehicles";

export function VehicleGallery({
  images,
  alt,
}: {
  images: VehicleGalleryImage[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div
        className="flex aspect-[4/3] w-full items-center justify-center rounded-3xl bg-gradient-to-b from-[#141414] to-[#0E0E0E] text-7xl font-bold text-white/20"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        {alt.charAt(0)}
      </div>
    );
  }

  const current = images[active];
  const hasMultiple = images.length > 1;

  function prev() {
    setActive((i) => (i === 0 ? images.length - 1 : i - 1));
  }
  function next() {
    setActive((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div>
      <div
        className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[#0E0E0E]"
        style={{ boxShadow: "0 40px 80px -20px rgba(0, 0, 0, 0.7)" }}
      >
        {/* Aqui NO se usa next/image, y es a proposito.

            Desde que Vercel dejo de optimizar imagenes (cuota agotada, 402 en
            /_next/image) next/image no redimensiona nada: se limita a pintar
            un <img> con la foto original. Lo unico que seguia aportando era el
            preload de `priority`... y ese preload era justo el problema: Next
            lo escribe SIN media query, apuntando siempre a la foto de 1.000 px.
            Con un <picture> el movil acababa bajandose las dos, la de 800 que
            se ve y la de 1.000 que no, o sea mas peso que antes de optimizar.
            Medido en local: 136 KB en vez de 35.

            Con srcset/sizes nativos el navegador elige UN fichero y baja solo
            ese: en un movil de 375 px la caja mide 327 y a 2x pide la de 800;
            en escritorio, donde se ve a 568, pide la de 1.000. El preload de
            `priority` no hace falta para el LCP porque esta foto va en el HTML
            inicial y el preload scanner la encuentra igual; fetchPriority alto
            y loading eager le dan la misma prioridad sin atarla a una medida.

            Si no hay version reducida —una foto de galeria, que no es portada—
            fotoHeroMovil devuelve la misma ruta y se sirve sin srcset. */}
        {(() => {
          const pequena = fotoHeroMovil(current.url);
          const hayDosMedidas = pequena && pequena !== current.url;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={current.url}
              src={current.url}
              srcSet={hayDosMedidas ? `${pequena} 800w, ${current.url} 1008w` : undefined}
              sizes={hayDosMedidas ? "(max-width: 1024px) 100vw, 50vw" : undefined}
              alt={current.alt ?? alt}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain p-4"
            />
          );
        })()}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Mismo aviso que en la tarjeta del catalogo: el color y el acabado de
            la foto de estudio no tienen por que ser los del coche entregado. */}
        <p className="pointer-events-none absolute inset-x-0 bottom-0 px-3 pr-16 pb-2 text-center text-[11px] leading-tight text-white/55">
          {/* En movil el texto largo se partia en dos lineas sobre el capo del
              coche. Ahi se deja lo imprescindible y la frase entera vuelve a
              partir de sm, donde cabe en una linea. */}
          <span className="sm:hidden">Imagen no contractual</span>
          <span className="hidden sm:inline">
            Imagen no contractual: puede no coincidir con el modelo ofertado
          </span>
        </p>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              /* opacity-0 + group-hover:opacity-100 significa que en un móvil,
               donde no hay hover, estas flechas NO SE VEÍAN NUNCA: la galería
               parecía una foto fija. Ahora se ven siempre en táctil y siguen
               apareciendo al pasar el ratón en escritorio. Y 10x10 se queda
               corto para un pulgar: 44px es el mínimo. */
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-100 backdrop-blur-sm transition-opacity hover:bg-black/70 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M10 3L5 8L10 13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Foto siguiente"
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-100 backdrop-blur-sm transition-opacity hover:bg-black/70 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M6 3L11 8L6 13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <span className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === active}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl transition-all duration-300 ${
                i === active ? "opacity-100 ring-2 ring-[#0068FF]" : "opacity-50 hover:opacity-80"
              }`}
            >
              {/* object-contain, no cover: la foto grande de arriba va en
                  contain y estas miniaturas iban en cover, así que el MISMO
                  coche salía entero y recortado a la vez en la misma pantalla. */}
              <Image src={img.url} alt={img.alt ?? `${alt} foto ${i + 1}`} fill sizes="96px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
