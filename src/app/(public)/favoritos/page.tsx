import type { Metadata } from "next";
import { FavoritosClient } from "@/components/vehicles/FavoritosClient";

export const metadata: Metadata = {
  title: "Tus favoritos",
  description: "Los vehículos que has guardado como favoritos.",
};

export default function FavoritosPage() {
  return <FavoritosClient />;
}
