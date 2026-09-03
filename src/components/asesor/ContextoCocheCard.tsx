"use client";

import { useMemo, useState } from "react";

import { CONTACT, buildWhatsAppLink } from "@/lib/constants";
import type { ContextoCoche } from "./abrirAsesor";

/**
 * Lo que ve quien abre la ventana desde un coche concreto.
 *
 * DOS DECISIONES DE DISENO, LAS DOS POR EL MISMO MOTIVO: no saturar.
 *
 * 1. No se listan las diez o veinte combinaciones de golpe. Se enseñan las
 *    TRES mas cercanas a la cuota anunciada del coche, que es la que el
 *    visitante acaba de ver en grande y con la que ha entrado. El resto vive
 *    detras de un selector.
 *
 * 2. El selector es de km y meses, no una lista. Elegir "20.000 km" y
 *    "48 meses" es como piensa el cliente; leerse una tabla de veinte filas no.
 *
 * REGLA QUE NO SE PUEDE ROMPER: aqui no se calcula, no se estima y no se
 * interpola NINGUN precio. Solo se busca la fila exacta en lo que la ficha ya
 * publica. Si esa combinacion no existe, se dice y se ofrece preguntarla, que
 * es lo unico honesto: inventar una cuota es anunciar un precio que la empresa
 * no tiene por que poder cumplir.
 */
