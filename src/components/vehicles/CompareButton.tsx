"use client";

import { useComparison, MAX_COMPARISON_ITEMS } from "@/hooks/useComparison";

export function CompareButton({ vehicleId }: { vehicleId: string }) {
  const { has, toggle, hydrated, isFull } = useComparison();
  const active = hydrated && has(vehicleId);
  const disabled = hydrated && isFull && !active;

  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      title={
        disabled
          ? `Máximo ${MAX_COMPARISON_ITEMS} vehículos para comparar`
          : active
            ? "Quitar del comparador"
            : "Añadir al comparador"
      }
      onClick={(event) => {
        event.preventDefault();
        toggle(vehicleId);
      }}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 ${
        active
          ? "bg-[#0068FF] text-white shadow-[0_4px_16px_rgba(0,104,255,0.35)]"
          : "border border-[#E5E7EB] bg-white/85 text-[#6B7280] backdrop-blur-sm hover:border-[#0068FF]/40 hover:text-[#0068FF]"
      }`}
    >
      {active ? "✓ Comparando" : "+ Comparar"}
    </button>
  );
}
