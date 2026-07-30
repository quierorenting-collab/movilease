import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getComparisonVehicles, type ComparisonVehicle } from "@/lib/data/vehicles";
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS, VEHICLE_CATEGORY_LABELS } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Comparador de coches en renting",
  description:
    "Compara hasta cuatro coches en renting lado a lado: cuota, potencia, consumo, plazas y servicios incluidos.",
  path: "/comparador",
  // El contenido depende de los ids que elige el visitante: nada que indexar.
  noIndex: true,
});

const ROWS: {
  label: string;
  emphasized?: boolean;
  render: (v: ComparisonVehicle) => React.ReactNode;
}[] = [
  {
    label: "Precio",
    emphasized: true,
    render: (v) => (
      <span
        className="text-xl font-bold text-[#0068FF]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        {v.priceLabel}
        <span className="text-sm font-medium text-white/70">/mes</span>
      </span>
    ),
  },
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

  return (
    <section className="surface-black ambient-blue-top relative overflow-hidden pt-32 pb-24">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <Reveal>
            <p className="section-label">Comparador</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="display-lg mt-4 text-white">Compara antes de decidir</h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-lg text-white/70">
              Pon hasta tres coches lado a lado y elige con datos, no con intuición.
            </p>
          </Reveal>
        </div>

        {vehicles.length === 0 ? (
          <Reveal delay={0.3}>
            <div className="glass mt-14 rounded-3xl px-8 py-16 text-center">
              <p className="mx-auto max-w-md text-white/75">
                Añade coches al comparador desde el catálogo pulsando &ldquo;+ Comparar&rdquo; en
                cada ficha (hasta 3 a la vez).
              </p>
              <Link href="/catalogo" className="btn-primary mt-8">
                Ir al catálogo
              </Link>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={0.3}>
            <div className="mt-14 overflow-hidden rounded-3xl border border-white/8 bg-white/[0.02]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr>
                      <th className="w-40 border-b border-white/5" />
                      {vehicles.map((v) => (
                        <th
                          key={v.id}
                          scope="col"
                          className="border-b border-white/5 p-5 text-left align-top"
                        >
                          {/* La cabecera no enlazaba a nada: desde la
                              comparativa no se podía abrir ninguna ficha. */}
                          <Link
                            href={`/${v.modelSlug}`}
                            className="group block"
                            aria-label={`Ver ficha del ${v.brandName} ${v.modelName}`}
                          >
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white/[0.04]">
                              {v.imageUrl ? (
                                <Image
                                  src={v.imageUrl}
                                  alt={`${v.brandName} ${v.modelName}`}
                                  fill
                                  sizes="(max-width: 640px) 60vw, 220px"
                                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                />
                              ) : (
                                <div
                                  className="flex h-full items-center justify-center text-3xl font-bold text-white/70"
                                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                                >
                                  {v.brandName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">
                              {v.brandName}
                            </p>
                            <p
                              className="mt-1 text-[17px] font-semibold text-white transition-colors group-hover:text-[#8FBEFF]"
                              style={{ fontFamily: "var(--font-space-grotesk)" }}
                            >
                              {v.modelName}
                            </p>
                            <p className="mt-0.5 text-[13.5px] font-normal text-white/75">
                              {v.version}
                            </p>
                            <span className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#8FBEFF]">
                              Ver ficha
                              <span
                                aria-hidden="true"
                                className="transition-transform duration-300 group-hover:translate-x-1"
                              >
                                →
                              </span>
                            </span>
                          </Link>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ROWS.map((row) => (
                      <tr
                        key={row.label}
                        className="transition-colors hover:bg-white/[0.03]"
                      >
                        <th scope="row" className="p-5 text-left text-[14px] font-medium text-white/80">
                          {row.label}
                        </th>
                        {vehicles.map((v) => (
                          <td
                            key={v.id}
                            className={`p-5 text-sm text-white/80 ${
                              row.emphasized ? "align-middle" : ""
                            }`}
                          >
                            {row.render(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
