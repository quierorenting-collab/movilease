"use client";

import { useFavorites } from "@/hooks/useFavorites";

export function FavoriteButton({ vehicleId }: { vehicleId: string }) {
  const { has, toggle, hydrated } = useFavorites();
  const active = hydrated && has(vehicleId);

  return (
    <button
      type="button"
      aria-label={active ? "Quitar de favoritos" : "Añadir a favoritos"}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        toggle(vehicleId);
      }}
      className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-[transform,background-color] hover:scale-105"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px] transition-colors"
        fill={active ? "#0068FF" : "none"}
        stroke={active ? "#0068FF" : "#9CA3AF"}
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.727c-.412 0-.809-.164-1.101-.455L4.6 14.014c-1.968-1.968-1.968-5.157 0-7.125 1.845-1.845 4.729-1.968 6.716-.371.184.148.44.148.624 0 1.987-1.597 4.871-1.474 6.716.371 1.968 1.968 1.968 5.157 0 7.125l-6.299 6.258c-.292.291-.689.455-1.101.455Z"
        />
      </svg>
    </button>
  );
}
