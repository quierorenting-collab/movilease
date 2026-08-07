import type { Metadata } from "next";
import Link from "next/link";
import {
  getVehiclesByBrand,
  getCatalogVehicles,
  getBrandDisplayName,
} from "@/lib/data/vehicles";
import { VEHICLE_CATEGORY_LABELS, FUEL_TYPE_LABELS, buildWhatsAppLink } from "@/lib/constants";
import type { VehicleCategoryEnum, FuelTypeEnum } from "@/types/database.types";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { BrandCard } from "@/components/catalog/BrandCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { BreadcrumbJsonLd, ItemListJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 900;

/**
 * Canonical propio por marca (?brand=...): sin esto, las ~28 vistas de marca y
 * todas sus combinaciones de filtros competían como duplicados de /catalogo.
 * Las combinaciones con filtro de categoría o combustible no se indexan.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const brand = params.brand?.toLowerCase();

  if (!brand) {
    return pageMetadata({
      title: "Catálogo de coches en renting",
      description:
        "Explora todas las marcas y modelos en renting para particulares, autónomos y empresas. Sin entrada, con seguro y mantenimiento incluidos.",
      path: "/catalogo",
    });
  }

  // Capitalizar el slug daba "Seat" y "Kgm" en el título y la descripción, que
  // es lo que ve el usuario en Google. Se usa el nombre real de la marca.
  const nombre = (await getBrandDisplayName(brand)) ?? brand.charAt(0).toUpperCase() + brand.slice(1);
  const filtrado = Boolean(params.category || params.fuel);
  return pageMetadata({
    title: `Renting ${nombre}: modelos y cuotas`,
    description: `Todos los modelos ${nombre} disponibles en renting sin entrada, con seguro a todo riesgo y mantenimiento incluidos. Consulta cuotas y pide tu propuesta.`,
    path: `/catalogo?brand=${encodeURIComponent(brand)}`,
    noIndex: filtrado,
  });
}

/**
 * "Híbrido" y "Diesel" existen a la vez como categoría y como combustible:
 * mostrarlos en las dos filas de filtros duplicaba la misma acción con
 * resultados distintos. Como categoría se ocultan; los valores del enum se
 * siguen resolviendo con VEHICLE_CATEGORY_LABELS donde haga falta.
 */
const FUEL_LIKE_CATEGORIES = new Set(["hibrido", "diesel"]);

