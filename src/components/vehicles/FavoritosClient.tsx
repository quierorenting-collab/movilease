"use client";

import { useEffect, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { Container, Section } from "@/components/ui/Container";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { ButtonLink } from "@/components/ui/Button";
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
    <Section className="pt-12">
      <Container>
        <h1 className="text-3xl font-semibold tracking-tight">Tus favoritos</h1>
        <p className="mt-2 text-muted">
          Guardados en este navegador — no necesitas cuenta para verlos más tarde.
        </p>

        <div className="mt-10">
          {!hydrated || loading ? (
            <p className="text-muted">Cargando…</p>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border-subtle p-10 text-center text-muted">
              <p>Todavía no has guardado ningún favorito.</p>
              <ButtonLink href="/catalogo" className="mt-4">
                Explorar catálogo
              </ButtonLink>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
