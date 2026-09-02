"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { buildWhatsAppLink } from "@/lib/constants";
import { COOKIE_PREF_KEY } from "@/lib/analytics/consent";

const SESSION_KEY = "qr_popup_v4";
const ease = [0.16, 1, 0.3, 1] as const;

/** Páginas que ya tienen el formulario delante: interrumpir ahí solo estorba. */
const SILENCED_PATHS = ["/contacto", "/favoritos", "/asesor"];

export function LeadPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "" });
  const [gdpr, setGdpr] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  /**
   * Se abre con lo que ocurra antes: 10 % de scroll, salida del puntero por
   * arriba (intención de abandonar) o 5 segundos.
   *
   * El plazo corto lo pidió Adrián expresamente. Contrapartida conocida: a los
   * 5 segundos mucha gente sigue leyendo el hero y aún no sabe si le interesa,
   * así que se ve más veces pero también molesta más. Si el ratio de cierres
   * sin rellenar sube, subir este número es lo primero que hay que tocar.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (SILENCED_PATHS.some((p) => pathname?.startsWith(p))) return;

    let done = false;
    let reintento = 0;
    const trigger = () => {
      if (done) return;
      /* El banner de cookies ocupa el mismo carril y va a z-50; este pop-up es
         un modal a pantalla completa con z-[60], así que su velo deja el
         banner detrás e inaccesible: el visitante no puede ni aceptar ni
         rechazar, y en una primera visita coinciden siempre (banner a los
         900 ms, pop-up a los 5 s). Mientras esa decisión siga pendiente, el
         pop-up espera su turno en vez de pisarla. */
      let decidido: string | null = "1";
      try {
        decidido = localStorage.getItem(COOKIE_PREF_KEY);
      } catch {
        /* Almacenamiento bloqueado: no se puede saber, así que no se estorba. */
      }
      if (!decidido) {
        reintento = window.setTimeout(trigger, 2000);
        return;
      }
      /* Misma cortesia con la ventana del asesor: este pop-up va a z-[60] y la
         ventana a z-[35], asi que saltar encima taparia al visitante justo
         mientras esta conversando. Espera a que la cierre en vez de
         interrumpirle; si nunca la cierra, es que el asesor ya esta haciendo
         el trabajo que este pop-up venia a hacer. */
      if (document.documentElement.dataset.asesorAbierto) {
        reintento = window.setTimeout(trigger, 2000);
        return;
      }
      done = true;
      cleanup();
      setOpen(true);
    };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.10) trigger();
    };
    // Salida del puntero por el borde superior = intención de abandonar
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 4) trigger();
    };
    const timer = window.setTimeout(trigger, 5000);

    function cleanup() {
      window.clearTimeout(timer);
      window.clearTimeout(reintento);
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
      // Los nombres de campo son los del esquema zod (name/phone/rgpd), no los
      // del estado local en español: el pop-up mandaba `nombre`/`telefono` y
      // createLead los recibía como null, así que TODOS los leads del pop-up se
      // perdían con un 400 mientras el cliente leía "Mensaje recibido".
      //
      // email, message y website van SIEMPRE aunque estén vacíos: leads.ts los
      // lee sin `|| undefined`, y una clave ausente llega como null, que zod
      // rechaza. Omitirlos vuelve a romper el envío entero.
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.nombre,
          phone: form.telefono,
          email: form.email,
          message: "",
          website: "",
          rgpd: "on",
          source: "contact_form",
          pageUrl: pathname ?? "",
        }),
      });
      const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
      if (!res.ok || !data?.success) {
        setStatus("error");
        return;
      }
    } catch {
      setStatus("error");
      return;
    }
    setStatus("sent");
    // Solo se silencia el pop-up cuando el lead ha entrado de verdad. Si falló,
    // el cliente puede reintentar en lugar de quedarse sin vía de contacto.
    sessionStorage.setItem(SESSION_KEY, "1");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.45, ease }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-titulo"
            className="relative flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-y-auto rounded-[28px] border border-white/12"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.05), 0 30px 90px rgba(0,0,0,0.65), 0 0 140px rgba(0,104,255,0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-black/40 hover:text-white"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>

            {/* Banner de marca. El creativo ya trae el logo, el eslogan y el
                coche, asi que va a ancho completo y en 16/10, que es casi la
                proporcion original (3/2): recortar mas cortaria el logo. */}
            <div className="relative aspect-[16/10] w-full shrink-0">
              <Image
                src="/img/popup-movilease.webp"
                alt="MoviLease — Hazlo fácil. Hazlo Movilease."
                fill
                priority
                sizes="(max-width: 640px) 100vw, 560px"
                className="object-cover object-center"
              />
              {/* Fundido inferior hacia el formulario */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                style={{ background: "linear-gradient(180deg, transparent 0%, rgba(20,52,112,0.85) 70%, #143470 100%)" }}
              />

              {/* Antes iban cinco estrellas y "4,9/5 · +10.000 clientes". Las
                  estrellas se van con la nota: pintar una valoración sin nota
                  detrás sigue insinuando lo mismo. Se queda lo que sí es cierto. */}
              <div className="absolute bottom-3 left-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 py-1.5 pl-3 pr-3.5 backdrop-blur-md">
                <span className="text-[11.5px] font-semibold text-white">
                  Sin entrada · Respuesta en 48 h
                </span>
              </div>
            </div>

            {/* Panel de formulario */}
            <div
              className="relative px-7 pb-7 pt-6 sm:px-8"
              style={{
                background:
                  "linear-gradient(165deg, rgba(20,52,112,0.97) 0%, rgba(6,22,52,0.99) 62%, rgba(4,14,33,1) 100%)",
              }}
            >
              {/* Glow ambiental, con un pulso suave para dar vida a la esquina */}
              <div
                className="pointer-events-none absolute -top-16 right-0 h-48 w-64"
                style={{
                  background: "radial-gradient(ellipse, rgba(0,104,255,0.24) 0%, transparent 70%)",
                  animation: "glow-pulse 4s ease-in-out infinite",
                }}
              />

              {status === "sent" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative flex h-full flex-col items-center justify-center gap-4 py-6 text-center"
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
                <div className="relative">
                  {/* La imagen ya dice "Hazlo facil. Hazlo Movilease.": aqui
                      no se repite, se pasa directo a la accion. */}
                  <h2
                    id="popup-titulo"
                    className="text-[22px] font-bold leading-tight text-white"
                    style={{ fontFamily: "var(--font-space-grotesk)", letterSpacing: "-0.02em" }}
                  >
                    Te lo calculamos <span className="text-[#8FBEFF]">gratis</span>.
                  </h2>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-white/75">
                    Déjanos tu teléfono y te asesoramos sin compromiso. Sin entrada,
                    todo incluido.
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
                    <input
                      type="email"
                      inputMode="email"
                      aria-label="Email (opcional)"
                      autoComplete="email"
                      placeholder="Email (opcional)"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-glass"
                    />
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
                    {/* Antes un envío fallido enseñaba "Mensaje recibido" igual.
                        Si algo falla, el cliente tiene que enterarse y tener una
                        salida: perder el lead en silencio es lo peor de todo. */}
                    <div aria-live="polite" aria-atomic="true">
                      {status === "error" && (
                        <p className="rounded-xl border border-red-400/30 bg-red-500/[0.12] px-4 py-3 text-[13.5px] text-red-200">
                          No hemos podido enviar tus datos. Inténtalo otra vez o
                          escríbenos por{" "}
                          <a
                            href={buildWhatsAppLink(
                              "Hola, he intentado dejar mis datos en la web y me daba error."
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            WhatsApp
                          </a>
                          .
                        </p>
                      )}
                    </div>
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
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
