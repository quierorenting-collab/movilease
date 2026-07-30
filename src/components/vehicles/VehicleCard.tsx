import Image from "next/image";
import Link from "next/link";
import type { VehicleCardData } from "@/lib/data/vehicles";
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS, buildWhatsAppLink } from "@/lib/constants";
import { FavoriteButton } from "@/components/vehicles/FavoriteButton";
import { CompareButton } from "@/components/vehicles/CompareButton";

export function VehicleCard({ vehicle }: { vehicle: VehicleCardData }) {
  const waLink = buildWhatsAppLink(
    `Hola, me interesa el ${vehicle.brandName} ${vehicle.modelName} desde ${vehicle.priceLabel}/mes`
  );

  return (
    /* El levantamiento al pasar el ratón era framer-motion: en el catálogo
       eran ~70 componentes animados por JS para lo que hace una transición
       CSS. Ver .card-lift en globals.css. */
    <div
      className="card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Favorito — persistente en localStorage vía useFavorites */}
      <FavoriteButton vehicleId={vehicle.id} />

      <Link href={`/${vehicle.modelSlug}`} className="flex flex-1 flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#F5F6F8] to-[#EAECEF]">
          {vehicle.imageUrl ? (
            <Image
              src={vehicle.imageUrl}
              alt={`${vehicle.brandName} ${vehicle.modelName}`}
              fill
              className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.06]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span
                className="text-7xl font-bold text-[#0A0A0A]/5"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {vehicle.brandName.charAt(0)}
              </span>
            </div>
          )}

          {/* Offer badge */}
          {vehicle.isOffer && (
            <div className="absolute left-4 top-4">
              <span className="rounded-full bg-[#0068FF] px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-[#0068FF]/25">
                Oferta
              </span>
            </div>
          )}

          {/* Soft reflection at bottom of image */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col px-6 pb-2 pt-5">
          <p
            className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0057D6]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {vehicle.brandName}
          </p>
          <h3
            className="text-[20px] font-bold leading-snug text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {vehicle.modelName}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-[#5B6472] line-clamp-1">
            {vehicle.version}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-[#F5F6F8] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#4B5563]">
              {FUEL_TYPE_LABELS[vehicle.fuelType]}
            </span>
            <span className="rounded-full bg-[#F5F6F8] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#4B5563]">
              {TRANSMISSION_LABELS[vehicle.transmission]}
            </span>
          </div>
        </div>
      </Link>

      {/* Price + CTA */}
      <div className="mt-auto px-6 pb-5 pt-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              desde
            </p>
            <p
              className="text-[27px] font-bold leading-none text-[#0A0A0A]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {vehicle.priceLabel}
              <span className="ml-1 text-[12px] font-medium text-[#5B6472]">/mes</span>
            </p>
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full bg-[#0A0A0A] px-5 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-300 hover:bg-[#0068FF] hover:shadow-lg hover:shadow-[#0068FF]/30"
          >
            Lo quiero
          </a>
        </div>

        {/* Comparador + acceso directo a la ficha */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EDEFF2] pt-3.5">
          <CompareButton vehicleId={vehicle.id} />
          <Link
            href={`/${vehicle.modelSlug}`}
            className="group/link flex min-h-[40px] items-center gap-1.5 px-1 text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#0057D6] transition-colors hover:text-[#0A0A0A]"
          >
            Ver ficha
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover/link:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
