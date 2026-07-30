"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useSpring, useTransform } from "framer-motion";
import { RENTING_DEFAULTS } from "@/lib/constants";

const MIN_BUDGET = 200;
const MAX_BUDGET = 900;
const STEP = 10;

export function RentingCalculator() {
  const [budget, setBudget] = useState(400);

  const spring = useSpring(budget, { stiffness: 180, damping: 24 });
  const display = useTransform(spring, (v) => Math.round(v).toString());

  useEffect(() => {
    spring.set(budget);
  }, [budget, spring]);

  const pct = ((budget - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;

  return (
    <div className="shadow-float rounded-3xl border border-white/12 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-10">
      <label
        htmlFor="budget"
        className="form-label"
      >
        Presupuesto mensual
      </label>

      <div className="mt-5 flex items-baseline gap-1.5">
        <motion.span
          aria-hidden="true"
          className="text-6xl font-bold leading-none text-white sm:text-7xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {display}
        </motion.span>
        <span
          aria-hidden="true"
          className="text-4xl font-bold text-[#5AA0FF] sm:text-5xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          €
        </span>
        <span aria-hidden="true" className="ml-1 text-[15px] text-white/75">/mes</span>
      </div>

      <input
        id="budget"
        type="range"
        min={MIN_BUDGET}
        max={MAX_BUDGET}
        step={STEP}
        value={budget}
        onChange={(event) => setBudget(Number(event.target.value))}
        aria-valuetext={`${budget} euros al mes`}
        aria-describedby="budget-ayuda"
        style={{
          background: `linear-gradient(to right, #0068FF ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
        }}
        className="mt-8 h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#0068FF] [&::-moz-range-thumb]:shadow-[0_0_0_6px_rgba(0,104,255,0.15)] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0068FF] [&::-webkit-slider-thumb]:shadow-[0_0_0_6px_rgba(0,104,255,0.15)]"
      />
      <div aria-hidden="true" className="mt-2 flex justify-between text-[13px] text-white/70">
        <span>{MIN_BUDGET}€</span>
        <span>{MAX_BUDGET}€</span>
      </div>

      <p id="budget-ayuda" className="mt-8 text-[13.5px] leading-relaxed text-white/75">
        Precio calculado para un contrato de {RENTING_DEFAULTS.contractMonths} meses ·{" "}
        {RENTING_DEFAULTS.annualKm.toLocaleString("es-ES")} km/año · sin entrada.
      </p>

      <Link
        href={`/catalogo?maxPrice=${budget}`}
        className="btn-primary btn-block mt-6"
      >
        Ver coches hasta {budget}€/mes
      </Link>
    </div>
  );
}
