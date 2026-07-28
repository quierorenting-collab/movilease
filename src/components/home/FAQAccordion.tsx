"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type FAQItem = { q: string; a: string };

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-white/6">
      {items.map((item, i) => (
        <div key={item.q}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full cursor-pointer items-start justify-between gap-6 py-6 text-left text-sm font-medium text-white/75 transition-colors hover:text-white"
          >
            <span>{item.q}</span>
            <motion.span
              animate={{ rotate: open === i ? 45 : 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="shrink-0 text-xl leading-none text-[#0068FF] mt-0.5"
            >
              +
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ overflow: "hidden" }}
              >
                <p className="pb-6 text-sm leading-relaxed text-white/40">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
