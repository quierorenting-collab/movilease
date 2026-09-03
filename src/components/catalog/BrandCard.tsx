import Image from "next/image";
import Link from "next/link";
import type { BrandSummary } from "@/lib/data/vehicles";

export function BrandCard({ brand }: { brand: BrandSummary }) {
  const href = `/catalogo?brand=${encodeURIComponent(brand.brandName.toLowerCase())}`;
  /**
   * El optimizador de Next devuelve 400 para SVG salvo que se active
   * dangerouslyAllowSVG. Como los SVG ya son vectoriales y pesan 9-13 kB, se
   * sirven tal cual: seguimos usando next/image por las dimensiones (sin CLS)
   * pero sin pasar por el optimizador.
   */
  const isSvg = brand.logoUrl?.endsWith(".svg") ?? false;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-hover"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Logo tile */}
      <div className="relative flex h-[132px] items-center justify-center overflow-hidden bg-[#F7F8FA] px-6">
        {brand.logoUrl ? (
          /* width/height explícitos: sin ellos el logo no reservaba espacio y
             la tarjeta saltaba al cargar (CLS). */
          <Image
            src={brand.logoUrl}
            alt={`Logo de ${brand.brandName}`}
            width={240}
            height={64}
            unoptimized={isSvg}
            className="max-h-16 w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          /* Sin logo. Hoy le pasa a Honda y a Mercedes-Benz: no hay fichero en
             public/brands/ para esas dos, y el resto de la rejilla sí lo
             tiene, así que la tarjeta cantaba. En vez de un nombre suelto en
             gris, se compone como una placa: el nombre bien espaciado sobre
             una línea de acento. Deja de parecer un hueco y pasa por una
             decisión.

             El arreglo de verdad es el fichero: en cuanto haya
             public/brands/honda.svg y public/brands/mercedes-benz.svg, y su
             línea en EXTENSION_BY_SLUG de src/lib/brand-logos.ts, salen solos
             y esto no se ve. */
          <span className="flex flex-col items-center gap-2.5">
            <span
              className="text-center text-[22px] font-bold uppercase leading-none tracking-[0.14em] text-[#0A0A0A]/80"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {brand.brandName}
            </span>
            <span className="block h-[3px] w-9 rounded-full bg-[#0057D6]/70" />
          </span>
        )}
      </div>

      {/* Brand name */}
      <div className="px-5 pt-5">
        <p
          className="text-[19px] font-bold leading-tight text-[#0A0A0A]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {brand.brandName}
        </p>
        {/* Contaba los coches de la marca. Casi todas tienen uno o dos, así
            que la rejilla entera se leía como "1 vehículo disponible" repetido
            y eso encoge la empresa a ojos del visitante. Misma regla que en el
            resto de la web: nada de cifras de tamaño. */}
        <p className="mt-2 text-[13px] text-[#5B6472]">Renting con todo incluido</p>
      </div>

      {/*
        Footer en dos filas fijas, nunca precio y CTA en la misma línea: en la
        rejilla de 5 columnas la tarjeta mide ~200 px y no caben juntos, y los
        breakpoints sm: no sirven porque miran el ancho de la ventana, no el de
        la tarjeta. Mismo patrón que el pie de VehicleCard.
      */}
      <div className="mt-auto px-5 pb-4 pt-4">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
          desde
        </p>
        <p
          className="mt-1 text-[22px] font-bold leading-none text-[#0A0A0A]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {brand.cheapestPriceLabel}
          <span className="ml-1 text-[12px] font-medium text-[#5B6472]">/mes</span>
        </p>

        <span className="mt-4 flex items-center justify-between gap-2 border-t border-[#EDEFF2] pt-3.5 text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#0057D6]">
          <span className="whitespace-nowrap">Ver modelos</span>
          <span
            aria-hidden="true"
            className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
