import type { Metadata } from "next";
import Link from "next/link";
import {
  Reveal,
  RevealGroup,
  RevealItem,
  AnimatedCounter,
} from "@/components/ui/Reveal";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Quiénes somos",
  description:
    "Hazlo fácil. Hazlo MoviLease. Conoce nuestra misión, visión y valores, y por qué somos la forma más sencilla de estrenar coche en renting.",
  path: "/sobre-nosotros",
});

const INTRO_PARAGRAPHS = [
  "En MoviLease creemos que estrenar coche no debería ser complicado. Nuestro objetivo es ofrecer una experiencia de renting sencilla, transparente y adaptada a cada persona o empresa.",
  "Trabajamos con las principales marcas del mercado para ofrecer una amplia selección de vehículos con las mejores condiciones, siempre con una atención cercana y un asesoramiento personalizado.",
  "Nos encargamos de todo el proceso, desde la búsqueda del vehículo ideal hasta la entrega, para que tú solo tengas que preocuparte de disfrutar de la conducción.",
  "Porque el renting no consiste solo en conducir un coche, sino en ganar tiempo, tranquilidad y libertad.",
];

const VALUES = [
  {
    title: "Simplicidad",
    body: "Hacemos que contratar un renting sea fácil desde el primer minuto.",
  },
  {
    title: "Transparencia",
    body: "Sin sorpresas, sin letra pequeña y con información clara.",
  },
  {
    title: "Compromiso",
    body: "Acompañamos a cada cliente antes, durante y después de la contratación.",
  },
  {
    title: "Confianza",
    body: "Construimos relaciones duraderas basadas en un servicio excelente.",
  },
  {
    title: "Innovación",
    body: "Apostamos por la tecnología para ofrecer una experiencia rápida, moderna y eficiente.",
  },
];

const WHY_CHOOSE = [
  "Amplio catálogo de vehículos de todas las marcas.",
  "Ofertas competitivas para particulares, autónomos y empresas.",
  "Asesoramiento personalizado.",
  "Proceso de contratación 100 % online o con atención personalizada.",
  "Renting con todo incluido.",
  "Entrega en toda España.",
];

const STATS = [
  { value: 10000, prefix: "+", suffix: "", decimals: 0, label: "Clientes satisfechos" },
  { value: 4.9, prefix: "", suffix: "", decimals: 1, label: "Valoración Google" },
  { value: 30, prefix: "+", suffix: "", decimals: 0, label: "Marcas disponibles" },
  { value: 48, prefix: "", suffix: "h", decimals: 0, label: "Gestión garantizada" },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="#0068FF" fillOpacity="0.15" />
      <path
        d="M5 8.2l2 2 4-4.4"
        stroke="#0068FF"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SobreNosotrosPage() {
  return (
    <div>
      {/* Hero */}
      <section className="surface-black ambient-blue relative overflow-hidden pt-32 pb-24">
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <p className="section-label">Quiénes somos</p>
            <h1 className="display-lg mt-4 text-white">
              Hazlo fácil.
              <br />
              Hazlo <span className="text-[#5AA0FF]">MoviLease.</span>
            </h1>
          </Reveal>
          <RevealGroup stagger={0.06} className="mt-8 space-y-5">
            {INTRO_PARAGRAPHS.map((p) => (
              <RevealItem key={p}>
                <p className="max-w-2xl text-lg leading-relaxed text-white/70">{p}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Misión y visión */}
      <section className="relative overflow-hidden bg-white bg-texture-light py-24">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <RevealGroup stagger={0.1} className="grid gap-6 md:grid-cols-2">
            <RevealItem>
              <div className="h-full rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-9">
                <p className="section-label section-label-on-light">Nuestra misión</p>
                <p className="mt-5 text-lg leading-relaxed text-[#4B5563]">
                  Hacer que el renting sea accesible para todo el mundo,
                  eliminando la complejidad y ofreciendo un servicio rápido,
                  transparente y de confianza.
                </p>
              </div>
            </RevealItem>
            <RevealItem>
              <div className="h-full rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-9">
                <p className="section-label section-label-on-light">Nuestra visión</p>
                <p className="mt-5 text-lg leading-relaxed text-[#4B5563]">
                  Convertirnos en la empresa de renting de referencia en
                  España, destacando por la innovación, la cercanía con
                  nuestros clientes y una experiencia digital de primer nivel.
                </p>
              </div>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Valores */}
      <section className="surface-graphite relative overflow-hidden bg-texture-dark py-24">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="section-label">Lo que nos define</p>
            <h2 className="display-md mt-4 text-white">Nuestros valores</h2>
          </Reveal>
          <RevealGroup stagger={0.07} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v) => (
              <RevealItem key={v.title}>
                <div className="card-dark h-full p-8">
                  <h3
                    className="text-xl font-semibold text-white"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {v.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{v.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="section-label section-label-on-light">En cifras</p>
            <h2 className="display-md mt-4 text-[#0A0A0A]">La confianza se mide</h2>
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

      {/* Por qué elegir MoviLease */}
      <section className="surface-dark relative overflow-hidden bg-texture-dark py-24">
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="max-w-xl">
            <p className="section-label">Ventajas</p>
            <h2 className="display-md mt-4 text-white">¿Por qué elegir MoviLease?</h2>
          </Reveal>
          <RevealGroup stagger={0.06} className="mt-12 grid gap-4 sm:grid-cols-2">
            {WHY_CHOOSE.map((item) => (
              <RevealItem key={item}>
                <div className="glass flex items-center gap-3.5 rounded-2xl px-5 py-4">
                  <CheckIcon />
                  <span className="text-sm font-medium text-white/85">{item}</span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Cierre */}
      <section className="surface-black ambient-blue-top relative overflow-hidden py-28">
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="display-md text-white">
              Hazlo fácil.
              <br />
              Hazlo <span className="text-[#5AA0FF]">MoviLease.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              No vendemos coches. Creamos una nueva forma de acceder a la
              movilidad: más sencilla, más inteligente y pensada para ti.
              Porque cuando todo es fácil, solo queda disfrutar del camino.
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
