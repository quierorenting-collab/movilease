import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  robots: { index: false },
};

export default function PoliticaPrivacidadPage() {
  return (
    <>
      <section className="surface-black relative pt-32 pb-24">
        <div className="ambient-blue-top" aria-hidden />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
          <p className="section-label mb-6">Legal</p>
          <h1 className="display-md text-white">Política de privacidad</h1>
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
            Tratamiento de datos personales
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Esta página detallará cómo se recogen y tratan los datos personales
            de los usuarios del sitio.
          </p>
          <div className="mt-10 rounded-xl border border-[#0068FF]/15 bg-[#0068FF]/[0.04] p-5 text-[13px] leading-relaxed text-white/70">
            [PENDIENTE: redactar conforme al RGPD, incluyendo el responsable del
            tratamiento — mismo placeholder que en el Aviso Legal — y las
            finalidades reales del tratamiento de datos de leads/formularios.]
          </div>
        </div>
      </section>
    </>
  );
}
