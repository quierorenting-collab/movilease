import Link from "next/link";
import type { BrandSummary } from "@/lib/data/vehicles";

export function BrandCard({ brand }: { brand: BrandSummary }) {
  const href = `/catalogo?brand=${encodeURIComponent(brand.brandName.toLowerCase())}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden bg-white transition-all duration-400"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#F3F4F6]">
        {brand.featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.featuredImageUrl}
            alt={brand.brandName}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span
              className="text-8xl font-bold text-[#0A0A0A]/5"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {brand.brandName.charAt(0)}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Premium badge */}
        {brand.isPremium && (
          <div className="absolute right-0 top-4">
            <span className="bg-[#0068FF] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white">
              Premium
            </span>
          </div>
        )}

        {/* Brand name overlay */}
        <div className="absolute bottom-0 left-0 p-5">
          <p
            className="text-2xl font-bold leading-none text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {brand.brandName}
          </p>
          <p className="mt-1.5 text-[11px] text-white/60">
            {brand.vehicleCount}{" "}
          {brand.vehicleCount === 1 ? "vehículo disponible" : "vehículos disponibles"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#F3F4F6] px-5 py-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.15em] text-[#9CA3AF]">desde</p>
          <p
            className="text-lg font-bold text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {brand.cheapestPriceLabel}
            <span className="ml-0.5 text-[11px] font-normal text-[#9CA3AF]">/mes</span>
          </p>
        </div>
        <span
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0068FF] transition-all duration-300 group-hover:gap-3"
        >
          Ver modelos
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] origin-left scale-x-0 bg-[#0068FF] transition-transform duration-400 ease-out group-hover:scale-x-100" />
    </Link>
  );
}
