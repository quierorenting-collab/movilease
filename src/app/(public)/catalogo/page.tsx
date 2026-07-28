import type { Metadata } from "next";
import Link from "next/link";
import { getVehiclesByBrand, getCatalogVehicles } from "@/lib/data/vehicles";
import { VEHICLE_CATEGORY_LABELS, FUEL_TYPE_LABELS } from "@/lib/constants";
import type { VehicleCategoryEnum, FuelTypeEnum } from "@/types/database.types";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { BrandCard } from "@/components/catalog/BrandCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Catálogo de coches en renting | MoviLease",
  description: "Explora todas las marcas y modelos en renting para particulares. Sin entrada, todo incluido.",
};

const CATEGORIES = Object.entries(VEHICLE_CATEGORY_LABELS) as [VehicleCategoryEnum, string][];
const FUEL_TYPES_MAP = Object.entries(FUEL_TYPE_LABELS) as [FuelTypeEnum, string][];

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const brandParam = params.brand?.toLowerCase();
  const category = params.category as VehicleCategoryEnum | undefined;
  const fuelType = params.fuel as FuelTypeEnum | undefined;

  const { brands, vehiclesByBrand } = await getVehiclesByBrand();

  // If a brand is selected, show its vehicles (with optional category/fuel filters)
  if (brandParam) {
    const matchedBrand = brands.find(
      (b) => b.brandName.toLowerCase() === brandParam
    );
    const brandVehicles = matchedBrand
      ? (vehiclesByBrand[matchedBrand.brandName] ?? [])
      : [];

    // Apply local filters
    const filtered = brandVehicles.filter((v) => {
      if (category && v.category !== category) return false;
      if (fuelType && v.fuelType !== fuelType) return false;
      return true;
    });

    const displayName = matchedBrand?.brandName ?? brandParam;

    return (
      <>
        {/* Brand hero strip */}
        <div className="border-b border-[#F3F4F6] bg-white pt-28 pb-12">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <Link
              href="/catalogo"
              className="mb-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF] transition-colors hover:text-[#0068FF]"
            >
              ← Todas las marcas
            </Link>
            <div className="flex items-end justify-between">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#0068FF]">
                  Catálogo
                </p>
                <h1
                  className="font-bold text-[#0A0A0A]"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontSize: "clamp(2rem, 5vw, 4rem)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {displayName}
                </h1>
                <p className="mt-3 text-[14px] text-[#6B7280]">
                  {filtered.length} vehículo{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="sticky top-20 z-30 border-b border-[#F3F4F6] bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="flex flex-wrap items-center gap-2 py-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">
                Filtrar:
              </span>
              {CATEGORIES.map(([value, label]) => {
                const href = value === category
                  ? `/catalogo?brand=${brandParam}`
                  : `/catalogo?brand=${brandParam}&category=${value}`;
                return (
                  <Link
                    key={value}
                    href={href}
                    className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-all ${
                      category === value
                        ? "bg-[#0068FF] text-white"
                        : "border border-[#E5E7EB] text-[#6B7280] hover:border-[#0068FF] hover:text-[#0068FF]"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
              <span className="mx-1 h-4 w-px bg-[#E5E7EB]" />
              {FUEL_TYPES_MAP.map(([value, label]) => {
                const href = value === fuelType
                  ? `/catalogo?brand=${brandParam}${category ? `&category=${category}` : ""}`
                  : `/catalogo?brand=${brandParam}${category ? `&category=${category}` : ""}&fuel=${value}`;
                return (
                  <Link
                    key={value}
                    href={href}
                    className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-all ${
                      fuelType === value
                        ? "bg-[#0068FF] text-white"
                        : "border border-[#E5E7EB] text-[#6B7280] hover:border-[#0068FF] hover:text-[#0068FF]"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Vehicle grid */}
        <section className="bg-[#FAFAFA] py-16">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            {filtered.length > 0 ? (
              <RevealGroup
                stagger={0.05}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {filtered.map((vehicle) => (
                  <RevealItem key={vehicle.id}>
                    <VehicleCard vehicle={vehicle} />
                  </RevealItem>
                ))}
              </RevealGroup>
            ) : (
              <div className="py-32 text-center">
                <p className="text-[14px] text-[#9CA3AF]">
                  No hay vehículos con este filtro.{" "}
                  <Link href={`/catalogo?brand=${brandParam}`} className="text-[#0068FF] hover:underline">
                    Ver todos los {displayName}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </section>
      </>
    );
  }

  // Default view: all brands overview
  const premiumBrands = brands.filter((b) => b.isPremium);
  const generalBrands = brands.filter((b) => !b.isPremium);

  return (
    <>
      {/* Page header */}
      <div className="bg-white pt-28 pb-16 border-b border-[#F3F4F6]">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#0068FF]">
            Catálogo completo
          </p>
          <h1
            className="font-bold text-[#0A0A0A]"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {brands.length} marcas.
            <br />
            <span className="text-[#0068FF]">
              {brands.reduce((sum, b) => sum + b.vehicleCount, 0)} vehículos.
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[#6B7280]">
            Elige tu marca favorita y explora todos los modelos disponibles en renting.
            Sin entrada, con seguro incluido y gestión en 48 horas.
          </p>
        </div>
      </div>

      {/* Brand catalog */}
      <section className="bg-[#FAFAFA] py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">

          {/* Premium brands */}
          {premiumBrands.length > 0 && (
            <>
              <Reveal className="mb-8 flex items-center gap-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9CA3AF]">
                  Marcas premium
                </p>
                <div className="flex-1 border-t border-[#E5E7EB]" />
              </Reveal>
              <RevealGroup
                stagger={0.06}
                className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {premiumBrands.map((brand) => (
                  <RevealItem key={brand.brandName}>
                    <BrandCard brand={brand} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </>
          )}

          {/* Generalista brands */}
          {generalBrands.length > 0 && (
            <>
              <Reveal className="mb-8 flex items-center gap-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9CA3AF]">
                  Marcas generalistas
                </p>
                <div className="flex-1 border-t border-[#E5E7EB]" />
              </Reveal>
              <RevealGroup
                stagger={0.04}
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              >
                {generalBrands.map((brand) => (
                  <RevealItem key={brand.brandName}>
                    <BrandCard brand={brand} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </>
          )}
        </div>
      </section>

      {/* All vehicles flat view for SEO */}
      <AllVehiclesSection />
    </>
  );
}

async function AllVehiclesSection() {
  const vehicles = await getCatalogVehicles({});

  if (vehicles.length === 0) return null;

  // Dedup by model slug
  const seen = new Set<string>();
  const deduped = vehicles.filter((v) => {
    if (seen.has(v.modelSlug)) return false;
    seen.add(v.modelSlug);
    return true;
  });

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <Reveal className="mb-12 flex items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9CA3AF]">
            Todos los vehículos · {deduped.length} modelos
          </p>
          <div className="flex-1 border-t border-[#E5E7EB]" />
        </Reveal>
        <RevealGroup
          stagger={0.03}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {deduped.map((vehicle) => (
            <RevealItem key={vehicle.id}>
              <VehicleCard vehicle={vehicle} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
