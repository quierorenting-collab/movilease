"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { buildWhatsAppLink } from "@/lib/constants";
import { Logo } from "@/components/ui/Logo";

const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/#ofertas", label: "Ofertas" },
  { href: "/calculadora", label: "Calculadora" },
  { href: "/#por-que", label: "Cómo funciona" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Escape cierra el menú: salir sin ratón no debería requerir buscar la X
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>

      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass-dark shadow-[0_8px_32px_rgba(0,0,0,0.28)]"
            : "bg-gradient-to-b from-[#071A3D]/70 to-transparent"
        }`}
      >
        <div
          className={`mx-auto flex w-full max-w-7xl items-center justify-between px-5 transition-[height] duration-500 sm:px-10 ${
            scrolled ? "h-[72px]" : "h-[88px]"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="MoviLease — ir a la portada"
            className="shrink-0 rounded-xl bg-white px-3.5 py-2 shadow-lg shadow-black/15 transition-all duration-500 sm:px-4"
          >
            <Logo
              height={scrolled ? 44 : 54}
              className="transition-all duration-500"
            />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Navegación principal" className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/75 transition-colors duration-300 hover:text-white"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#5AA0FF] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={buildWhatsAppLink("Hola, me interesa el renting de coches.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp btn-sm hidden sm:inline-flex"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12.004 2C6.478 2 2 6.477 2 12c0 1.848.505 3.58 1.383 5.065L2 22l5.062-1.362A9.94 9.94 0 0 0 12.004 22C17.53 22 22 17.523 22 12S17.53 2 12.004 2zm0 18.045a8.02 8.02 0 0 1-4.086-1.117l-.293-.174-3.006.809.805-2.933-.19-.303A8.05 8.05 0 1 1 20.05 12a8.05 8.05 0 0 1-8.046 8.045z" />
              </svg>
              WhatsApp
            </a>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              aria-controls="menu-movil"
              className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-lg border border-white/15 bg-white/[0.04] lg:hidden"
            >
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
                className="h-[1.5px] w-[18px] bg-white"
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                className="h-[1.5px] w-[18px] bg-white"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
                className="h-[1.5px] w-[18px] bg-white"
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="menu-movil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[#071A3D]/98 px-7 pb-10 pt-[104px] backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Navegación principal" className="flex flex-1 flex-col justify-center">
              <ul className="flex flex-col">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-white/8"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-4 text-[28px] font-bold leading-tight text-white transition-colors hover:text-[#5AA0FF]"
                      style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.5 }}
                className="mt-9 flex flex-col gap-3"
              >
                <a
                  href={buildWhatsAppLink("Hola, me interesa el renting de coches.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp btn-block"
                  onClick={() => setMobileOpen(false)}
                >
                  Hablar por WhatsApp
                </a>
                <Link
                  href="/contacto"
                  onClick={() => setMobileOpen(false)}
                  className="btn-ghost btn-block"
                >
                  Solicitar información
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
