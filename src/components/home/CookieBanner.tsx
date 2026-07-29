"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { updateAnalyticsConsent } from "@/lib/analytics/consent";

const STORAGE_KEY = "ml_cookie_pref";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "accept") {
      updateAnalyticsConsent(true);
      return;
    }
    if (stored === "reject") return;
    const t = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(t);
  }, []);

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
          className="fixed bottom-4 inset-x-4 z-50 sm:left-auto sm:right-6 sm:max-w-md"
        >
          <div
            className="rounded-2xl border border-white/10 bg-[#0A0A0A]/85 p-6 backdrop-blur-xl"
            style={{ boxShadow: "var(--shadow-float)" }}
          >
            <p className="text-[13px] leading-relaxed text-white/50">
              Usamos cookies para mejorar tu experiencia de navegación.{" "}
              <Link
                href="/politica-cookies"
                className="text-white/80 underline underline-offset-2 transition-colors hover:text-white"
              >
                Más información
              </Link>
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button onClick={accept} className="btn-primary px-6 py-2.5">
                Aceptar
              </button>
              <button onClick={reject} className="btn-ghost px-6 py-2.5">
                Rechazar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
