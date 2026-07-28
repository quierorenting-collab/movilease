"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/constants";

const ease = [0.25, 0.1, 0.25, 1] as const;

function anim(i: number) {
  return {
    hidden: { opacity: 0, y: 36 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, delay: 0.1 + i * 0.13, ease },
    },
  };
}

export function HeroContent() {
  return (
    <>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-28 sm:px-10 lg:max-w-[55%]">

        {/* Eyebrow */}
        <motion.p
          variants={anim(0)}
          initial="hidden"
          animate="visible"
          className="mb-6 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#0068FF]"
        >
          <span className="h-px w-6 bg-[#0068FF]" />
          Smart Mobility Platform
        </motion.p>

        {/* H1 */}
        <h1
          className="font-bold leading-[1.06] tracking-tight text-white"
          style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(2.4rem, 5.5vw, 4.8rem)" }}
        >
          <motion.span variants={anim(1)} initial="hidden" animate="visible" className="block">
            Estrena coche
          </motion.span>
          <motion.span variants={anim(2)} initial="hidden" animate="visible" className="block">
            sin{" "}
            <span className="text-[#0068FF]">complicaciones.</span>
          </motion.span>
        </h1>

        {/* Subtitle */}
        <motion.p
          variants={anim(3)}
          initial="hidden"
          animate="visible"
          className="mt-7 max-w-sm text-[15px] leading-relaxed text-white/55"
        >
          Renting inteligente para particulares, autónomos y empresas.
          Encuentra tu próximo vehículo con las mejores condiciones del mercado.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={anim(4)}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/#ofertas"
            className="group relative overflow-hidden bg-[#0068FF] px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:brightness-110 sm:w-auto w-full text-center"
          >
            Ver ofertas
          </Link>
          <a
            href={buildWhatsAppLink("Hola, me gustaría recibir asesoramiento personalizado sobre renting de coches.")}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/30 px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:border-white hover:bg-white/8 sm:w-auto w-full text-center"
          >
            Solicitar asesoramiento
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] uppercase tracking-[0.25em] text-white/25">Scroll</span>
        <motion.div
          initial={{ scaleY: 0, originY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 1.8, duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          className="h-10 w-px bg-gradient-to-b from-white/30 to-transparent"
        />
      </motion.div>
    </>
  );
}
