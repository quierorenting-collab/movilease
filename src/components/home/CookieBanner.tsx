"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "qr_cookie_pref";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accept");
    setVisible(false);
  }
  function reject() {
    localStorage.setItem(STORAGE_KEY, "reject");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#111827]/95 px-4 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#94a3b8]">
          Usamos cookies para mejorar tu experiencia.{" "}
          <Link href="/politica-cookies" className="underline hover:text-white">
            Más información
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={reject}
            className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-[#94a3b8] hover:text-white transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={accept}
            className="rounded-full bg-[#22c55e] px-4 py-1.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
