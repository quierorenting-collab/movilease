import type { Metadata } from "next";
import Link from "next/link";
import { getCatalogVehicles } from "@/lib/data/vehicles";
import { VEHICLE_CATEGORY_LABELS, FUEL_TYPE_LABELS } from "@/lib/constants";
import type { VehicleCategoryEnum, FuelTypeEnum } from "@/types/database.types";
import { Container, Section } from "@/components/ui/Container";
import { VehicleCard } from "@/components/vehicles/VehicleCard";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Catálogo de coches en renting",
  description: "Explora el catálogo completo de vehículos en renting para particulares.",
};

const CATEGORIES = Object.entries(VEHICLE_CATEGORY_LABELS) as [VehicleCategoryEnum, string][];
const FUEL_TYPES = Object.entries(FUEL_TYPE_LABELS) as [FuelTypeEnum, string][];

function buildFilterHref(current: URLSearchParams, key: string, value: string | null) {
  const params = new URLSearchParams(current);
  if (value === null || params.get(key) === value) {
    params.delete(key);
  } else {
    params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/catalogo?${qs}` : "/catalogo";
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const category = params.category as VehicleCategoryEnum | undefined;
  const fuelType = params.fuel as FuelTypeEnum | undefined;
  const maxPriceEuros = params.maxPrice ? Number(params.maxPrice) : undefined;

  const vehicles = await getCatalogVehicles({ category, fuelType, maxPriceEuros });
  const currentParams = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
  );

  return (
    <Section className="pt-12">
      <Container>
        <h1 className="text-3xl font-semibold tracking-tight">Catálogo</h1>
        <p className="mt-2 max-w-xl text-muted">
          {vehicles.length > 0
            ? `${vehicles.length} vehículo${vehicles.length === 1 ? "" : "s"} disponible${vehicles.length === 1 ? "" : "s"}.`
            : "Estamos cargando el catálogo completo."}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={category || fuelType ? buildFilterHref(currentParams, "category", null) : "/catalogo"}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              !category && !fuelType
                ? "border-primary bg-primary/10 text-primary"
                : "border-border-subtle text-muted hover:text-foreground"
            }`}
          >
            Todos
          </Link>
          {CATEGORIES.map(([value, label]) => (
            <Link
              key={value}
              href={buildFilterHref(currentParams, "category", value)}
              className={`rounded-full border px-4 py-1.5 text-sm ${
                category === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border-subtle text-muted hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {FUEL_TYPES.map(([value, label]) => (
            <Link
              key={value}
              href={buildFilterHref(currentParams, "fuel", value)}
              className={`rounded-full border px-4 py-1.5 text-sm ${
                fuelType === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border-subtle text-muted hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="mt-10">
          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border-subtle p-10 text-center text-muted">
              No hay vehículos que coincidan con este filtro todavía.
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
