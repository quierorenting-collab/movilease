"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { buildWhatsAppLink } from "@/lib/constants";
import { AnimatedCounter } from "@/components/ui/Reveal";

const SESSION_KEY = "qr_popup_v3";
const ease = [0.16, 1, 0.3, 1] as const;

/** Páginas que ya tienen el formulario delante: interrumpir ahí solo estorba. */
const SILENCED_PATHS = ["/contacto", "/favoritos"];

export function LeadPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [form, setForm] = useState({ nombre: "", telefono: "" });
  const [gdpr, setGdpr] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  /**
   * Antes saltaba a los 6 segundos, sin más: interrumpía a media lectura del
   * hero, cuando el visitante aún no sabe si le interesa. Ahora espera una
   * señal de intención — que haya leído media página o que el cursor se vaya
   * hacia la barra del navegador — con un plazo largo como último recurso.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (SILENCED_PATHS.some((p) => pathname?.startsWith(p))) return;

    let done = false;
    const trigger = () => {
      if (done) return;
      done = true;
      cleanup();
      setOpen(true);
    };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.5) trigger();
    };
    // Salida del puntero por el borde superior = intención de abandonar
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 4) trigger();
    };
    const timer = window.setTimeout(trigger, 45000);

    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onLeave);
    return cleanup;
  }, [pathname]);

  // Al abrir: recordar el foco previo, llevarlo al primer campo y devolverlo al cerrar
  useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lastFocusedRef.current?.focus?.();
    };
  }, [open]);

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
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-titulo"
            className="relative w-full max-w-[420px] overflow-hidden rounded-[28px] border border-white/12"
            style={{
              background: "linear-gradient(165deg, rgba(20,52,112,0.97) 0%, rgba(6,22,52,0.99) 62%, rgba(4,14,33,1) 100%)",
              backdropFilter: "blur(32px)",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.05), 0 30px 90px rgba(0,0,0,0.65), 0 0 140px rgba(0,104,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent line */}
            <div className="h-[3px] w-full bg-gradient-to-r from-[#0068FF] via-[#5AA0FF] to-[#0068FF]" />

            {/* Ambient glow, pulsing gently for a touch of life */}
            <div
              className="pointer-events-none absolute -top-20 left-1/2 h-56 w-[420px] -translate-x-1/2"
              style={{
                background: "radial-gradient(ellipse, rgba(0,104,255,0.22) 0%, transparent 70%)",
                animation: "glow-pulse 4s ease-in-out infinite",
              }}
            />

            <button
              onClick={close}
              className="absolute right-4 top-[18px] z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-white/70 transition-all duration-300 hover:border-white/30 hover:bg-white/5 hover:text-white"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>

            <div className="relative px-8 pb-8 pt-9 sm:px-9">
              {status === "sent" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center gap-4 py-10 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF]/15">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#5AA0FF" strokeWidth="2" className="h-6 w-6">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    Mensaje recibido
                  </p>
                  <p className="text-[15px] text-white/75">Te contactamos en menos de 24 h.</p>
                  <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
                    <a
                      href={buildWhatsAppLink("Hola, acabo de dejar mis datos en la web y quiero seguir por aquí.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp btn-sm"
                      onClick={close}
                    >
                      Continuar por WhatsApp
                    </a>
                    <button onClick={close} className="btn-ghost btn-sm">
                      Cerrar
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Trust strip — misma cifra que el resto de la web, aquí como prueba social rápida */}
                  <div className="mb-5 flex items-center gap-2.5 text-[12.5px] font-medium text-white/70">
                    <span className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} viewBox="0 0 12 12" fill="#5AA0FF" className="h-3 w-3">
                          <path d="M6 0l1.5 4h4.5l-3.5 2.5 1.5 4L6 8.5 2 10.5l1.5-4L0 4h4.5z" />
                        </svg>
                      ))}
                    </span>
                    <span>
                      4,9/5 ·{" "}
                      <span className="font-bold text-white">
                        <AnimatedCounter value={10000} prefix="+" duration={1.4} />
                      </span>{" "}
                      clientes
                    </span>
                  </div>

                  <h2
                    id="popup-titulo"
                    className="text-[27px] font-bold leading-[1.08] text-white"
                    style={{ fontFamily: "var(--font-space-grotesk)", letterSpacing: "-0.02em" }}
                  >
                    Tu próximo coche,
                    <br />
                    <span className="text-[#5AA0FF]">sin complicaciones.</span>
                  </h2>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-white/75">
                    Déjanos tu teléfono y te asesoramos sin compromiso. Sin entrada, todo incluido.
                  </p>

                  <form onSubmit={submit} className="mt-7 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        ref={firstFieldRef}
                        type="text"
                        aria-label="Nombre"
                        autoComplete="given-name"
                        placeholder="Nombre"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        className="input-glass"
                      />
                      <input
                        type="tel"
                        inputMode="tel"
                        aria-label="Teléfono"
                        autoComplete="tel"
                        placeholder="Teléfono *"
                        required
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        className="input-glass"
                      />
                    </div>
                    <label className="mt-1 flex items-start gap-2.5 text-[12.5px] leading-relaxed text-white/70">
                      <input
                        type="checkbox"
                        checked={gdpr}
                        onChange={(e) => setGdpr(e.target.checked)}
                        required
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[#0068FF]"
                      />
                      <span>
                        Acepto la{" "}
                        <a
                          href="/politica-privacidad"
                          className="text-white/70 underline transition-colors hover:text-white"
                          target="_blank"
                        >
                          política de privacidad
                        </a>
                      </span>
                    </label>
                    <button
                      type="submit"
                      disabled={status === "sending" || !gdpr}
                      className="btn-primary btn-block mt-2"
                    >
                      {status === "sending" ? "Enviando…" : "Quiero que me asesoren"}
                    </button>
                    <p className="text-center text-[11.5px] text-white/40">
                      Sin compromiso · Respuesta en menos de 24 h
                    </p>
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
