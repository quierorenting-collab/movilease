import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Página no encontrada</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        El contenido que buscas no existe o se ha movido.
      </p>
      <Link href="/" className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-medium text-white">
        Volver al inicio
      </Link>
    </div>
  );
}
