"use client";

import Image from "next/image";
import Link from "next/link";
import type { VehicleCardData } from "@/lib/data/vehicles";
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS, buildWhatsAppLink } from "@/lib/constants";

export function VehicleCard({ vehicle }: { vehicle: VehicleCardData }) {
  const waLink = buildWhatsAppLink(`Hola, me interesa el ${vehicle.brandName} ${vehicle.modelName}`);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#0068FF]/10 bg-[#0d2442] transition-all hover:-translate-y-1 hover:border-[#0068FF]/30 hover:shadow-xl hover:shadow-[#0068FF]/5">
      <Link href={`/${vehicle.modelSlug}`} className="contents">
        <div className="relative aspect-[4/3] w-full bg-[#112d52]">
          {vehicle.imageUrl ? (
            <Image
              src={vehicle.imageUrl}
              alt={`${vehicle.brandName} ${vehicle.modelName}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl font-bold text-[#112d52] text-[#0068FF]/10">
              {vehicle.brandName.charAt(0)}
            </div>
          )}
          {vehicle.badgeText && (
            <span className="absolute left-3 top-3 rounded-full bg-[#0068FF]/15 px-2.5 py-0.5 text-xs font-semibold text-[#0068FF] border border-[#0068FF]/25">
              {vehicle.badgeText}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#5E6673]">
            {vehicle.category}
          </p>
          <h3 className="font-semibold text-white">
            {vehicle.brandName} {vehicle.modelName}
          </h3>
          <p className="text-sm text-[#94b8cc] line-clamp-1">{vehicle.version}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[#061B3F] px-2.5 py-0.5 text-xs text-[#94b8cc]">
              {FUEL_TYPE_LABELS[vehicle.fuelType]}
            </span>
            <span className="rounded-full bg-[#061B3F] px-2.5 py-0.5 text-xs text-[#94b8cc]">
              {TRANSMISSION_LABELS[vehicle.transmission]}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-[#0068FF]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              {vehicle.priceLabel}
              <span className="text-sm font-normal text-[#94b8cc]">/mes</span>
            </p>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center justify-center rounded-full border border-[#0068FF]/40 py-2.5 text-sm font-medium text-[#0068FF] transition-all hover:bg-[#0068FF] hover:text-[#061B3F]"
        >
          Lo quiero
        </a>
      </div>
    </div>
  );
}
