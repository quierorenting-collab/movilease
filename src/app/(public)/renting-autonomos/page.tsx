import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/forms/LeadForm";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { buildWhatsAppLink } from "@/lib/constants";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Renting de coches para autónomos",
  description:
    "Renting de coches para autónomos: sin entrada, cuota fija con todo incluido y trámites simplificados. Empieza a usar tu coche nuevo sin tocar tu tesorería.",
  path: "/renting-autonomos",
});

const VENTAJAS = [
  {
    title: "Sin entrada, sin tocar caja",
    body: "Empiezas a usar el coche sin desembolso inicial, algo que como autónomo se nota especialmente en la tesorería del primer mes.",
  },
  {
    title: "Cuota fija, contabilidad simple",
    body: "Un único gasto mensual que incluye seguro, mantenimiento e impuestos, fácil de imputar y de anticipar mes a mes.",
  },
  {
    title: "Posible ventaja fiscal",
    body: "El renting puede tratarse como gasto deducible de tu actividad según tu caso concreto. Consulta con tu gestoría las condiciones que te aplican.",
  },
  {
    title: "Sin depreciación que gestionar",
    body: "El vehículo no entra en tu balance como activo: al terminar el contrato, simplemente lo devuelves y, si quieres, estrenas otro.",
  },
];

const PASOS = [
  {
    n: "01",
    title: "Cuéntanos tu actividad",
    body: "Tipo de actividad, antigüedad como autónomo y el coche que necesitas.",
  },
  {
    n: "02",
    title: "Te decimos si encaja",
    body: "Comprobamos la viabilidad y te damos una propuesta clara, sin letra pequeña.",
  },
  {
    n: "03",
    title: "Firma y entrega",
    body: "Gestionamos matriculación, seguro y puesta en circulación por ti.",
  },
  {
    n: "04",
    title: "A rodar",
    body: "Cuota fija cada mes, todo incluido, sin sorpresas a final de año.",
  },
];

const FAQ_ITEMS = [
  {
    q: "¿Necesito una antigüedad mínima como autónomo?",
    a: "Depende del caso concreto. Cuéntanos tu situación por WhatsApp y te decimos si encaja, sin compromiso.",
  },
  {
    q: "¿Puedo deducirme el IVA y el gasto del renting?",
    a: "El tratamiento fiscal depende de tu actividad y del uso que le des al vehículo. Te recomendamos confirmarlo con tu gestoría antes de firmar.",
  },
  {
    q: "¿Qué pasa si mi actividad cambia o dejo de ser autónomo?",
    a: "Contáctanos y estudiamos tu caso de forma individual, sin compromiso.",
  },
  {
    q: "¿Incluye el seguro y el mantenimiento?",
    a: "Sí. Seguro a todo riesgo, mantenimiento, impuesto de circulación y neumáticos van incluidos en la misma cuota mensual.",
  },
  {
    q: "¿Puedo elegir cualquier coche del catálogo?",
    a: "Sí, el catálogo es el mismo para particulares, autónomos y empresas.",
  },
  {
    q: "¿El renting cuenta como gasto en la declaración trimestral?",
    a: "El renting suele registrarse como gasto corriente de la actividad, dentro de los límites que marque tu caso concreto. Confírmalo con tu gestoría antes de firmar.",
  },
  {
    q: "¿Qué pasa si mi actividad se reduce y necesito dar de baja el vehículo?",
    a: "Contáctanos y estudiamos tu situación de forma individual; cada contrato se revisa caso a caso.",
  },
];

export default function RentingAutonomosPage() {
  const whatsappLink = buildWhatsAppLink(
    "Hola, soy autónomo y quiero información sobre renting de coches."
  );

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", path: "/" },
          { name: "Renting para autónomos", path: "/renting-autonomos" },
        ]}
      />
      <FaqJsonLd items={FAQ_ITEMS} />

      {/* Hero */}
      <section className="surface-black ambient-blue relative overflow-hidden pt-32 pb-24">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="section-label">Renting para autónomos</p>
            <h1 className="display-lg mt-4 max-w-3xl text-white">
              Tu herramienta de trabajo, sin tocar tu tesorería.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Renting pensado para autónomos: sin entrada, cuota fija con todo
              incluido y trámites simplificados. Así puedes centrarte en tu
              actividad, no en el papeleo del coche.
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="section-label">Por qué renting</p>
            <h2 className="display-md mt-4 text-white">
              Pensado para cómo trabaja un autónomo
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="max-w-2xl">
            <p className="section-label">El proceso</p>
            <h2 className="display-md mt-4 text-[#0A0A0A]">
              De contarnos tu actividad a tener el coche
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
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <p className="section-label">FAQ</p>
            <h2 className="display-md mt-4 text-white">
              Preguntas frecuentes de autónomos
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
              ¿Necesitas gestionar varios vehículos para tu empresa?{" "}
              <Link
                href="/renting-empresas"
                className="font-semibold text-[#5AA0FF] underline underline-offset-2 hover:text-white"
              >
                Consulta las condiciones para empresas
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Formulario */}
      <section className="surface-black ambient-blue relative min-h-screen pt-24 pb-32">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <Reveal>
                <p className="section-label">Solicita información</p>
                <h2 className="display-md mt-4 text-white">Cuéntanos tu actividad.</h2>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
                  Te preparamos una propuesta ajustada a tu actividad como
                  autónomo, sin compromiso y sin letra pequeña.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <ul className="mt-10 space-y-4">
                  {[
                    "Respuesta en menos de 24 horas",
                    "Sin compromiso",
                    "Trámites simplificados",
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
                  submitLabel="Solicitar información para autónomos"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
