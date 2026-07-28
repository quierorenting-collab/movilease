import Link from "next/link";
import { CONTACT, buildWhatsAppLink } from "@/lib/constants";
import { Logo } from "@/components/ui/Logo";

export async function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#050505] text-white/40">
      {/* Top accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#0068FF]/25 to-transparent" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[800px] -translate-x-1/2"
        style={{
          background: "radial-gradient(ellipse, rgba(0,104,255,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-24 sm:px-10">
        {/* Newsletter row */}
        <div className="mb-20 flex flex-col items-start justify-between gap-10 border-b border-white/5 pb-20 lg:flex-row lg:items-end">
          <div className="max-w-md">
            <p
              className="text-[26px] font-bold leading-tight text-white sm:text-[32px]"
              style={{ fontFamily: "var(--font-space-grotesk)", letterSpacing: "-0.02em" }}
            >
              Movilidad inteligente.
              <br />
              <span className="text-white/35">Libertad para moverse.</span>
            </p>
          </div>
          <a
            href={buildWhatsAppLink("Hola, quiero recibir las mejores ofertas de renting.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Recibir ofertas por WhatsApp
          </a>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 gap-12 sm:grid-cols-4 lg:gap-16">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-6 sm:col-span-1">
            <Logo height={38} />
            <p className="max-w-[220px] text-[13px] leading-[1.7] text-white/25">
              Renting de vehículos para particulares, autónomos y empresas en toda España.
            </p>
            <div className="flex gap-3">
              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 text-white/25 transition-all duration-300 hover:border-[#0068FF]/50 hover:text-[#0068FF]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <a
                href={`https://wa.me/${CONTACT.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 text-white/25 transition-all duration-300 hover:border-[#0068FF]/50 hover:text-[#0068FF]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.28em] text-white/20">
              Plataforma
            </p>
            <ul className="flex flex-col gap-3.5">
              {[
                { label: "Catálogo", href: "/catalogo" },
                { label: "Calculadora", href: "/calculadora" },
                { label: "Comparador", href: "/comparador" },
                { label: "Blog", href: "/blog" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-white/35 transition-colors duration-300 hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.28em] text-white/20">
              Empresa
            </p>
            <ul className="flex flex-col gap-3.5">
              {[
                { label: "Sobre nosotros", href: "/sobre-nosotros" },
                { label: "Cómo funciona", href: "/#por-que" },
                { label: "Ofertas", href: "/#ofertas" },
                { label: "FAQ", href: "/#faq" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-white/35 transition-colors duration-300 hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto + Legal */}
          <div>
            <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.28em] text-white/20">
              Contacto
            </p>
            <ul className="flex flex-col gap-3.5">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-[13px] text-white/35 transition-colors duration-300 hover:text-white"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={buildWhatsAppLink("Hola, me gustaría más información.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-white/35 transition-colors duration-300 hover:text-white"
                >
                  WhatsApp
                </a>
              </li>
            </ul>

            <p className="mb-4 mt-9 text-[9px] font-bold uppercase tracking-[0.28em] text-white/20">
              Legal
            </p>
            <ul className="flex flex-col gap-3.5">
              {[
                { label: "Aviso legal", href: "/aviso-legal" },
                { label: "Privacidad", href: "/politica-privacidad" },
                { label: "Cookies", href: "/politica-cookies" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-white/35 transition-colors duration-300 hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-9 sm:flex-row">
          <p className="text-[11px] text-white/15">
            © 2026 MOVILEASE®. Todos los derechos reservados.
          </p>
          <p className="text-[9px] uppercase tracking-[0.25em] text-white/10">
            Smart Mobility Platform · España
          </p>
        </div>
      </div>
    </footer>
  );
}
