import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getModelBySlugWithVehicles } from "@/lib/data/vehicles";
import { getLandingPageBySlug } from "@/lib/data/landing";
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";
import { Container, Section } from "@/components/ui/Container";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { LeadForm } from "@/components/forms/LeadForm";

export const revalidate = 1800;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;

  const model = await getModelBySlugWithVehicles(slug);
  if (model) {
    return {
      title: `Renting ${model.brandName} ${model.model.name}`,
      description:
        model.model.description ??
        `Renting de ${model.brandName} ${model.model.name} para particulares, sin entrada y todo incluido.`,
    };
  }

  const landing = await getLandingPageBySlug(slug);
  if (landing) {
    return { title: landing.title, description: landing.metaDescription ?? undefined };
  }

  return {};
}

export default async function SlugResolverPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const model = await getModelBySlugWithVehicles(slug);
  if (model) return <ModelPage model={model} />;

  const landing = await getLandingPageBySlug(slug);
  if (landing) return <LandingPage landing={landing} />;

  notFound();
}

function ModelPage({ model }: { model: NonNullable<Awaited<ReturnType<typeof getModelBySlugWithVehicles>>> }) {
  const cheapest = model.vehicles[0];

  return (
    <Section className="pt-12">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-2">
              {model.brandName}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              {model.model.name}
            </h1>
            {model.model.description && (
              <p className="mt-3 max-w-xl text-muted">{model.model.description}</p>
            )}

            <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-2xl bg-surface">
              {model.model.coverImageUrl || cheapest?.imageUrl ? (
                <Image
                  src={(model.model.coverImageUrl || cheapest?.imageUrl) as string}
                  alt={`${model.brandName} ${model.model.name}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-5xl font-semibold text-muted-2">
                  {model.brandName.charAt(0)}
                </div>
              )}
            </div>

            <h2 className="mt-10 text-xl font-semibold">Versiones disponibles</h2>
            <div className="mt-4 space-y-3">
              {model.vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex flex-col gap-2 rounded-xl border border-border-subtle p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{vehicle.version}</p>
                    <p className="text-sm text-muted">
                      {FUEL_TYPE_LABELS[vehicle.fuelType]} · {TRANSMISSION_LABELS[vehicle.transmission]}
                      {vehicle.horsepower ? ` · ${vehicle.horsepower}CV` : ""}
                      {vehicle.seats ? ` · ${vehicle.seats} plazas` : ""}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-primary">
                    {vehicle.priceLabel}
                    <span className="text-sm font-normal text-muted"> /mes</span>
                  </p>
                </div>
              ))}
            </div>

            {cheapest && (
              <>
                <h2 className="mt-10 text-xl font-semibold">Qué incluye</h2>
                <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-muted sm:grid-cols-2">
                  {cheapest.includedServices.map((service) => (
                    <li key={service} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {service}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface p-6">
            <h2 className="text-lg font-semibold">Solicita información</h2>
            <p className="mt-1 text-sm text-muted">Te contactamos por WhatsApp en menos de 24h.</p>
            <div className="mt-5">
              <LeadForm modelId={model.model.id} vehicleId={cheapest?.id} source="vehicle_page" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function LandingPage({ landing }: { landing: NonNullable<Awaited<ReturnType<typeof getLandingPageBySlug>>> }) {
  return (
    <Section className="pt-12">
      <Container>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{landing.h1}</h1>
        {landing.introContent && <p className="mt-3 max-w-2xl text-muted">{landing.introContent}</p>}

        <div className="mt-10">
          {landing.vehicles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {landing.vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border-subtle p-10 text-center text-muted">
              Estamos ampliando el catálogo de esta categoría — vuelve pronto.
            </div>
          )}
        </div>

        {landing.faq.length > 0 && (
          <div className="mt-16 max-w-2xl">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">Preguntas frecuentes</h2>
            <div className="divide-y divide-border-subtle">
              {landing.faq.map((item) => (
                <details key={item.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                    {item.question}
                    <span className="text-muted transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
