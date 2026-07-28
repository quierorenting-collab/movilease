"use client";

import { useState } from "react";
import Link from "next/link";
import { RENTING_DEFAULTS } from "@/lib/constants";

const MIN_BUDGET = 200;
const MAX_BUDGET = 900;
const STEP = 10;

export function RentingCalculator() {
  const [budget, setBudget] = useState(400);

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8">
      <label htmlFor="budget" className="text-sm font-medium">
        ¿Cuánto quieres pagar al mes?
      </label>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-semibold text-primary">{budget}€</span>
        <span className="text-muted">/mes</span>
      </div>
      <input
        id="budget"
        type="range"
        min={MIN_BUDGET}
        max={MAX_BUDGET}
        step={STEP}
        value={budget}
        onChange={(event) => setBudget(Number(event.target.value))}
        className="mt-4 w-full accent-[#10b981]"
      />
      <div className="mt-1 flex justify-between text-xs text-muted-2">
        <span>{MIN_BUDGET}€</span>
        <span>{MAX_BUDGET}€</span>
      </div>

      <p className="mt-6 text-sm text-muted">
        Precio calculado para un contrato de {RENTING_DEFAULTS.contractMonths} meses y{" "}
        {RENTING_DEFAULTS.annualKm.toLocaleString("es-ES")} km/año, sin entrada.
      </p>

      <Link
        href={`/catalogo?maxPrice=${budget}`}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark px-6 py-3 text-sm font-medium text-white"
      >
        Ver coches hasta {budget}€/mes
      </Link>
    </div>
  );
}
