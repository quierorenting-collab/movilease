"use client";

import { useState } from "react";

import { CONTACT, buildWhatsAppLink } from "@/lib/constants";
import type { ContextoCoche } from "./abrirAsesor";

/**
 * Lo que ve quien abre la ventana desde un coche concreto.
 *
 * Empieza PLEGADA, en dos lineas. Es deliberado: la ventana mide 380 px de
 * ancho y unos 560 de alto, y un coche con seis filas de cuotas empujaria la
 * primera pregunta del asesor fuera de la vista. Plegada, el visitante ve que
 * la ventana sabe que coche esta mirando y tiene las cuotas a un clic.
 *
 * TODOS los datos vienen ya formateados desde la ficha. Aqui no se calcula ni
 * se estima ningun precio: se repiten los mismos textos que el visitante
 * acaba de ver, que es la unica forma de garantizar que el asesor no le diga
 * una cuota distinta de la que pone la pagina.
 */
export function ContextoCocheCard({ coche }: { coche: ContextoCoche }) {
  const [abierto, setAbierto] = useState(false);
  const cuotas = coche.cuotas ?? [];
  const servicios = coche.serviciosIncluidos ?? [];

  return (
    <div className="mb-3 rounded-xl border border-[#5AA0FF]/25 bg-[#5AA0FF]/10">
      <div className="px-3.5 pt-3">
        <p className="text-[13px] leading-relaxed text-white/85">
          Estás viendo el <span className="font-semibold text-white">{coche.nombre}</span>
          {coche.desde && (
            <>
              , desde <span className="font-semibold text-white">{coche.desde}/mes</span>
            </>
          )}
          .
        </p>
      </div>

      {cuotas.length > 0 && (
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          className="mt-1.5 flex w-full items-center justify-between px-3.5 pb-3 text-left text-[12.5px] font-medium text-[#8FC0FF] transition-colors duration-200 hover:text-white"
        >
          {abierto
            ? "Ocultar las cuotas"
            : `Ver las ${cuotas.length} cuotas disponibles`}
          <span aria-hidden="true" className="ml-2 text-[15px] leading-none">
            {abierto ? "−" : "+"}
          </span>
        </button>
      )}

      {abierto && (
        <div className="border-t border-[#5AA0FF]/20 px-3.5 py-3">
          {/* Una fila por combinacion de plazo y kilometraje, igual que la
              tabla de la ficha. Nada de "desde": todas las opciones, que es
              justo lo que se pidio. */}
          <ul className="flex flex-col gap-1.5">
            {cuotas.map((c) => (
              <li
                key={`${c.meses}-${c.km}`}
                className="flex items-baseline justify-between gap-3 text-[12.5px]"
              >
                <span className="text-white/70">
                  {c.meses} meses · {c.km.toLocaleString("es-ES")} km/año
                </span>
                <span className="shrink-0 font-semibold text-white">{c.precio}/mes</span>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[11.5px] leading-relaxed text-white/60">
            IVA incluido y sin entrada. La cuota cambia según el plazo que elijas.
          </p>

          {servicios.length > 0 && (
            <p className="mt-2 text-[11.5px] leading-relaxed text-white/60">
              <span className="text-white/80">Incluye:</span> {servicios.join(" · ")}.
            </p>
          )}

          {/* Salida directa desde aqui: quien ya ha visto la cuota que le
              encaja no deberia tener que recorrer el cuestionario entero para
              preguntar por ella. El mensaje va prerrellenado con el coche. */}
          <div className="mt-3 flex flex-col gap-2">
            <a
              href={buildWhatsAppLink(
                `Hola, estoy viendo el ${coche.nombre}${
                  coche.desde ? ` (desde ${coche.desde}/mes)` : ""
                }. ¿Me podéis pasar oferta y decirme qué cuotas tenéis?`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#25D366] px-3 py-2 text-center text-[12.5px] font-semibold text-[#04240F] transition-colors duration-200 hover:bg-[#1DA851] hover:text-white"
            >
              Pedir oferta por WhatsApp
            </a>
            <a
              href={`tel:${CONTACT.phone}`}
              className="rounded-lg border border-white/15 px-3 py-2 text-center text-[12.5px] font-medium text-white/85 transition-colors duration-200 hover:bg-white/5"
            >
              Prefiero que me llaméis
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
