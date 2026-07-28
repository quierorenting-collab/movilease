import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  robots: { index: false },
};

export default function PoliticaPrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Política de privacidad</h1>
      <p className="mt-6 text-zinc-600 dark:text-zinc-400">
        [PENDIENTE: redactar conforme al RGPD, incluyendo el responsable del tratamiento — mismo
        placeholder que en el Aviso Legal — y las finalidades reales del tratamiento de datos de
        leads/formularios.]
      </p>
    </div>
  );
}
