"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import type { VehicleCardData } from "@/lib/data/vehicles";
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS, buildWhatsAppLink } from "@/lib/constants";

export function VehicleCard({ vehicle }: { vehicle: VehicleCardData }) {
  const [fav, setFav] = useState(false);
  const waLink = buildWhatsAppLink(
    `Hola, me interesa el ${vehicle.brandName} ${vehicle.modelName} desde ${vehicle.priceLabel}/mes`
  );

  return (
    <motion.div
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Favorite */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setFav(!fav);
        }}
        aria-label="Guardar favorito"
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110"
      >
        <svg
          viewBox="0 0 24 24"
          fill={fav ? "#0068FF" : "none"}
          stroke={fav ? "#0068FF" : "#9CA3AF"}
          strokeWidth="1.8"
          className="h-4 w-4 transition-colors"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

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
              <span className="rounded-full bg-[#0068FF] px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-[#0068FF]/25">
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
            className="mb-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#0068FF]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {vehicle.brandName}
          </p>
          <h3
            className="text-[19px] font-bold leading-snug text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {vehicle.modelName}
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-[#9CA3AF] line-clamp-1">
            {vehicle.version}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-[#F5F6F8] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              {FUEL_TYPE_LABELS[vehicle.fuelType]}
            </span>
            <span className="rounded-full bg-[#F5F6F8] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              {TRANSMISSION_LABELS[vehicle.transmission]}
            </span>
          </div>
        </div>
      </Link>

      {/* Price + CTA */}
      <div className="mt-auto flex items-end justify-between px-6 pb-6 pt-4">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#C4C9D0]">
            desde
          </p>
          <p
            className="text-[26px] font-bold leading-none text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {vehicle.priceLabel}
            <span className="ml-1 text-[11px] font-medium text-[#9CA3AF]">/mes</span>
          </p>
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="group/btn relative overflow-hidden rounded-full bg-[#0A0A0A] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:bg-[#0068FF] hover:shadow-lg hover:shadow-[#0068FF]/30"
        >
          Lo quiero
        </a>
      </div>
    </motion.div>
  );
}
