"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "qr_popup_v2";

export function LeadPopup() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "" });
  const [gdpr, setGdpr] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const t = setTimeout(() => setOpen(true), 4000);
    return () => clearTimeout(t);
  }, []);

  function close() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!gdpr || !form.telefono) return;
    setStatus("sending");
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "contact_form" }),
      });
    } catch {
      // silent fail
    }
    setStatus("sent");
    sessionStorage.setItem(SESSION_KEY, "1");
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#111827] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute right-4 top-4 text-[#64748b] hover:text-white transition-colors z-10"
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left panel */}
          <div className="bg-[#0a0f1c] p-7 md:w-2/5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#22c55e]">Oferta exclusiva</p>
            <h2 className="mt-2 text-xl font-bold text-white leading-tight">
              Recibe las mejores ofertas de renting
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-[#94a3b8]">
              {[
                "Sin entrada, 0€",
                "Seguro incluido",
                "Gestión en 48h",
                "Asesoría personal gratis",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right panel */}
          <div className="flex-1 p-7">
            {status === "sent" ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center py-6">
                <div className="text-4xl">✅</div>
                <p className="font-semibold text-white">¡Mensaje recibido!</p>
                <p className="text-sm text-[#94a3b8]">Te contactamos en menos de 24h.</p>
                <button onClick={close} className="mt-3 text-sm text-[#22c55e] hover:underline">
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <h3 className="font-semibold text-white">¿Hablamos sin compromiso?</h3>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full rounded-lg bg-[#1a2236] px-4 py-3 text-sm text-white placeholder-[#64748b] outline-none focus:ring-1 focus:ring-[#22c55e]"
                />
                <input
                  type="tel"
                  placeholder="Teléfono *"
                  required
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full rounded-lg bg-[#1a2236] px-4 py-3 text-sm text-white placeholder-[#64748b] outline-none focus:ring-1 focus:ring-[#22c55e]"
                />
                <input
                  type="email"
                  placeholder="Email (opcional)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg bg-[#1a2236] px-4 py-3 text-sm text-white placeholder-[#64748b] outline-none focus:ring-1 focus:ring-[#22c55e]"
                />
                <label className="flex items-start gap-2 text-xs text-[#64748b]">
                  <input
                    type="checkbox"
                    checked={gdpr}
                    onChange={(e) => setGdpr(e.target.checked)}
                    required
                    className="mt-0.5 shrink-0 accent-[#22c55e]"
                  />
                  Acepto la{" "}
                  <a href="/politica-privacidad" className="underline hover:text-white" target="_blank">
                    política de privacidad
                  </a>
                </label>
                <button
                  type="submit"
                  disabled={status === "sending" || !gdpr}
                  className="rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {status === "sending" ? "Enviando…" : "Quiero mi oferta gratis"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
