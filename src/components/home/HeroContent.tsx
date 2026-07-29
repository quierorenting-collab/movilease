"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/constants";

const ease = [0.16, 1, 0.3, 1] as const;

function rise(i: number, distance = 44) {
  return {
    hidden: { opacity: 0, y: distance, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1.1, delay: 0.15 + i * 0.11, ease },
    },
  };
}

const TRUST = [
  { value: "+10.000", label: "clientes" },
  { value: "4,9/5", label: "valoración" },
  { value: "48 h", label: "gestión" },
  { value: "0 €", label: "entrada" },
];

export function HeroContent() {
  return (
    <>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-28 sm:px-10 lg:pb-24">
        <div className="lg:max-w-[48%]">
          {/* Eyebrow */}
          <motion.div
            variants={rise(0, 20)}
            initial="hidden"
            animate="visible"
            className="mb-8 flex items-center gap-4"
          >
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5, ease }}
              className="h-px w-10 origin-left bg-[#0068FF]"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#0068FF]">
              Smart Mobility Platform
            </span>
          </motion.div>

          {/* Headline — massive editorial */}
          <h1 className="hero-headline text-white">
            <span className="block overflow-hidden">
              <motion.span variants={rise(1)} initial="hidden" animate="visible" className="block">
                Estrena coche
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span variants={rise(2)} initial="hidden" animate="visible" className="block">
                sin <span className="text-[#0068FF]">complicaciones.</span>
              </motion.span>
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p
            variants={rise(3, 28)}
            initial="hidden"
            animate="visible"
            className="mt-6 max-w-md text-[15px] leading-[1.7] text-white/50 sm:text-[16px]"
          >
            Renting inteligente para particulares, autónomos y empresas.
            Todo incluido en una cuota fija. Sin entrada. Sin sorpresas.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={rise(4, 28)}
            initial="hidden"
            animate="visible"
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <Link href="/catalogo" className="btn-primary justify-center">
              Explorar catálogo
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 shrink-0">
                <path
                  d="M1 8h13M9 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <a
              href={buildWhatsAppLink(
                "Hola, me gustaría recibir asesoramiento personalizado sobre renting."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost justify-center"
            >
              Hablar por WhatsApp
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={rise(5, 24)}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5 border-t border-white/8 pt-6"
          >
            {TRUST.map((t, i) => (
              <div
                key={t.label}
                className={`flex flex-col gap-1 ${i > 0 ? "sm:border-l sm:border-white/10 sm:pl-10 sm:-ml-10" : ""}`}
              >
                <span
                  className="text-[19px] font-bold leading-none text-white sm:text-[22px]"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {t.value}
                </span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-white/30">
                  {t.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-9 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 xl:flex"
      >
        <span className="text-[8px] uppercase tracking-[0.35em] text-white/25">Scroll</span>
        <div className="relative h-12 w-px overflow-hidden bg-white/10">
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 h-6 bg-gradient-to-b from-transparent via-[#0068FF] to-transparent"
          />
        </div>
      </motion.div>
    </>
  );
}
