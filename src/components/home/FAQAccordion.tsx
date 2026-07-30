"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type FAQItem = { q: string; a: string };

/**
 * Acordeón accesible: los botones no anunciaban si la respuesta estaba
 * abierta ni a qué panel controlaban, así que con lector de pantalla no se
 * sabía qué había pasado al pulsar. Cada pregunta es además un h3 real,
 * para que el índice de encabezados de la página incluya las FAQ.
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
                <motion.span
                  aria-hidden="true"
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  className="mt-0.5 shrink-0 text-2xl leading-none text-[#0068FF]"
                >
                  +
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <p className="pb-6 text-[15px] leading-[1.7] text-[#4B5563]">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
