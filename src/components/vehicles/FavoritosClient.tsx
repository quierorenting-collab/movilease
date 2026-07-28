"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import type { VehicleCardData } from "@/lib/data/vehicles";

export function FavoritosClient() {
  const { ids, hydrated } = useFavorites();
  const [vehicles, setVehicles] = useState<VehicleCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (ids.length === 0) {
      setVehicles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/favorites/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleIds: ids }),
    })
      .then((res) => res.json())
      .then((data) => setVehicles(data.vehicles ?? []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [hydrated, ids]);

  return (
    <section className="surface-black ambient-blue-top relative min-h-screen pt-32 pb-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <p className="section-label">Favoritos</p>
          <h1 className="display-lg mt-4 text-white">Tus favoritos.</h1>
          <p className="mt-4 max-w-xl text-white/40">
            Guardados en este navegador — no necesitas cuenta para verlos más tarde.
          </p>
        </Reveal>

        <div className="mt-14">
          {!hydrated || loading ? (
            <p className="text-white/40">Cargando…</p>
          ) : vehicles.length > 0 ? (
            <RevealGroup
              stagger={0.06}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {vehicles.map((vehicle) => (
                <RevealItem key={vehicle.id}>
                  <VehicleCard vehicle={vehicle} />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <Reveal>
              <div className="mx-auto max-w-md rounded-3xl border border-white/8 bg-white/[0.03] p-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 20.727c-.412 0-.809-.164-1.101-.455L4.6 14.014c-1.968-1.968-1.968-5.157 0-7.125 1.845-1.845 4.729-1.968 6.716-.371.184.148.44.148.624 0 1.987-1.597 4.871-1.474 6.716.371 1.968 1.968 1.968 5.157 0 7.125l-6.299 6.258c-.292.291-.689.455-1.101.455Z"
                    />
                  </svg>
                </div>
                <h2
                  className="mt-6 text-xl font-semibold text-white"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  Aún no tienes favoritos
                </h2>
                <p className="mt-3 text-sm text-white/40">
                  Explora el catálogo y guarda los vehículos que más te interesen.
                </p>
                <Link href="/catalogo" className="btn-primary mt-8 inline-flex">
                  Explorar catálogo
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