const CATEGORIES = (
  Object.entries(VEHICLE_CATEGORY_LABELS) as [VehicleCategoryEnum, string][]
).filter(([value]) => !FUEL_LIKE_CATEGORIES.has(value));
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
  const maxPriceRaw = Number(params.maxPrice);
  const maxPrice =
    Number.isFinite(maxPriceRaw) && maxPriceRaw > 0 ? Math.round(maxPriceRaw) : undefined;

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
    const conFiltros = brandVehicles.filter((v) => {
      if (category && v.category !== category) return false;
      if (fuelType && v.fuelType !== fuelType) return false;
      if (maxPrice && v.monthlyPriceCents !== undefined && v.monthlyPriceCents > maxPrice * 100) {
        return false;
      }
      return true;
    });

    /**
     * Una tarjeta por modelo, con la versión más barata. El listado general ya
     * lo hacía; la vista de marca no, y por eso SEAT enseñaba dos Ibiza y
     * Volkswagen dos Polo y dos Taigo, que es exactamente lo que hace dudar a
     * quien está comparando. Las demás versiones no se pierden: la ficha del
     * modelo las lista todas con su tabla de cuotas.
     */
    const vistos = new Set<string>();
    const filtered = conFiltros
      .slice()
      .sort((a, b) => (a.monthlyPriceCents ?? Infinity) - (b.monthlyPriceCents ?? Infinity))
      .filter((v) => {
        if (vistos.has(v.modelSlug)) return false;
        vistos.add(v.modelSlug);
        return true;
      });

    const displayName = matchedBrand?.brandName ?? brandParam;
    const cuotaMinimaMarca = filtered.length
      ? Math.round(
          Math.min(...filtered.map((v) => v.monthlyPriceCents ?? Infinity)) / 100
        )
      : null;

    const brandPath = `/catalogo?brand=${encodeURIComponent(brandParam)}`;

    return (
      <>
        <BreadcrumbJsonLd
          items={[
            { name: "Inicio", path: "/" },
            { name: "Catálogo", path: "/catalogo" },
            { name: displayName, path: brandPath },
          ]}
        />
        <ItemListJsonLd
          name={`Modelos ${displayName} en renting`}
          items={filtered.map((v) => ({
            name: `${v.brandName} ${v.modelName}`,
            path: `/${v.modelSlug}`,
          }))}
        />

        {/* Brand hero strip */}
        <div className="surface-black ambient-blue-top relative pt-32 pb-16">
          <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
            {/* Migas de pan: no había ninguna ruta visible desde una marca */}
            <nav aria-label="Ruta de navegación" className="mb-6">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-white/70">
                <li>
                  <Link href="/" className="transition-colors hover:text-white">
                    Inicio
                  </Link>
                </li>
                <li aria-hidden="true" className="text-white/45">
                  /
                </li>
                <li>
                  <Link href="/catalogo" className="transition-colors hover:text-white">
                    Catálogo
                  </Link>
                </li>
                <li aria-hidden="true" className="text-white/45">
                  /
                </li>
                <li aria-current="page" className="font-semibold text-white">
                  {displayName}
                </li>
              </ol>
            </nav>
            <div className="flex items-end justify-between">
              <div>
                <p className="section-label mb-3">Catálogo</p>
                <h1 className="display-lg text-white">{displayName}</h1>
                <p className="mt-4 text-[14px] text-white/70">
                  {filtered.length} vehículo{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <section
          aria-label="Filtros del catálogo"
          className="glass-dark sticky top-[72px] z-30 border-b border-white/[0.08]"
        >
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="flex flex-wrap items-center gap-2 py-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
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
                        : "border-white/10 text-white/70 hover:border-[#0068FF]/50 hover:text-white"
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
                        : "border-white/10 text-white/70 hover:border-[#0068FF]/50 hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Vehicle grid */}
        <section className="surface-graphite py-16">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <h2 className="display-sm mb-10 text-white">
              Modelos {displayName} en renting
            </h2>
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
                    className="font-semibold text-[#5AA0FF] underline underline-offset-2 transition-colors hover:text-white"
                  >
                    Ver todos los {displayName}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Texto de apoyo con datos reales del catálogo. La vista de marca tenía
            188 palabras: demasiado poco para competir por "renting <marca>". */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-6 sm:px-10">
            <h2 className="display-sm text-[#0A0A0A]">
              Renting de {displayName} sin entrada
            </h2>
            <p className="mt-6 text-[17px] leading-[1.8] text-[#33415C]">
              Tenemos {filtered.length} {filtered.length === 1 ? "vehículo" : "vehículos"} de{" "}
              {displayName} disponibles en renting
              {cuotaMinimaMarca ? `, desde ${cuotaMinimaMarca} € al mes` : ""}. Todas las
              cuotas van con el IVA incluido y sin entrada: el día que recibes el coche
              no pagas nada por adelantado.
            </p>
            <p className="mt-5 text-[17px] leading-[1.8] text-[#33415C]">
              En la cuota entran el seguro a todo riesgo, el mantenimiento en talleres
              oficiales, los neumáticos, el impuesto de circulación y la asistencia en
              carretera. Tú solo pones el combustible. Si quieres el detalle de lo que
              cubre cada partida, lo explicamos en{" "}
              <Link
                href="/blog/que-incluye-la-cuota-de-un-renting"
                className="font-medium text-[#0057D6] underline underline-offset-2 hover:text-[#0A0A0A]"
              >
                qué incluye la cuota de un renting
              </Link>
              .
            </p>
            <p className="mt-5 text-[17px] leading-[1.8] text-[#33415C]">
              Las cuotas publicadas se calculan sobre contratos de 36 meses y 10.000 km
              al año, pero el plazo y el kilometraje se adaptan a tu caso. Si no sabes
              cuántos kilómetros contratar, te ayudamos a{" "}
              <Link
                href="/blog/cuantos-kilometros-contratar-renting"
                className="font-medium text-[#0057D6] underline underline-offset-2 hover:text-[#0A0A0A]"
              >
                calcularlo bien
              </Link>{" "}
              antes de firmar. Damos respuesta a la solicitud en menos de 48 horas
              laborables y entregamos en toda España.
            </p>
          </div>
        </section>

        <CatalogCta
          title={`¿No encuentras el ${displayName} que buscas?`}
          body="Trabajamos con más stock del que aparece publicado. Dinos modelo, versión y kilometraje y te buscamos la mejor cuota."
          whatsappMessage={`Hola, busco un ${displayName} en renting. ¿Podéis ayudarme?`}
        />
      </>
    );
  }

  // Default view: all brands overview
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", path: "/" },
          { name: "Catálogo", path: "/catalogo" },
        ]}
      />
      <ItemListJsonLd
        name="Marcas disponibles en renting"
        items={brands.map((b) => ({
          name: b.brandName,
          path: `/catalogo?brand=${encodeURIComponent(b.brandName.toLowerCase())}`,
        }))}
      />

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
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/70">
            Elige tu marca favorita y explora todos los modelos disponibles en renting.
            Sin entrada, con seguro incluido y gestión en 48 horas.
          </p>
        </div>
      </div>

      {/* All brands, same treatment for every one */}
      <section id="marcas" className="surface-dark py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <h2 className="display-sm mb-10 text-white">Elige marca</h2>
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
      <AllVehiclesSection maxPrice={maxPrice} />

      <CatalogCta
        title="Dinos qué coche quieres y te lo calculamos"
        body="Más de 30 marcas y stock que no siempre está publicado. Cuéntanos qué buscas y te mandamos una propuesta con la cuota cerrada."
        whatsappMessage="Hola, quiero información sobre el catálogo de renting."
      />
    </>
  );
}

