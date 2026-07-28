"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { VehicleCardData } from "@/lib/data/vehicles";
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS, buildWhatsAppLink } from "@/lib/constants";

export function VehicleCard({ vehicle }: { vehicle: VehicleCardData }) {
  const waLink = buildWhatsAppLink(`Hola, me interesa el ${vehicle.brandName} ${vehicle.modelName}`);

  return (
    <motion.div
      className="group vehicle-card bg-[#04101F]"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link href={`/${vehicle.modelSlug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#071a38]">
          {vehicle.imageUrl ? (
            <Image
              src={vehicle.imageUrl}
              alt={`${vehicle.brandName} ${vehicle.modelName}`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              style={{ filter: "brightness(1.05) contrast(1.08) saturate(0.92)" }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl font-bold text-white/5">
              {vehicle.brandName.charAt(0)}
            </div>
          )}

          {/* Gradient — stronger on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

          {/* Name on image */}
          <div className="absolute bottom-0 left-0 p-4">
            <p className="mb-0.5 text-[10px] uppercase tracking-[0.2em] text-white/45">
              {vehicle.category}
            </p>
            <h3
              className="text-[15px] font-bold leading-tight text-white"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {vehicle.brandName} {vehicle.modelName}
            </h3>
          </div>

          {/* Blue edge glow on hover */}
          <div className="absolute inset-0 border border-[#0068FF]/0 transition-all duration-500 group-hover:border-[#0068FF]/20" />
        </div>

        {/* Details */}
        <div className="px-4 pb-1 pt-3">
          <p className="text-xs text-white/25 line-clamp-1">{vehicle.version}</p>
          <div className="mt-1.5 flex gap-2">
            <span className="text-[10px] uppercase tracking-[0.1em] text-white/20">
              {FUEL_TYPE_LABELS[vehicle.fuelType]}
            </span>
            <span className="text-[10px] text-white/12">·</span>
            <span className="text-[10px] uppercase tracking-[0.1em] text-white/20">
              {TRANSMISSION_LABELS[vehicle.transmission]}
            </span>
          </div>
        </div>
      </Link>

      {/* Price + CTA */}
      <div className="flex items-center justify-between px-4 pb-5 pt-2">
        <p
          className="text-xl font-bold text-[#0068FF]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {vehicle.priceLabel}
          <span className="text-xs font-normal text-white/25">/mes</span>
        </p>
        <motion.a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="border border-[#0068FF]/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#0068FF] transition-colors hover:border-[#0068FF] hover:bg-[#0068FF] hover:text-white"
        >
          Lo quiero
        </motion.a>
      </div>
    </motion.div>
  );
}
