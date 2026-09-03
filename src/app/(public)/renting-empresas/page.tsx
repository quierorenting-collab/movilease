import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/forms/LeadForm";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { buildWhatsAppLink } from "@/lib/constants";
import { pageMetadata } from "@/lib/metadata";
import { VideoBackdrop } from "@/components/ui/VideoBackdrop";

export const metadata: Metadata = pageMetadata({
  title: "Renting de coches para empresas",
  description:
    "Renting de flotas para empresas: cuota fija con todo incluido, sin entrada, gestión centralizada y renovación de vehículos sin inmovilizar capital.",
  path: "/renting-empresas",
});

const VENTAJAS = [
  {
    title: "Sin inmovilizar capital",
    body: "El renting no consume línea de crédito ni exige desembolso inicial: la tesorería de la empresa queda libre para lo que de verdad hace crecer el negocio.",
  },
  {
    title: "Cuota fija y predecible",
    body: "Seguro a todo riesgo, mantenimiento, impuestos y neumáticos en una sola factura mensual. Presupuestar la flota deja de ser una incógnita.",
  },
  {
    title: "Gestión centralizada",
    body: "Un único interlocutor para toda la flota, sin negociar por separado con concesionario, aseguradora y taller cada vez que surge un imprevisto.",
  },
  {
    title: "Renueva sin fricción",
    body: "Al terminar el contrato cambias de vehículo sin preocuparte de venderlo ni de su valor residual. La flota se mantiene siempre al día.",
  },
];

const PASOS = [
  {
    n: "01",
    title: "Cuéntanos qué necesitas",
    body: "Número de vehículos, tipo de uso y plazo. Cuanto más contexto nos des, más ajustada será la propuesta.",
  },
  {
    n: "02",
    title: "Te preparamos una propuesta",
    body: "Condiciones pensadas para el volumen y la actividad de tu empresa, sin compromiso.",
  },
  {
    n: "03",
    title: "Firma y entrega",
    body: "Nos encargamos de matriculación, seguro y puesta en circulación de cada vehículo.",
  },
  {
    n: "04",
    title: "Un contacto, toda la flota",
    body: "Altas, bajas y sustituciones se gestionan con la misma persona, sin volver a empezar de cero.",
  },
];

const FAQ_ITEMS = [
  {
    q: "¿Hay un número mínimo de vehículos?",
    a: "No. Trabajamos igual con un único vehículo de empresa que con flotas de varias decenas.",
  },
  {
    q: "¿Puedo deducir el renting como gasto de la empresa?",
    a: "El renting suele tratarse como gasto deducible de la actividad, dentro de los límites que marca cada caso. Te recomendamos confirmarlo con tu asesoría fiscal antes de firmar.",
  },
  {
    q: "¿Quién gestiona el mantenimiento y las revisiones?",
    a: "Nosotros. Seguro a todo riesgo, mantenimiento, impuesto de circulación y neumáticos van incluidos en la cuota mensual.",
  },
  {
    q: "¿Qué pasa si necesito cambiar de conductor o de vehículo durante el contrato?",
    a: "Cada caso se estudia de forma individual: contáctanos y te contamos las opciones disponibles, sin compromiso.",
  },
  {
    q: "¿Puedo combinar varios modelos en la misma flota?",
    a: "Sí. Puedes combinar marcas y modelos según las necesidades de cada puesto o departamento.",
  },
  {
    q: "¿El renting empresarial incluye un kilometraje limitado?",
    a: "Los contratos se calculan sobre un kilometraje anual pactado (habitualmente 15.000 km por vehículo), que ajustamos según el uso real de tu flota.",
  },
  {
    q: "¿Qué duración tienen los contratos?",
    /* Decia "24 a 48 meses" y no lo cumple ninguna ficha: las publicadas van
       de 36 a 60. Los 24 existen en algun modelo suelto, pero Adrian avisa
       de que son "muy pocos, casi ninguno", asi que anunciarlos crearia una
       expectativa que casi nunca se puede cumplir. */
    a: "De 36 a 60 meses. La cuota cambia según el plazo, así que lo ajustamos al uso que le vaya a dar tu flota.",
  },
];