/**
 * El catálogo terminaba en una rejilla sin salida: quien no encontraba su
 * modelo se iba. Este bloque cierra las dos vistas con una vía de contacto.
 */
function CatalogCta({
  title,
  body,
  whatsappMessage,
}: {
  title: string;
  body: string;
  whatsappMessage: string;
}) {
  return (
    <section className="surface-carbon section-y-sm">
      <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-7 px-6 text-center sm:px-10">
        <div>
          <h2 className="display-sm text-white">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-[1.72] text-white/80">{body}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={buildWhatsAppLink(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            Preguntar por WhatsApp
          </a>
          <Link href="/contacto" className="btn-ghost">
            Dejar mis datos
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

async function AllVehiclesSection({ maxPrice }: { maxPrice?: number }) {
  const vehicles = await getCatalogVehicles({ maxPriceEuros: maxPrice });

  if (vehicles.length === 0) {
    if (!maxPrice) return null;
    return (
      <section className="surface-black py-24">
        <div className="mx-auto max-w-xl px-6 text-center sm:px-10">
          <h2 className="display-sm text-white">Nada por debajo de {maxPrice} €/mes</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/75">
            Ajusta el presupuesto o dinos qué buscas y te proponemos alternativas.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/calculadora" className="btn-ghost">
              Cambiar presupuesto
            </Link>
            <Link href="/catalogo" className="btn-primary">
              Ver todo el catálogo
            </Link>
          </div>
        </div>
      </section>
    );
  }

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
        <Reveal className="mb-12 flex flex-wrap items-center gap-4">
          <h2 className="display-sm shrink-0 text-white">
            {maxPrice ? `Hasta ${maxPrice} €/mes` : "Todos los modelos"}{" "}
            <span className="text-[#5AA0FF]">({deduped.length})</span>
          </h2>
          <div className="hidden flex-1 border-t border-white/[0.08] sm:block" />
          {maxPrice && (
            <Link
              href="/catalogo"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/20 px-4 text-[13px] font-semibold text-white/80 transition-colors hover:border-white/45 hover:text-white"
            >
              <span aria-hidden="true">×</span>
              Quitar filtro de precio
            </Link>
          )}
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
