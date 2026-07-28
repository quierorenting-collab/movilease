import Link from "next/link";
import { CONTACT } from "@/lib/constants";
import { Logo } from "@/components/ui/Logo";

export async function Footer() {
  return (
    <footer className="border-t border-[#0068FF]/10 bg-[#041020] py-10 text-sm text-[#94b8cc]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:px-6 text-center">
        <Logo height={28} />
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
