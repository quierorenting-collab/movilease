import Link from "next/link";
import { CONTACT } from "@/lib/constants";

export async function Footer() {
  return (
    <footer className="border-t border-[#18BBE5]/10 bg-[#041020] py-10 text-sm text-[#94b8cc]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:px-6 text-center">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="8" fill="#071A2F"/>
            <path d="M6 28L12 8L18 20L24 8L30 28" stroke="#18BBE5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="20" y1="14" x2="32" y2="2" stroke="#18BBE5" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
          </svg>
          <div className="leading-none text-left">
            <span className="block text-sm font-bold tracking-wider text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              MOVILEASE<sup className="text-[8px] text-[#18BBE5]">®</sup>
            </span>
            <span className="block text-[7px] tracking-[0.18em] text-[#18BBE5] font-medium uppercase">
              Smart Mobility Platform
            </span>
          </div>
        </div>
        <p className="max-w-sm text-sm text-[#5E6673]">
          Movilidad inteligente. Libertad para crecer.
        </p>
        <div className="flex flex-wrap justify-center gap-5 text-xs">
          <a href={`mailto:${CONTACT.email}`} className="hover:text-white transition-colors">
            {CONTACT.email}
          </a>
          <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Instagram @quierorenting
          </a>
          <Link href="/aviso-legal" className="hover:text-white transition-colors">Aviso legal</Link>
          <Link href="/politica-privacidad" className="hover:text-white transition-colors">Privacidad</Link>
          <Link href="/politica-cookies" className="hover:text-white transition-colors">Cookies</Link>
        </div>
        <p className="text-xs text-[#5E6673]">
          © 2026 MOVILEASE®. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
