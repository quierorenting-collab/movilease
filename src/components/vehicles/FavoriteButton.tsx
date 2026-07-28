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
      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={active ? "#c9a227" : "none"}
        stroke="currentColor"
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
