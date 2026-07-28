"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { VehicleCardData } from "@/lib/data/vehicles";
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS, buildWhatsAppLink } from "@/lib/constants";

export function VehicleCard({ vehicle }: { vehicle: VehicleCardData }) {
  const waLink = buildWhatsAppLink(
    `Hola, me interesa el ${vehicle.brandName} ${vehicle.modelName} desde ${vehicle.priceLabel}/mes`
  );

  return (
    <motion.div
      className="group relative flex flex-col bg-white"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      <Link href={`/${vehicle.modelSlug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F3F4F6]">
          {vehicle.imageUrl ? (
            <Image
              src={vehicle.imageUrl}
              alt={`${vehicle.brandName} ${vehicle.modelName}`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span
                className="text-7xl font-bold text-[#0A0A0A]/6"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {vehicle.brandName.charAt(0)}
              </span>
            </div>
          )}

          {/* Offer badge */}
          {vehicle.isOffer && (
            <div className="absolute left-0 top-4">
              <span className="bg-[#0068FF] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white shadow-sm">
                Oferta
              </span>
            </div>
          )}

          {/* Bottom gradient for brand name */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>

        {/* Info */}
        <div className="flex-1 px-5 pb-2 pt-4">
          <p
            className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#0068FF]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {vehicle.brandName}
          </p>
          <h3
            className="text-[17px] font-bold leading-snug text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {vehicle.modelName}
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-[#6B7280] line-clamp-1">
            {vehicle.version}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-[#6B7280]">
              {FUEL_TYPE_LABELS[vehicle.fuelType]}
            </span>
            <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-[#6B7280]">
              {TRANSMISSION_LABELS[vehicle.transmission]}
            </span>
          </div>
        </div>
      </Link>

      {/* Price + CTA */}
      <div className="mt-auto flex items-center justify-between border-t border-[#F3F4F6] px-5 py-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.15em] text-[#9CA3AF]">desde</p>
          <p
            className="text-[22px] font-bold leading-none text-[#0068FF]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {vehicle.priceLabel}
            <span className="ml-0.5 text-[11px] font-normal text-[#9CA3AF]">/mes</span>
          </p>
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0A0A0A] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-250 hover:bg-[#0068FF]"
        >
          Lo quiero
        </a>
      </div>

      {/* Blue accent bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] origin-left scale-x-0 bg-[#0068FF] transition-transform duration-400 ease-out group-hover:scale-x-100" />
    </motion.div>
  );
}
