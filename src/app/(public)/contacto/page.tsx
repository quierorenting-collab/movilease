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
          {/* Left: intro + contact channels.
              En móvil va DESPUÉS del formulario (order-2): antes había que
              recorrer toda la introducción y los canales antes de ver un campo. */}
          <div className="order-2 lg:order-1">
            <Reveal>
              <p className="section-label">Contacto</p>
              <h1 className="display-lg mt-4 text-white">Hablemos.</h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">
                Cuéntanos qué buscas y te preparamos una propuesta a medida, sin
                compromiso. Respondemos rápido, sin esperas ni llamadas
                comerciales innecesarias.
              </p>
            </Reveal>

            <Reveal delay={0.15} className="mt-12 space-y-4">
              <a
                href={`tel:${CONTACT.phone}`}
                className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.04] p-5 transition-colors hover:border-[#5AA0FF]/50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0068FF]/15">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5AA0FF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span>
                  <span className="eyebrow">Teléfono</span>
                  <span className="mt-1 block text-[15px] font-medium text-white">
                    {CONTACT.phoneDisplay}
                  </span>
                </span>
              </a>

              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.04] p-5 transition-colors hover:border-[#5AA0FF]/50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0068FF]/15">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5AA0FF"
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
                  <span className="eyebrow">
                    Email
                  </span>
                  <span className="mt-1 block text-[15px] font-medium text-white">
                    {CONTACT.email}
                  </span>
                </span>
              </a>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.04] p-5 transition-colors hover:border-[#5AA0FF]/50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0068FF]/15">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5AA0FF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </span>
                <span>
                  <span className="eyebrow">
                    WhatsApp
                  </span>
                  <span className="mt-1 block text-[15px] font-medium text-white">
                    Escríbenos directamente
                  </span>
                </span>
              </a>
            </Reveal>
          </div>

          {/* Right: lead form */}
          <Reveal delay={0.2} className="order-1 lg:order-2">
            <div className="shadow-float rounded-3xl border border-white/12 bg-white/[0.04] p-7 backdrop-blur-xl sm:p-9">
              <h2
                className="text-[22px] font-bold text-white"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Pide tu propuesta
              </h2>
              <p className="mb-7 mt-2 text-[14.5px] leading-relaxed text-white/75">
                Nombre y teléfono es todo lo que necesitamos para empezar.
              </p>
              <LeadForm source="contact_form" />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
