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
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border-subtle text-muted hover:text-foreground"
      }`}
    >
      {active ? "✓ Comparando" : "+ Comparar"}
    </button>
  );
}
