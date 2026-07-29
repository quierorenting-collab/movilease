"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="surface-black relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-24 text-center">
      <div className="ambient-blue" aria-hidden />
      <div className="relative z-10 flex flex-col items-center">
        <p className="section-label mb-6">Error</p>
        <h1 className="display-md text-white">Algo ha ido mal.</h1>
        <p className="mt-6 max-w-md text-white/70">
          Ha ocurrido un error inesperado. Puedes intentarlo de nuevo o volver
          al inicio.
        </p>
        {error.digest && (
          <p className="mt-4 font-mono text-[10px] text-white/70">
            Ref: {error.digest}
          </p>
        )}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button onClick={reset} className="btn-primary">
            Reintentar
          </button>
          <Link href="/" className="btn-ghost">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
