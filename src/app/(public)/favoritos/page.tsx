import type { Metadata } from "next";
import { FavoritosClient } from "@/components/vehicles/FavoritosClient";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Tus favoritos",
  description: "Los vehículos que has guardado como favoritos.",
  path: "/favoritos",
  // Lista guardada en el navegador del visitante: no es contenido indexable.
  noIndex: true,
});

export default function FavoritosPage() {
  return <FavoritosClient />;
}
