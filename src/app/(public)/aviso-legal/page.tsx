import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso legal",
  robots: { index: false },
};

export default function AvisoLegalPage() {
  return (
    <>
      <section className="surface-black relative pt-32 pb-24">
        <div className="ambient-blue-top" aria-hidden />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
          <p className="section-label mb-6">Legal</p>
          <h1 className="display-md text-white">Aviso legal</h1>
          <p className="mt-6 text-sm text-white/70">
            Última actualización: pendiente de publicación
          </p>
        </div>
      </section>
      <section className="surface-graphite py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2
            className="text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Identificación del titular
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Esta página recogerá los datos identificativos del responsable del
            sitio conforme a la normativa vigente.
          </p>
          <div className="mt-10 rounded-xl border border-[#0068FF]/15 bg-[#0068FF]/[0.04] p-5 text-[13px] leading-relaxed text-white/70">
            [PENDIENTE: completar con los datos fiscales/identificativos reales
            del responsable del sitio — nombre o razón social, NIF, domicilio y
            email de contacto — según exige la LSSI-CE antes de publicar esta
            página en producción.]
          </div>
        </div>
      </section>
    </>
  );
}
