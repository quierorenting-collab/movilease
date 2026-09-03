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
      /* Sin scale: escalar un botón cuyo contenido es texto de 12,5 px lo pasa
         por el filtro del navegador y lo emborrona durante toda la animación.
         En un botón que dice "Comparar" y nada más, ese medio segundo de texto
         borroso es lo único que se nota del hover. El color ya avisa de sobra. */
      className={`inline-flex min-h-[40px] shrink-0 items-center whitespace-nowrap rounded-full px-4 py-2 text-[12.5px] font-semibold transition-[background-color,border-color,color] disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-[#0068FF] text-white shadow-[0_4px_16px_rgba(0,104,255,0.35)]"
          : "border border-[#D8DDE5] bg-white text-[#4B5563] hover:border-[#0068FF]/50 hover:text-[#0057D6]"
      }`}
    >
      {active ? "✓ Comparando" : "+ Comparar"}
    </button>
  );
}
