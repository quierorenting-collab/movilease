import type { Metadata } from "next";
import Link from "next/link";
import {
  Reveal,
  RevealGroup,
  RevealItem,
  AnimatedCounter,
} from "@/components/ui/Reveal";
import { VideoBackdrop } from "@/components/ui/VideoBackdrop";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = pageMetadata({
  // "Quiénes somos" ocupaba 25 caracteres del título: Google da ~60 y el
  // resto se desaprovechaba sin decir de qué empresa ni de qué va.
  title: "Quiénes somos: renting de coches sin complicaciones",
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

// Mismo criterio que en la home: fuera las cifras que no se pueden sostener
// —clientes y nota de Google con la empresa recién arrancando— y fuera el
// "+30 marcas", que dejó de ser cierto al cuadrar el catálogo con el stock.
const STATS = [
  { value: 48, prefix: "", suffix: "h", decimals: 0, label: "Respuesta a tu solicitud" },
  { value: 0, prefix: "", suffix: " €", decimals: 0, label: "De entrada" },
  { value: 3, prefix: "", suffix: "", decimals: 0, label: "Proveedores de renting" },
  { value: 8, prefix: "", suffix: "", decimals: 0, label: "Servicios en la cuota" },
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
    <>
      <WebPageJsonLd tipo="AboutPage" nombre="Quiénes somos" descripcion="Quiénes somos en MoviLease y cómo trabajamos el renting de coches." path="/sobre-nosotros" />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", path: "/" },
          { name: "Quiénes somos", path: "/sobre-nosotros" },
        ]}
      />
    <div>
      {/* Hero — fondo claro de marca.
          La imagen deja la mitad izquierda casi vacía, que es justo donde cae
          el texto. Al ser clara, el titular pasa a tinta oscura: en blanco no
          se leería. El velo sólo levanta un poco la zona del texto. */}
      <section className="relative overflow-hidden bg-[#E8F0FC] pt-32 pb-24">
        <Image
          src="/img/quienes-somos-fondo.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(232,240,252,0.92) 0%, rgba(232,240,252,0.80) 42%, rgba(232,240,252,0.30) 68%, rgba(232,240,252,0.10) 100%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            {/* Azul mas oscuro que el de marca: a 11px sobre este fondo claro,
                #0057D6 se queda en 3,87:1 y no llega a AA. */}
            <p className="section-label" style={{ color: "#00409E" }}>
              Quiénes somos
            </p>
            <h1 className="display-lg mt-4 text-[#0A0A0A]">
              Hazlo fácil.
              <br />
              Hazlo <span className="text-[#0057D6]">MoviLease.</span>
            </h1>
          </Reveal>
          <RevealGroup stagger={0.06} className="mt-8 space-y-5">
            {INTRO_PARAGRAPHS.map((p) => (
              <RevealItem key={p}>
                <p className="max-w-2xl text-lg leading-relaxed text-[#33415C]">{p}</p>
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

      {/* Cierre — fondo azul claro (carretera hacia la ciudad).
          Al ser una imagen casi blanca, la sección deja de ser oscura: el
          texto va en tinta y el CTA secundario pasa a btn-white, que es el
          equivalente de btn-ghost para fondos claros. */}
      <section className="relative overflow-hidden bg-[#EAF2FD] py-28">
        <VideoBackdrop
          poster="/cierre-bg.webp"
          base="#EAF2FD"
          veil="linear-gradient(180deg, rgba(234,242,253,0.45) 0%, rgba(234,242,253,0.3) 50%, rgba(234,242,253,0.5) 100%)"
        />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="display-md text-[#0A0A0A]">
              Hazlo fácil.
              <br />
              Hazlo <span className="text-[#0057D6]">MoviLease.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#374151]">
              No vendemos coches. Creamos una nueva forma de acceder a la
              movilidad: más sencilla, más inteligente y pensada para ti.
              Porque cuando todo es fácil, solo queda disfrutar del camino.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/catalogo" className="btn-primary">
                Ver catálogo
              </Link>
              <Link href="/contacto" className="btn-white">
                Hablar con nosotros
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
    </>
  );
}
