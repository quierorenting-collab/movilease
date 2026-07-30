"use client";

import Link from "next/link";
import { useComparison } from "@/hooks/useComparison";

export function ComparisonBar() {
  const { ids, hydrated, clear } = useComparison();

  if (!hydrated || ids.length === 0) return null;

  return (
    /* La esquina inferior derecha queda reservada al botón de WhatsApp:
       esta barra se detiene antes para no taparlo en ningún ancho. */
    <div
      role="region"
      aria-label="Vehículos seleccionados para comparar"
      className="bottom-bar fixed left-4 right-[84px] z-40 mx-auto max-w-3xl sm:right-24"
    >
      <div className="glass-dark flex items-center justify-between gap-3 rounded-2xl border border-white/12 px-4 py-3 shadow-float sm:px-5">
        <span
          aria-live="polite"
          className="text-[14px] font-medium text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {ids.length} vehículo{ids.length === 1 ? "" : "s"}{" "}
          <span className="hidden text-white/70 sm:inline">para comparar</span>
        </span>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={clear}
            className="min-h-[40px] px-2 text-[13px] font-medium text-white/75 transition-colors hover:text-white"
          >
            Vaciar
          </button>
          <Link href={`/comparador?ids=${ids.join(",")}`} className="btn-primary btn-sm">
            Comparar
          </Link>
        </div>
      </div>
    </div>
  );
}
