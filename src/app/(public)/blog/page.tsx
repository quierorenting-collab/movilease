import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos sobre renting de coches para particulares.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
      <p className="mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
        Artículos y guías sobre renting. El listado se conecta al panel admin en la Fase 4.
      </p>
    </div>
  );
}
