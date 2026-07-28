"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SESSION_KEY = "qr_popup_v2";
const ease = [0.16, 1, 0.3, 1] as const;

export function LeadPopup() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "" });
  const [gdpr, setGdpr] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const t = setTimeout(() => setOpen(true), 6000);
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.6, ease }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10"
            style={{
              background: "linear-gradient(160deg, rgba(20,20,20,0.95) 0%, rgba(8,8,8,0.98) 100%)",
              backdropFilter: "blur(32px)",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.04), 0 24px 80px rgba(0,0,0,0.6), 0 0 120px rgba(0,104,255,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient glow inside modal */}
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2"
              style={{
                background: "radial-gradient(ellipse, rgba(0,104,255,0.15) 0%, transparent 70%)",
              }}
            />

            <button
              onClick={close}
              className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all duration-300 hover:border-white/30 hover:text-white"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>

            <div className="relative p-9">
              {status === "sent" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center gap-4 py-10 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF]/10">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#0068FF" strokeWidth="2" className="h-6 w-6">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    Mensaje recibido
                  </p>
                  <p className="text-sm text-white/40">Te contactamos en menos de 24 h.</p>
                  <button
                    onClick={close}
                    className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0068FF] transition-colors hover:text-white"
                  >
                    Cerrar
                  </button>
                </motion.div>
              ) : (
                <>
                  <p className="section-label mb-4">Asesoramiento gratuito</p>
                  <h2
                    className="text-[26px] font-bold leading-tight text-white"
                    style={{ fontFamily: "var(--font-space-grotesk)", letterSpacing: "-0.02em" }}
                  >
                    Tu próximo coche,
                    <br />
                    <span className="text-[#0068FF]">sin complicaciones.</span>
                  </h2>
                  <p className="mt-3 text-[13px] leading-relaxed text-white/35">
                    Déjanos tu teléfono y te asesoramos sin compromiso. Sin entrada, todo incluido.
                  </p>

                  <form onSubmit={submit} className="mt-7 flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="w-full rounded-xl border border-white/8 bg-white/[0.04] px-5 py-3.5 text-sm text-white placeholder-white/25 outline-none backdrop-blur-sm transition-all duration-300 focus:border-[#0068FF]/60 focus:bg-white/[0.06]"
                    />
                    <input
                      type="tel"
                      placeholder="Teléfono *"
                      required
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      className="w-full rounded-xl border border-white/8 bg-white/[0.04] px-5 py-3.5 text-sm text-white placeholder-white/25 outline-none backdrop-blur-sm transition-all duration-300 focus:border-[#0068FF]/60 focus:bg-white/[0.06]"
                    />
                    <input
                      type="email"
                      placeholder="Email (opcional)"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-xl border border-white/8 bg-white/[0.04] px-5 py-3.5 text-sm text-white placeholder-white/25 outline-none backdrop-blur-sm transition-all duration-300 focus:border-[#0068FF]/60 focus:bg-white/[0.06]"
                    />
                    <label className="mt-1 flex items-start gap-2.5 text-[11px] leading-relaxed text-white/30">
                      <input
                        type="checkbox"
                        checked={gdpr}
                        onChange={(e) => setGdpr(e.target.checked)}
                        required
                        className="mt-0.5 shrink-0 accent-[#0068FF]"
                      />
                      <span>
                        Acepto la{" "}
                        <a
                          href="/politica-privacidad"
                          className="text-white/50 underline transition-colors hover:text-white"
                          target="_blank"
                        >
                          política de privacidad
                        </a>
                      </span>
                    </label>
                    <button
                      type="submit"
                      disabled={status === "sending" || !gdpr}
                      className="btn-primary mt-3 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {status === "sending" ? "Enviando…" : "Solicitar asesoramiento"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