export default function RentingEmpresasPage() {
  const whatsappLink = buildWhatsAppLink(
    "Hola, gestiono la flota de mi empresa y quiero información sobre renting."
  );

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", path: "/" },
          { name: "Renting para empresas", path: "/renting-empresas" },
        ]}
      />
      <FaqJsonLd items={FAQ_ITEMS} />

      {/* Hero */}
      <section className="surface-black ambient-blue relative overflow-hidden pt-32 pb-24">
        {/* Carretera de montaña al amanecer, con matrícula MoviLease. El titular
            va en blanco encima, así que la foto se sirve ya rebajada de brillo
            desde el propio WebP y el velo carga el resto del contraste: en el
            lado izquierdo, que es donde está el texto, es casi opaco, y se abre
            hacia la derecha para que se vea el coche y el paisaje. */}
        <VideoBackdrop
          poster="/empresas-bg.webp"
          base="#071A3D"
          veil="linear-gradient(100deg, rgba(7,26,61,0.94) 0%, rgba(7,26,61,0.88) 38%, rgba(7,26,61,0.62) 70%, rgba(7,26,61,0.72) 100%)"
        />
        <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-6">
          <Reveal>
            <p className="section-label">Renting para empresas</p>
            <h1 className="display-lg mt-4 max-w-3xl text-white">
              Moviliza tu equipo sin inmovilizar capital.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Renting de flotas para empresas de cualquier tamaño: cuota fija con
              todo incluido, sin entrada y sin sorpresas. Tú te centras en el
              negocio, nosotros en que el coche siempre esté listo.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary justify-center"
              >
                Hablar con un asesor
              </a>
              <Link href="/catalogo" className="btn-ghost justify-center">
                Ver catálogo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Ventajas */}
      <section className="surface-graphite py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-6">
          <Reveal>
            <p className="section-label">Por qué renting</p>
            <h2 className="display-md mt-4 text-white">
              Pensado para cómo gestiona flotas una empresa
            </h2>
          </Reveal>
          <RevealGroup stagger={0.08} className="mt-14 grid gap-6 sm:grid-cols-2">
            {VENTAJAS.map((v) => (
              <RevealItem key={v.title}>
                <div className="card-dark h-full p-8">
                  <h3
                    className="text-xl font-semibold text-white"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {v.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    {v.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-6">
          <Reveal className="max-w-2xl">
            <p className="section-label">El proceso</p>
            <h2 className="display-md mt-4 text-[#0A0A0A]">
              De la primera llamada a las llaves en mano
            </h2>
          </Reveal>

          <div className="relative mt-16 grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div className="absolute left-0 right-0 top-[26px] hidden h-px bg-gradient-to-r from-[#0068FF]/40 via-[#E5E7EB] to-[#E5E7EB] lg:block" />
            {PASOS.map((paso, i) => (
              <Reveal key={paso.n} delay={i * 0.1} className="relative">
                <div className="relative z-10 mb-8 flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-sm">
                  <span
                    className="text-[15px] font-bold text-[#0068FF]"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {paso.n}
                  </span>
                </div>
                <h3
                  className="text-[19px] font-bold text-[#0A0A0A]"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {paso.title}
                </h3>
                <p className="mt-3 text-[13.5px] leading-[1.7] text-[#6B7280]">
                  {paso.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="surface-dark py-24">
        <div className="mx-auto max-w-4xl px-6 sm:px-6">
          <Reveal>
            <p className="section-label">FAQ</p>
            <h2 className="display-md mt-4 text-white">
              Preguntas frecuentes de empresas
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div
              className="mt-14 rounded-3xl bg-white px-8 py-4 sm:px-12"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <FAQAccordion items={FAQ_ITEMS} />
            </div>
          </Reveal>
          <Reveal delay={0.15} className="mt-10 text-center">
            <p className="text-[14px] text-white/60">
              ¿Eres autónomo y solo necesitas un vehículo?{" "}
              <Link
                href="/renting-autonomos"
                className="font-semibold text-[#5AA0FF] underline underline-offset-2 hover:text-white"
              >
                Consulta las condiciones para autónomos
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Formulario */}
      <section className="surface-black ambient-blue relative min-h-screen pt-24 pb-32">
        <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-6">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <Reveal>
                <p className="section-label">Solicita información</p>
                <h2 className="display-md mt-4 text-white">Cuéntanos tu flota.</h2>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
                  Cuantos más vehículos necesites, más sentido tiene centralizar
                  la gestión con un único interlocutor. Te preparamos una
                  propuesta a medida, sin compromiso.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <ul className="mt-10 space-y-4">
                  {[
                    "Respuesta en menos de 24 horas",
                    "Propuesta ajustada al volumen de tu empresa",
                    "Un único interlocutor para toda la flota",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[14px] text-white/75">
                      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
                        <circle cx="8" cy="8" r="8" fill="#0068FF" fillOpacity="0.18" />
                        <path
                          d="M5 8.2l2 2 4-4.4"
                          stroke="#5AA0FF"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal delay={0.2}>
              <div className="rounded-3xl border border-white/12 bg-white/[0.04] p-9 backdrop-blur-xl">
                <LeadForm
                  source="landing_page"
                  submitLabel="Solicitar propuesta para mi empresa"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
