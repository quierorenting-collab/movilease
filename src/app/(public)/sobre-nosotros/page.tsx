import type { Metadata } from "next";
import { getCurrentBrand } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getCurrentBrand();
  return {
    title: "Sobre nosotros",
    description: `Quiénes somos en ${brand.name}.`,
  };
}

export default async function SobreNosotrosPage() {
  const brand = await getCurrentBrand();

  return (
    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Sobre nosotros</h1>
      <p className="mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
        Equipo {brand.name} — contenido definitivo pendiente de redacción.
      </p>
    </div>
  );
}
