import Link from "next/link";

export default function NotFound() {
  return (
    <div className="surface-black relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-24 text-center">
      <div className="ambient-blue" aria-hidden />
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <span
            className="display-xl select-none leading-none"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px rgba(255,255,255,0.15)",
            }}
            aria-hidden
          >
            404
          </span>
          <h1 className="display-md absolute inset-0 flex items-center justify-center text-white">
            Página no encontrada
          </h1>
        </div>
        <p className="mt-6 max-w-md text-white/40">
          El contenido que buscas no existe o se ha movido.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/" className="btn-primary">
            Volver al inicio
          </Link>
          <Link href="/catalogo" className="btn-ghost">
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
