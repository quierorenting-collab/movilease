"use client";

import { motion } from "framer-motion";

import { BotonAsesor } from "@/components/asesor/BotonAsesor";
import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/constants";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Secuencia de entrada del hero. El contenido arranca en 0.45s: después de
 * que el vídeo haya empezado su fade (1.4s) y del header (0.05s), para que
 * nada compita por la atención al mismo tiempo. Cada peldaño entra 200ms
 * después del anterior — el ritmo de keynote, no el de una animación web.
 */
const STEP = 0.12;
const BASE_DELAY = 0.45;

/**
 * Sin `filter: blur()`: no es transform ni opacity, así que obliga a rasterizar
 * la capa de nuevo en cada fotograma, seis elementos a la vez, y uno de ellos
 * es el h1 —el LCP de la portada— justo mientras el vídeo arranca su fundido.
 * Con 44 px de desplazamiento el desenfoque no se echa en falta.
 *
 * Y el escalonado se acorta: con STEP 0,2 y 1,1 s de duración el último bloque
 * no terminaba hasta 2,55 s y el CTA principal no estaba a plena opacidad
 * hasta pasado el segundo y medio. Ahora cierra en 1,95 s conservando el ritmo
 * de keynote.
 */
function rise(i: number, distance = 44) {
  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, delay: BASE_DELAY + i * STEP, ease },
    },
  };
}

/**
 * Beneficios, no cifras: las cifras (+10.000 clientes, 4,9/5, 48 h) ya salen
 * en la banda de stats justo debajo, y repetirlas aquí no añadía información.
 * Aquí interesa responder "¿qué me llevo por esa cuota?" junto al CTA.
 */
const TRUST = [
  { value: "0 €", label: "de entrada" },
  { value: "Seguro", label: "a todo riesgo incluido" },
  { value: "Mantenimiento", label: "e ITV incluidos" },
  { value: "48 h", label: "y tienes respuesta" },
];

export function HeroContent() {
  return (
    <div /* En movil el bloque arranca al 40% del alto para dejar limpia la
         mitad de arriba: es donde el video se ve por fin, y el texto cae
         sobre la parte densa del degradado. Se fija con vh y con
         items-start en la seccion —no con items-end— porque este bloque
         tiene su propio pt-28 y pb-20, y con alineacion al final los tres
         paddings se peleaban y el titular acababa mas arriba que antes,
         encima de la cabecera.

         El tope lo marcan los dos botones flotantes, no el gusto: ocupan de
         664px para abajo en un movil de 812, asi que el ultimo CTA del hero
         tiene que terminar antes de ahi. Con 40vh caia al 91% y quedaba
         debajo; con 22vh termina en 650 y deja 14px de aire. Arriba quedan
         227px de video limpio, que antes eran cero.
         Escritorio intacto. */
      className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 pt-[22vh] sm:px-10 lg:pb-24 lg:pt-28">
      <div className="lg:max-w-[52%]">
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
            transition={{ duration: 1.1, delay: BASE_DELAY + 0.35, ease }}
            className="h-px w-10 origin-left bg-[#0068FF]"
          />
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#5AA0FF]">
            Smart Mobility Platform
          </span>
        </motion.div>

        {/* Headline — massive editorial. El slogan de marca, aquí en
            grande, en vez de como texto pequeño junto al logo del header. */}
        <h1 className="hero-headline text-white">
          <span className="block overflow-hidden">
            <motion.span variants={rise(1)} initial="hidden" animate="visible" className="block">
              Hazlo fácil.
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span variants={rise(2)} initial="hidden" animate="visible" className="block">
              Hazlo <span className="text-[#0068FF]">MoviLease.</span>
            </motion.span>
          </span>
        </h1>

        {/* Subtitle */}
        <motion.p
          variants={rise(3, 28)}
          initial="hidden"
          animate="visible"
          className="mt-6 max-w-lg text-[16px] leading-[1.7] text-white/80 sm:text-[17px]"
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
            className="btn-whatsapp justify-center"
          >
            Hablar por WhatsApp
          </a>
          {/* Tercera salida del hero, y por eso WhatsApp pasa aqui a verde:
              con tres botones, dos en .btn-ghost habrian quedado como dos
              cajas gemelas y nada indicaria que una abre un chat de WhatsApp y
              otra el asesor. Es el mismo criterio que ya se aplico en el panel
              de precio de la ficha. El verde ademas no es ajeno a esta pagina:
              el cierre de la home ya lo usa.

              Abre la ventana sin salir de la home. */}
          <BotonAsesor className="btn-ghost justify-center">
            Habla con el asesor
          </BotonAsesor>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          variants={rise(5, 24)}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/15 pt-7"
        >
          {TRUST.map((t) => (
            <span key={t.label} className="flex items-baseline gap-2 text-[14px] sm:text-[15px]">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 translate-y-[2px]"
              >
                <circle cx="8" cy="8" r="8" fill="#5AA0FF" fillOpacity="0.22" />
                <path
                  d="M5 8.2l2 2 4-4.4"
                  stroke="#8FBEFF"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className="font-bold text-white"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {t.value}
              </span>
              <span className="text-white/70">{t.label}</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