export function ContextoCocheCard({ coche }: { coche: ContextoCoche }) {
  const cuotas = useMemo(() => coche.cuotas ?? [], [coche.cuotas]);
  const servicios = coche.serviciosIncluidos ?? [];

  const [personalizando, setPersonalizando] = useState(false);
  const [km, setKm] = useState<number | undefined>(coche.kmAnuales);
  const [meses, setMeses] = useState<number | undefined>(coche.meses);

  const kmDisponibles = useMemo(
    () => [...new Set(cuotas.map((c) => c.km))].sort((a, b) => a - b),
    [cuotas]
  );
  const mesesDisponibles = useMemo(
    () => [...new Set(cuotas.map((c) => c.meses))].sort((a, b) => a - b),
    [cuotas]
  );

  /* Las tres mas cercanas a la cuota anunciada, por distancia absoluta de
     precio. Se ordenan luego por importe para que se lean de menor a mayor. */
  const destacadas = useMemo(() => {
    if (!cuotas.length) return [];
    const referencia =
      coche.desdeCents ?? Math.min(...cuotas.map((c) => c.precioCents ?? Infinity));
    return [...cuotas]
      .sort(
        (a, b) =>
          Math.abs((a.precioCents ?? 0) - referencia) -
          Math.abs((b.precioCents ?? 0) - referencia)
      )
      .slice(0, 3)
      .sort((a, b) => (a.precioCents ?? 0) - (b.precioCents ?? 0));
  }, [cuotas, coche.desdeCents]);

  const elegida =
    km !== undefined && meses !== undefined
      ? cuotas.find((c) => c.km === km && c.meses === meses)
      : undefined;

  const mensajeWhatsApp = buildWhatsAppLink(
    `Hola, estoy viendo el ${coche.nombre}` +
      (km !== undefined ? `, hago unos ${km.toLocaleString("es-ES")} km al año` : "") +
      (meses !== undefined ? ` y quiero ${meses} meses` : "") +
      (elegida ? ` (cuota publicada ${elegida.precio}/mes)` : "") +
      ". ¿Me podéis pasar oferta?"
  );

  return (
    <div className="mb-3 rounded-xl border border-[#5AA0FF]/25 bg-[#5AA0FF]/10">
      <div className="px-3.5 pt-3">
        <p className="text-[13px] leading-relaxed text-white/85">
          Estás viendo el <span className="font-semibold text-white">{coche.nombre}</span>
          {coche.desde && (
            <>
              , desde <span className="font-semibold text-white">{coche.desde}/mes</span>
            </>
          )}
          .
        </p>
      </div>

      {destacadas.length > 0 && !personalizando && (
        <div className="px-3.5 pb-3 pt-2.5">
          <ul className="flex flex-col gap-1.5">
            {destacadas.map((c) => (
              <li
                key={`${c.meses}-${c.km}`}
                className="flex items-baseline justify-between gap-3 text-[12.5px]"
              >
                <span className="text-white/70">
                  {c.meses} meses · {c.km.toLocaleString("es-ES")} km/año
                </span>
                <span className="shrink-0 font-semibold text-white">{c.precio}/mes</span>
              </li>
            ))}
          </ul>
          {cuotas.length > destacadas.length && (
            <button
              type="button"
              onClick={() => setPersonalizando(true)}
              className="mt-2.5 text-[12.5px] font-medium text-[#8FC0FF] transition-colors duration-200 hover:text-white"
            >
              Ver más opciones · elegir km y duración
            </button>
          )}
        </div>
      )}

      {personalizando && (
        <div className="px-3.5 pb-3 pt-2.5">
          <Selector
            titulo="Kilómetros al año"
            opciones={kmDisponibles}
            valor={km}
            onChange={setKm}
            formato={(v) => v.toLocaleString("es-ES")}
          />
          <Selector
            titulo="Duración"
            opciones={mesesDisponibles}
            valor={meses}
            onChange={setMeses}
            formato={(v) => `${v} meses`}
          />

          <div className="mt-3 rounded-lg border border-white/12 bg-white/[0.05] px-3 py-2.5 text-center">
            {elegida ? (
              <>
                <p className="text-[19px] font-semibold text-white">{elegida.precio}/mes</p>
                <p className="mt-0.5 text-[11.5px] text-white/60">
                  {elegida.meses} meses · {elegida.km.toLocaleString("es-ES")} km/año · IVA
                  incluido
                </p>
              </>
            ) : (
              /* Ni se interpola ni se aproxima: si esa combinacion no esta
                 publicada, no existe una cuota que se pueda dar. */
              <p className="text-[12.5px] leading-relaxed text-white/75">
                Esa combinación no está publicada para este coche. Dinos la que
                necesitas y te la conseguimos.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setPersonalizando(false)}
            className="mt-2.5 text-[12.5px] font-medium text-[#8FC0FF] transition-colors duration-200 hover:text-white"
          >
            Volver a las cuotas destacadas
          </button>
        </div>
      )}

      <div className="border-t border-[#5AA0FF]/20 px-3.5 py-3">
        {servicios.length > 0 && (
          <p className="mb-2.5 text-[11.5px] leading-relaxed text-white/60">
            <span className="text-white/80">Incluye:</span> {servicios.join(" · ")}.
          </p>
        )}
        {/* El mensaje llega al asesor con el coche, los km y el plazo ya
            escritos. Es la diferencia entre "hola, información" y una consulta
            que se puede atender en un minuto. */}
        <div className="flex flex-col gap-2">
          <a
            href={mensajeWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#25D366] px-3 py-2 text-center text-[12.5px] font-semibold text-[#04240F] transition-colors duration-200 hover:bg-[#1DA851] hover:text-white"
          >
            Pedir oferta por WhatsApp
          </a>
          <a
            href={`tel:${CONTACT.phone}`}
            className="rounded-lg border border-white/15 px-3 py-2 text-center text-[12.5px] font-medium text-white/85 transition-colors duration-200 hover:bg-white/5"
          >
            Prefiero que me llaméis
          </a>
        </div>
      </div>
    </div>
  );
}

function Selector({
  titulo,
  opciones,
  valor,
  onChange,
  formato,
}: {
  titulo: string;
  opciones: number[];
  valor: number | undefined;
  onChange: (v: number) => void;
  formato: (v: number) => string;
}) {
  if (opciones.length === 0) return null;
  return (
    <div className="mb-2.5">
      <p className="mb-1.5 text-[11.5px] font-medium uppercase tracking-[0.08em] text-white/50">
        {titulo}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {opciones.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={valor === o}
            className={
              valor === o
                ? "rounded-lg bg-[#0068FF] px-2.5 py-1.5 text-[12px] font-semibold text-white"
                : "rounded-lg border border-white/15 px-2.5 py-1.5 text-[12px] text-white/80 transition-colors duration-200 hover:bg-white/10"
            }
          >
            {formato(o)}
          </button>
        ))}
      </div>
    </div>
  );
}
