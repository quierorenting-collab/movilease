"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { COOKIE_PREF_KEY as STORAGE_KEY, updateAnalyticsConsent } from "@/lib/analytics/consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  /**
   * Reserva su altura en --bottom-inset mientras está visible: el botón de
   * WhatsApp y la barra de comparación se apartan hacia arriba en lugar de
   * quedar tapados por el banner.
   */
  useEffect(() => {
    const el = cardRef.current;
    const root = document.documentElement;
    if (!visible || !el) {
      root.style.removeProperty("--bottom-inset");
      return;
    }
    const apply = () => root.style.setProperty("--bottom-inset", `${el.offsetHeight + 16}px`);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--bottom-inset");
    };
  }, [visible]);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accept");
    updateAnalyticsConsent(true);
    setVisible(false);
  }
  function reject() {
    localStorage.setItem(STORAGE_KEY, "reject");
    updateAnalyticsConsent(false);
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 bottom-4 z-50 sm:left-6 sm:right-auto sm:max-w-md"
        >
          <div
            ref={cardRef}
            role="dialog"
            aria-label="Aviso de cookies"
            className="rounded-2xl border border-white/12 bg-[#071A3D]/95 p-6 backdrop-blur-xl"
            style={{ boxShadow: "var(--shadow-float)" }}
          >
            <p className="text-[14px] leading-relaxed text-white/80">
              Usamos cookies para mejorar tu experiencia de navegación.{" "}
              <Link
                href="/politica-cookies"
                className="text-white/80 underline underline-offset-2 transition-colors hover:text-white"
              >
                Más información
              </Link>
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button onClick={accept} className="btn-primary btn-sm">
                Aceptar
              </button>
              <button onClick={reject} className="btn-ghost btn-sm">
                Rechazar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
