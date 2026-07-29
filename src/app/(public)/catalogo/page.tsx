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
  title: "Catálogo de coches en renting",
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
        <div className="surface-black ambient-blue-top relative pt-32 pb-16">
          <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
            <Link
              href="/catalogo"
              className="group mb-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white"
            >
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 group-hover:-translate-x-1"
              >
                ←
              </span>
              Todas las marcas
            </Link>
            <div className="flex items-end justify-between">
              <div>
                <p className="section-label mb-3">Catálogo</p>
                <h1 className="display-lg text-white">{displayName}</h1>
                <p className="mt-4 text-[14px] text-white/40">
                  {filtered.length} vehículo{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-dark sticky top-[72px] z-40 border-b border-white/[0.08]">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="flex flex-wrap items-center gap-2 py-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
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
                    className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 ${
                      category === value
                        ? "border-[#0068FF] bg-[#0068FF] text-white shadow-lg shadow-[#0068FF]/25"
                        : "border-white/10 text-white/50 hover:border-[#0068FF]/50 hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
              <span className="mx-1 h-4 w-px bg-white/10" />
              {FUEL_TYPES_MAP.map(([value, label]) => {
                const href = value === fuelType
                  ? `/catalogo?brand=${brandParam}${category ? `&category=${category}` : ""}`
                  : `/catalogo?brand=${brandParam}${category ? `&category=${category}` : ""}&fuel=${value}`;
                return (
                  <Link
                    key={value}
                    href={href}
                    className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 ${
                      fuelType === value
                        ? "border-[#0068FF] bg-[#0068FF] text-white shadow-lg shadow-[#0068FF]/25"
                        : "border-white/10 text-white/50 hover:border-[#0068FF]/50 hover:text-white"
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
        <section className="surface-graphite py-16">
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
              <div className="mx-auto max-w-xl rounded-2xl border border-white/[0.08] bg-white/[0.03] p-12 text-center">
                <p className="text-[14px] text-white">
                  No hay vehículos con este filtro.{" "}
                  <Link
                    href={`/catalogo?brand=${brandParam}`}
                    className="text-[#0068FF] transition-colors hover:text-[#3D8BFF] hover:underline"
                  >
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
  return (
    <>
      {/* Page header */}
      <div className="surface-black ambient-blue-top relative pt-32 pb-16">
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
          <p className="section-label mb-4">Catálogo completo</p>
          <h1 className="display-lg text-white">
            {brands.length} marcas.
            <br />
            <span className="text-[#0068FF]">
              {brands.reduce((sum, b) => sum + b.vehicleCount, 0)} vehículos.
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/40">
            Elige tu marca favorita y explora todos los modelos disponibles en renting.
            Sin entrada, con seguro incluido y gestión en 48 horas.
          </p>
        </div>
      </div>

      {/* All brands, same treatment for every one */}
      <section id="marcas" className="surface-dark py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <RevealGroup
            stagger={0.03}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {brands.map((brand) => (
              <RevealItem key={brand.brandName}>
                <BrandCard brand={brand} />
              </RevealItem>
            ))}
          </RevealGroup>
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

  const featured = deduped.slice(0, 12);

  return (
    <section className="surface-black py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <Reveal className="mb-12 flex items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
            Todos los vehículos · {deduped.length} modelos
          </p>
          <div className="flex-1 border-t border-white/[0.08]" />
        </Reveal>
        <RevealGroup
          stagger={0.03}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {featured.map((vehicle) => (
            <RevealItem key={vehicle.id}>
              <VehicleCard vehicle={vehicle} />
            </RevealItem>
          ))}
        </RevealGroup>
        {deduped.length > featured.length && (
          <Reveal className="mt-14 flex justify-center">
            <a href="#marcas" className="btn-ghost">
              Ver todas las marcas
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}
