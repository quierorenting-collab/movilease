import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de cookies",
  robots: { index: false },
};

export default function PoliticaCookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Política de cookies</h1>
      <p className="mt-6 text-zinc-600 dark:text-zinc-400">
        [PENDIENTE: documentar cookies reales (Supabase Auth, analítica, chat) cuando se integren
        en las fases siguientes.]
      </p>
    </div>
  );
}
