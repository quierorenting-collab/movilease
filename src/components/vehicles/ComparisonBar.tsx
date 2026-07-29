"use client";

import Link from "next/link";
import { useComparison } from "@/hooks/useComparison";

export function ComparisonBar() {
  const { ids, hydrated, clear } = useComparison();

  if (!hydrated || ids.length === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-40 mx-auto max-w-3xl">
      <div className="glass-dark flex items-center justify-between gap-4 rounded-2xl border border-white/10 px-5 py-3 shadow-float">
        <span
          className="text-sm font-medium text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {ids.length} vehículo{ids.length === 1 ? "" : "s"}{" "}
          <span className="hidden text-white/70 sm:inline">para comparar</span>
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clear}
            className="text-xs font-medium text-white/70 transition-colors hover:text-white"
          >
            Vaciar
          </button>
          <Link href={`/comparador?ids=${ids.join(",")}`} className="btn-primary px-5 py-2.5 text-sm">
            Comparar
          </Link>
        </div>
      </div>
    </div>
  );
}
