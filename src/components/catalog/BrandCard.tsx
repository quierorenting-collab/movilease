import Link from "next/link";
import type { BrandSummary } from "@/lib/data/vehicles";

export function BrandCard({ brand }: { brand: BrandSummary }) {
  const href = `/catalogo?brand=${encodeURIComponent(brand.brandName.toLowerCase())}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-hover"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Logo tile */}
      <div className="relative flex h-[132px] items-center justify-center overflow-hidden bg-[#F7F8FA] px-6">
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.logoUrl}
            alt={`Logo de ${brand.brandName}`}
            className="max-h-16 w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            loading="lazy"
          />
        ) : (
          <span
            className="text-center text-2xl font-bold uppercase tracking-wide text-[#0A0A0A]/70"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {brand.brandName}
          </span>
        )}
      </div>

      {/* Brand name */}
      <div className="px-6 pt-5">
        <p
          className="text-[20px] font-bold leading-none text-[#0A0A0A]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {brand.brandName}
        </p>
        <p className="mt-2 text-[13px] text-[#5B6472]">
          {brand.vehicleCount}{" "}
          {brand.vehicleCount === 1 ? "vehículo disponible" : "vehículos disponibles"}
        </p>
      </div>

      {/* Footer — en móvil la tarjeta mide ~174px: en fila el CTA se cortaba */}
      <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
            desde
          </p>
          <p
            className="text-[19px] font-bold leading-none text-[#0A0A0A]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {brand.cheapestPriceLabel}
            <span className="ml-0.5 text-[12px] font-medium text-[#5B6472]">/mes</span>
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-[#0057D6] transition-all duration-300 group-hover:gap-3">
          Ver modelos
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}
