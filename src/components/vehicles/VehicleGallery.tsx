"use client";

import { useState } from "react";
import Image from "next/image";
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
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt ?? alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-4"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Mismo aviso que en la tarjeta del catalogo: el color y el acabado de
            la foto de estudio no tienen por que ser los del coche entregado. */}
        <p className="pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-2 text-center text-[9px] leading-tight text-white/35">
          Imagen no contractual: puede no coincidir con el modelo ofertado
        </p>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-black/70 group-hover:opacity-100"
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
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-black/70 group-hover:opacity-100"
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
              <Image src={img.url} alt={img.alt ?? `${alt} foto ${i + 1}`} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
