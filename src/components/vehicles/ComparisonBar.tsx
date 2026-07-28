"use client";

import Link from "next/link";
import { useComparison } from "@/hooks/useComparison";

export function ComparisonBar() {
  const { ids, hydrated, clear } = useComparison();

  if (!hydrated || ids.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex items-center gap-3 rounded-full border border-border-subtle bg-surface px-4 py-2 shadow-lg">
      <span className="text-sm">
        {ids.length} vehículo{ids.length === 1 ? "" : "s"} para comparar
      </span>
      <Link
        href={`/comparador?ids=${ids.join(",")}`}
        className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white"
      >
        Comparar
      </Link>
      <button type="button" onClick={clear} className="text-xs text-muted hover:text-foreground">
        Vaciar
      </button>
    </div>
  );
}
