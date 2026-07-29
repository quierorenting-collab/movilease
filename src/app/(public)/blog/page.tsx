import type { Metadata } from "next";

import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { buildWhatsAppLink } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos sobre renting de coches para particulares.",
};

const SKELETON_CARDS = [0, 1, 2];

export default function BlogPage() {
  return (
    <section className="surface-black relative min-h-[70vh] overflow-hidden pt-32 pb-32">
      <div className="ambient-blue-top" aria-hidden />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <p className="section-label">Blog</p>
          <h1 className="display-lg mt-4 text-white">Historias de movilidad.</h1>
          <p className="mt-5 max-w-xl text-lg text-white/70">
            Guías de renting, comparativas y novedades. Muy pronto.
          </p>
        </Reveal>

        {/* Skeleton editorial cards — placeholder hasta la fase de datos del blog */}
        <RevealGroup
          stagger={0.08}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SKELETON_CARDS.map((i) => (
            <RevealItem key={i}>
              <div className="card-dark overflow-hidden" aria-hidden>
                <div
                  className="aspect-[16/9] w-full bg-gradient-to-br from-[#161616] to-[#0C0C0C]"
                  style={{
                    backgroundImage:
                      "linear-gradient(110deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 60%), linear-gradient(to bottom right, #161616, #0C0C0C)",
                    backgroundSize: "200% 100%, 100% 100%",
                    animation: "shimmer 2.4s linear infinite",
                    animationDelay: `${i * 0.35}s`,
                  }}
                />
                <div className="space-y-3 p-6">
                  <div className="h-4 w-full rounded bg-white/5" />
                  <div className="h-4 w-3/4 rounded bg-white/5" />
                  <div className="mt-5 h-3 w-1/3 rounded bg-white/[0.03]" />
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.2} className="mt-20 text-center">
          <p className="text-white/70">¿Quieres que te avisemos?</p>
          <div className="mt-6">
            <a
              href={buildWhatsAppLink(
                "Hola, quiero que me aviséis cuando publiquéis nuevos artículos en el blog."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Avísame por WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
