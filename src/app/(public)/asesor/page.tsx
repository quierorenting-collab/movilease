import type { Metadata } from "next";
import { Asesor } from "@/components/asesor/Asesor";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Asesor de renting",
  description:
    "Cuéntanos qué buscas y te decimos qué coches encajan con tu presupuesto, qué incluye la cuota y qué documentación necesitas. Sin entrada y sin compromiso.",
  path: "/asesor",
});

export default function AsesorPage() {
  return (
    <>
      <section className="surface-black relative pt-32 pb-16">
        <div className="ambient-blue-top" aria-hidden />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="section-label mb-6">Asesor</p>
          <h1 className="display-md text-white">Te ayudamos a elegir</h1>
          <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-white/70">
            Unas pocas preguntas y te enseñamos los coches que encajan de verdad
            con lo que buscas, con su cuota real y sin compromiso. Te damos
            respuesta en menos de 48 horas laborables.
          </p>
        </div>
      </section>

      <section className="surface-graphite pb-24 pt-4">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Asesor />
        </div>
      </section>
    </>
  );
}
