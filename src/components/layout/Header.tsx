"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildWhatsAppLink, CONTACT } from "@/lib/constants";
import { Logo } from "@/components/ui/Logo";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#061B3F]/95 backdrop-blur border-b border-[#0068FF]/10 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 sm:px-10">
        <Link href="/" aria-label="MoviLease" className="opacity-90 transition-opacity hover:opacity-100">
          <Logo height={56} className="brightness-0 invert" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.15em] text-white/70">
          <Link href="/catalogo" className="hover:text-white transition-colors">Catálogo</Link>
          <Link href="/#por-que" className="hover:text-white transition-colors">Por qué elegirnos</Link>
          <Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={CONTACT.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
          </a>
          <a
            href={buildWhatsAppLink("Hola, me interesa el renting de coches.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-none border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-all hover:bg-white hover:text-[#061B3F]"
          >
            Contactar
          </a>
        </div>
      </div>
    </header>
  );
}
