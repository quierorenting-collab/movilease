import type { Metadata } from "next";
import { CONTACT, buildWhatsAppLink } from "@/lib/constants";
import { LeadForm } from "@/components/forms/LeadForm";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Ponte en contacto con el equipo para solicitar una oferta de renting.",
};

export default function ContactoPage() {
  const whatsappLink = buildWhatsAppLink(
    "Hola, me gustaría recibir información sobre renting."
  );

  return (
    <div className="surface-black ambient-blue relative min-h-screen pt-32 pb-32">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
          {/* Left: intro + contact channels */}
          <div>
            <Reveal>
              <p className="section-label">Contacto</p>
              <h1 className="display-lg mt-4 text-white">Hablemos.</h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-white/40">
                Cuéntanos qué buscas y te preparamos una propuesta a medida, sin
                compromiso. Respondemos rápido, sin esperas ni llamadas
                comerciales innecesarias.
              </p>
            </Reveal>

            <Reveal delay={0.15} className="mt-12 space-y-4">
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition-colors hover:border-[#0068FF]/30"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0068FF]/10">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0068FF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <path d="m3 6 9 7 9-7" />
                  </svg>
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    Email
                  </span>
                  <span className="mt-1 block text-sm font-medium text-white">
                    {CONTACT.email}
                  </span>
                </span>
              </a>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition-colors hover:border-[#0068FF]/30"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0068FF]/10">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0068FF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    WhatsApp
                  </span>
                  <span className="mt-1 block text-sm font-medium text-white">
                    Escríbenos directamente
                  </span>
                </span>
              </a>
            </Reveal>
          </div>

          {/* Right: lead form */}
          <Reveal delay={0.2}>
            <div className="shadow-float rounded-3xl border border-white/8 bg-white/[0.03] p-9 backdrop-blur-xl">
              <LeadForm source="contact_form" />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
