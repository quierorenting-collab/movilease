import type { Metadata } from "next";
import { RENTING_DEFAULTS } from "@/lib/constants";
import { RentingCalculator } from "@/components/calculator/RentingCalculator";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { VideoBackdrop } from "@/components/ui/VideoBackdrop";
import { pageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Calculadora de renting: cuota mensual",
  description:
    "Calcula qué coches entran en tu presupuesto mensual de renting y qué incluye la cuota: seguro, mantenimiento e impuestos.",
  path: "/calculadora",
});

export default function CalculadoraPage() {
  return (
    <>
      <WebPageJsonLd tipo="WebPage" nombre="Calculadora de renting" descripcion="Calcula qué coches entran en tu presupuesto mensual de renting." path="/calculadora" />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", path: "/" },
          { name: "Calculadora de renting", path: "/calculadora" },
        ]}
      />

      <section className="surface-black relative overflow-hidden pt-32 pb-24">
        {/* Foto de fondo (escritorio con vistas). La original es muy luminosa:
            se sirve ya rebajada de brillo desde el propio WebP, porque el velo
            es lo único que hay entre la foto y el texto blanco de encima. */}
        <VideoBackdrop
          poster="/calculadora-bg.webp"
          base="#071A3D"
          veil="linear-gradient(180deg, rgba(7,26,61,0.84) 0%, rgba(12,36,84,0.7) 45%, rgba(7,26,61,0.9) 100%)"
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal alCargar>
              <p className="section-label">Calculadora</p>
            </Reveal>
            <Reveal alCargar delay={0.1}>
              <h1 className="display-lg mt-4 text-white">¿Cuánto quieres pagar al mes?</h1>
            </Reveal>
            <Reveal alCargar delay={0.2}>
              <p className="mt-5 text-lg text-white/70">
                Ajusta tu presupuesto mensual y descubre qué coches encajan — todo incluido en una
                sola cuota.
              </p>
            </Reveal>
          </div>

          <Reveal alCargar delay={0.3} className="mx-auto mt-14 max-w-2xl">
            <RentingCalculator />
          </Reveal>
        </div>
      </section>

      {/* De qué depende la cuota. La página era la calculadora y una rejilla de
          servicios: 75 palabras en total, sin explicar nada de lo que el
          visitante ha venido a entender. Todo lo que se dice aquí sale de cómo
          funciona el catálogo: la tabla plazo × kilometraje de cada ficha, los
          servicios incluidos y los 10.000 km/año de referencia. */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-6 sm:px-10">
          <Reveal>
            <p className="section-label section-label-on-light">Cómo se calcula</p>
            <h2 className="display-md mt-4 text-[#0A0A0A]">De qué depende tu cuota</h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-8 space-y-5 text-[16px] leading-[1.75] text-[#4B5563]">
            <p>
              En un renting no se financia el coche entero: se paga el uso durante
              un plazo. Por eso la cuota no sale de un porcentaje sobre el precio
              del coche, sino de cuánto valor pierde en ese tiempo y de lo que
              cuesta mantenerlo mientras lo usas. De ahí que dos coches de precio
              parecido puedan tener cuotas muy distintas.
            </p>
            <p>
              Sobre esa base pesan tres cosas. <strong className="text-[#0A0A0A]">El plazo</strong>:
              cuanto más largo, más reparto y normalmente menos cuota al mes.{" "}
              <strong className="text-[#0A0A0A]">Los kilómetros al año</strong>: más
              kilómetros significan más desgaste y menos valor al devolverlo, así
              que suben la cuota. Y <strong className="text-[#0A0A0A]">la versión</strong>:
              motor, cambio y acabado cambian tanto el precio de partida como el
              mantenimiento. Las cuotas que ves aquí están calculadas sobre{" "}
              {RENTING_DEFAULTS.annualKm.toLocaleString("es-ES")} km al año, y cada
              ficha trae su tabla completa con las combinaciones de plazo y
              kilometraje que ofrece ese coche.
            </p>
            <p>
              Lo que no cambia es qué entra: seguro a todo riesgo, mantenimiento,
              neumáticos, asistencia, ITV e impuestos van dentro de la cuota, con
              el IVA incluido y sin entrada. Tú pones el combustible o la recarga.
              Por eso, para comparar con una compra a plazos, hay que sumarle a
              esta todos esos gastos, que en un coche propio se pagan igual pero
              por separado.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="surface-graphite relative py-24">
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <p className="section-label">Todo incluido</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="display-md mt-4 text-white">Qué incluye siempre la cuota</h2>
            </Reveal>
          </div>

          <RevealGroup
            stagger={0.06}
            className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {RENTING_DEFAULTS.includedServices.map((service) => (
              <RevealItem key={service}>
                <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
                  <svg
                    className="h-5 w-5 shrink-0 text-[#0068FF]"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 10.5l4 4 8-9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-sm font-medium text-white/80">{service}</span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
