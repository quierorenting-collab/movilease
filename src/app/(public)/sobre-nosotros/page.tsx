import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentBrand } from "@/lib/brand";
import {
  Reveal,
  RevealGroup,
  RevealItem,
  AnimatedCounter,
} from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getCurrentBrand();
  return {
    title: "Sobre nosotros",
    description: `Quiénes somos en ${brand.name}.`,
  };
}

const VALUES = [
  {
    title: "Transparencia",
    body: "Precios claros desde el primer momento. Sin letra pequeña, sin sorpresas en el contrato y sin costes ocultos al final del mes.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0068FF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Rapidez",
    body: "Gestionamos tu solicitud sin papeleo innecesario ni visitas al concesionario. Todo el proceso, desde tu móvil y en tiempo récord.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0068FF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 2 3 14h8l-1 8 11-13h-8l1-7z" />
      </svg>
    ),
  },
  {
    title: "Todo incluido",
    body: "Seguro a todo riesgo, mantenimiento, impuestos y asistencia en una única cuota mensual. Tú solo te ocupas de conducir.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0068FF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2 4 6v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V6l-8-4z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

const STATS = [
  { value: 10000, prefix: "+", suffix: "", decimals: 0, label: "Clientes satisfechos" },
  { value: 4.9, prefix: "", suffix: "", decimals: 1, label: "Valoración Google" },
  { value: 30, prefix: "+", suffix: "", decimals: 0, label: "Marcas disponibles" },
  { value: 48, prefix: "", suffix: "h", decimals: 0, label: "Gestión garantizada" },
];

export default async function SobreNosotrosPage() {
  const brand = await getCurrentBrand();

  return (
    <div>
      {/* Hero */}
      <section className="surface-black ambient-blue relative pt-32 pb-24">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="section-label">Sobre nosotros</p>
            <h1 className="display-lg mt-4 text-white">
              Movilidad sin fricciones.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              En {brand.name} creemos que estrenar coche no debería ser
              complicado. Por eso reunimos las mejores ofertas de renting en un
              solo lugar y te acompañamos en todo el proceso: una cuota mensual
              con todo incluido, sin entrada, sin papeleo y sin ataduras de por
              vida.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="surface-graphite py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="section-label">Lo que nos define</p>
            <h2 className="display-md mt-4 text-white">
              Tres principios, cero letra pequeña
            </h2>
          </Reveal>
          <RevealGroup stagger={0.08} className="mt-14 grid gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <RevealItem key={v.title}>
                <div className="card-dark h-full p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0068FF]/10">
                    {v.icon}
                  </span>
                  <h3
                    className="mt-6 text-xl font-semibold text-white"
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

      {/* Stats — white contrast section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="section-label">En cifras</p>
            <h2 className="display-md mt-4 text-[#0A0A0A]">
              La confianza se mide
            </h2>
          </Reveal>
          <RevealGroup
            stagger={0.08}
            className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4"
          >
            {STATS.map((s) => (
              <RevealItem key={s.label}>
                <p
                  className="text-5xl font-bold text-[#0A0A0A] sm:text-6xl"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  <AnimatedCounter
                    value={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    decimals={s.decimals}
                  />
                </p>
                <p className="mt-3 text-sm text-[#6B7280]">{s.label}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Final CTA */}
      <section className="surface-black ambient-blue-top relative py-28">
        <div className="relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="display-md text-white">
              Tu próximo coche te está esperando
            </h2>
            <p className="mx-auto mt-5 max-w-md text-white/70">
              Explora el catálogo o escríbenos y te ayudamos a encontrar el
              renting que mejor encaja contigo.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/catalogo" className="btn-primary">
                Ver catálogo
              </Link>
              <Link href="/contacto" className="btn-ghost">
                Hablar con nosotros
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
