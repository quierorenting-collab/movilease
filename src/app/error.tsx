"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Algo ha ido mal</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        {error.message || "Ha ocurrido un error inesperado."}
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-medium text-white"
      >
        Reintentar
      </button>
    </div>
  );
}
