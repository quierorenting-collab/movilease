import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso legal",
  robots: { index: false },
};

export default function AvisoLegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Aviso legal</h1>
      <p className="mt-6 text-zinc-600 dark:text-zinc-400">
        [PENDIENTE: completar con los datos fiscales/identificativos reales del responsable del
        sitio — nombre o razón social, NIF, domicilio y email de contacto — según exige la LSSI-CE
        antes de publicar esta página en producción.]
      </p>
    </div>
  );
}
