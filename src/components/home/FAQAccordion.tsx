"use client";

import { useId, useState } from "react";

type FAQItem = { q: string; a: string };

/**
 * Acordeón accesible: los botones no anunciaban si la respuesta estaba
 * abierta ni a qué panel controlaban, así que con lector de pantalla no se
 * sabía qué había pasado al pulsar. Cada pregunta es además un h3 real,
 * para que el índice de encabezados de la página incluya las FAQ.
 *
 * La respuesta se monta SIEMPRE, aunque el panel esté cerrado. Antes iba
 * dentro de un `{isOpen && ...}` y el texto no llegaba al HTML: el FAQPage
 * declaraba respuestas que no existían en la página, que es justo lo que
 * Google descarta, y sin JS la pregunta no tenía respuesta. Ocultarla tras
 * un desplegable sí está permitido; no renderizarla, no.
 *
 * La animación va con grid-template-rows 0fr→1fr en vez de framer-motion:
 * anima a altura automática, sin medir nada y sin JS de animación.
 */
export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div className="divide-y divide-[#E5E7EB]">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-boton-${i}`;

        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                id={buttonId}
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full cursor-pointer items-start justify-between gap-6 py-6 text-left text-[16px] font-semibold leading-snug text-[#0A0A0A] transition-colors hover:text-[#0057D6]"
              >
                <span>{item.q}</span>
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-2xl leading-none text-[#0068FF] transition-transform duration-300 ease-out motion-reduce:transition-none"
                  style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="overflow-hidden">
                <p className="pb-6 text-[15px] leading-[1.7] text-[#4B5563]">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
