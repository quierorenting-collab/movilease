import Link from "next/link";
import type { BrandSummary } from "@/lib/data/vehicles";

export function BrandCard({ brand }: { brand: BrandSummary }) {
  const href = `/catalogo?brand=${encodeURIComponent(brand.brandName.toLowerCase())}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-500 hover:-translate-y-1.5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#F5F6F8] to-[#EAECEF]">
        {brand.featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.featuredImageUrl}
            alt={brand.brandName}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {/* Premium badge */}
        {brand.isPremium && (
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-[#0068FF] px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-[#0068FF]/25">
              Premium
            </span>
          </div>
        )}

        {/* Brand name overlay */}
        <div className="absolute bottom-0 left-0 p-6">
          <p
            className="text-[24px] font-bold leading-none text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {brand.brandName}
          </p>
          <p className="mt-2 text-[11px] text-white/55">
            {brand.vehicleCount}{" "}
            {brand.vehicleCount === 1 ? "vehículo disponible" : "vehículos disponibles"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#C4C9D0]">
            desde
          </p>
          <p
            className="text-[19px] font-bold leading-none text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {brand.cheapestPriceLabel}
            <span className="ml-0.5 text-[11px] font-medium text-[#9CA3AF]">/mes</span>
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0068FF] transition-all duration-300 group-hover:gap-3">
          Ver modelos
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}
