import type { Metadata } from "next";
import Image from "next/image";
import { getComparisonVehicles, type ComparisonVehicle } from "@/lib/data/vehicles";
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS, VEHICLE_CATEGORY_LABELS } from "@/lib/constants";
import { Container, Section } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Comparador de vehículos",
  description: "Compara varios coches en renting lado a lado.",
};

const ROWS: { label: string; render: (v: ComparisonVehicle) => React.ReactNode }[] = [
  { label: "Precio", render: (v) => <span className="font-semibold text-primary">{v.priceLabel}/mes</span> },
  { label: "Categoría", render: (v) => VEHICLE_CATEGORY_LABELS[v.category] },
  { label: "Combustible", render: (v) => FUEL_TYPE_LABELS[v.fuelType] },
  { label: "Cambio", render: (v) => TRANSMISSION_LABELS[v.transmission] },
  { label: "Potencia", render: (v) => (v.horsepower ? `${v.horsepower} CV` : "—") },
  {
    label: "Consumo",
    render: (v) => (v.consumptionValue ? `${v.consumptionValue} ${v.consumptionUnit ?? ""}` : "—"),
  },
  { label: "Plazas", render: (v) => v.seats ?? "—" },
  { label: "Puertas", render: (v) => v.doors ?? "—" },
];

export default async function ComparadorPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids: idsParam } = await searchParams;
  const ids = (idsParam ?? "").split(",").map((id) => id.trim()).filter(Boolean);
  const vehicles = ids.length > 0 ? await getComparisonVehicles(ids) : [];

  if (vehicles.length === 0) {
    return (
      <Section className="pt-12">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight">Comparador de vehículos</h1>
          <div className="mt-8 rounded-2xl border border-dashed border-border-subtle p-10 text-center text-muted">
            <p>
              Añade coches al comparador desde el catálogo pulsando &ldquo;+ Comparar&rdquo; en cada
              ficha (hasta 3 a la vez).
            </p>
            <ButtonLink href="/catalogo" className="mt-4">
              Ir al catálogo
            </ButtonLink>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="pt-12">
      <Container>
        <h1 className="text-3xl font-semibold tracking-tight">Comparador de vehículos</h1>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="w-40" />
                {vehicles.map((v) => (
                  <th key={v.id} className="border-b border-border-subtle p-4 text-left">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-elevated">
                      {v.imageUrl ? (
                        <Image src={v.imageUrl} alt={v.modelName} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl font-semibold text-muted-2">
                          {v.brandName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-wide text-muted-2">{v.brandName}</p>
                    <p className="font-semibold">{v.modelName}</p>
                    <p className="text-sm text-muted">{v.version}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label}>
                  <th className="border-b border-border-subtle p-4 text-left text-sm font-medium text-muted">
                    {row.label}
                  </th>
                  {vehicles.map((v) => (
                    <td key={v.id} className="border-b border-border-subtle p-4 text-sm">
                      {row.render(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}
