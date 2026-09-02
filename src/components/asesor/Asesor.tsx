"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { buildWhatsAppLink, CLIENT_TYPE_LABELS } from "@/lib/constants";

/**
 * Asesor guiado de renting.
 *
 * Vive en su propia página, no en una burbuja flotante: la esquina inferior
 * derecha ya la ocupan el botón de WhatsApp, la barra del comparador y el
 * banner de cookies, y encima está el pop-up de captación, que salta a los
 * cinco segundos. Un cuarto elemento reclamando atención sin que nadie lo haya
 * pedido no ayuda a vender, estorba. Aquí entra quien quiere entrar.
 *
 * No lleva IA a propósito: clasificar el perfil, recomendar por presupuesto y
 * decir qué documentación hace falta son un botón, una consulta y una tabla.
 * Pagar por conversación para responder lo que ya sabemos de antemano no tiene
 * sentido. La capa conversacional se puede añadir encima el día que aporte
 * algo, sin tirar nada de esto.
 *
 * ORDEN DEL RECORRIDO: perfil → contacto → coches. El contacto va delante por
 * decisión expresa de Adrián: quiere que todo el que empiece a hablar con el
 * asesor le llegue como lead, incluido quien abandona a mitad. La contrapartida
 * conocida es que pedir el teléfono antes de enseñar nada reduce cuánta gente
 * empieza, así que se pueden capturar más de los que entran y entrar menos.
 * Si el ritmo de leads baja, mover el paso "contacto" detrás de "coches" es lo
 * primero que hay que probar.
 *
 * El perfil va antes que el contacto por dos razones: es un clic y no es dato
 * personal, y `expedientes.client_type` es NOT NULL, así que sin él no hay
 * expediente que abrir.
 */

type Paso =
  | "inicio"
  | "dudas"
  | "perfil"
  | "presupuesto"
  | "carroceria"
  | "coches"
  | "contacto"
  | "final";

type ClientType = keyof typeof CLIENT_TYPE_LABELS;

interface Sugerencia {
  id: string;
  modelSlug: string;
  titulo: string;
  version: string;
  precio: string;
  imagen: string | null;
}

interface Requisito {
  key: string;
  label: string;
  esperados: number | null;
}

/** Tramos de cuota. El último no lleva tope: "de 600 en adelante". */
const PRESUPUESTOS: { etiqueta: string; max?: number }[] = [
  { etiqueta: "Hasta 300 €", max: 300 },
  { etiqueta: "Entre 300 y 450 €", max: 450 },
  { etiqueta: "Entre 450 y 600 €", max: 600 },
  { etiqueta: "Más de 600 €" },
];

/* Solo carrocerías. El enum `vehicle_category` mezcla carrocería y
   combustible ("hibrido" y "diesel" son categorías ahí), y ofrecerlas juntas
   confunde: el propio catálogo las oculta por la misma razón. */
const CARROCERIAS = [
  { valor: "turismo", etiqueta: "Turismo" },
  { valor: "suv", etiqueta: "SUV" },
  { valor: "furgoneta", etiqueta: "Furgoneta" },
  { valor: "4x4", etiqueta: "4x4" },
];

export function Asesor() {
  const pathname = usePathname();

  const [paso, setPaso] = useState<Paso>("inicio");
  const [cargando, setCargando] = useState(false);

  const [faq, setFaq] = useState<{ q: string; a: string }[]>([]);
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);

  const [clientType, setClientType] = useState<ClientType | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [elegido, setElegido] = useState<Sugerencia | null>(null);

  const [form, setForm] = useState({ nombre: "", telefono: "", email: "" });
  const [rgpd, setRgpd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requisitos, setRequisitos] = useState<Requisito[]>([]);
  const [whatsappFinal, setWhatsappFinal] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    fetch("/api/asesor/faq")
      .then((r) => r.json())
      .then((d) => {
        if (vivo && d?.ok) setFaq(d.faq);
      })
      .catch(() => {
        /* Sin FAQ el asesor sigue sirviendo: se ofrece WhatsApp y ya. */
      });
    return () => {
      vivo = false;
    };
  }, []);

  async function buscarCoches(categoria?: string) {
    setCargando(true);
    setPaso("coches");
    try {
      const res = await fetch("/api/asesor/coches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxPriceEuros: maxPrice, category: categoria }),
      });
      const data = await res.json();
      setSugerencias(data?.ok ? data.sugerencias : []);
    } catch {
      setSugerencias([]);
    } finally {
      setCargando(false);
    }
  }

  /**
   * Anota el coche en el expediente que ya existe. Si la llamada falla, el
   * recorrido sigue igual: el lead está guardado desde el paso del contacto y
   * lo único que se pierde es el dato de qué coche miraba. Bloquear al
   * visitante por eso sería cambiar un dato útil por un cliente.
   */
  async function elegirCoche(s: Sugerencia) {
    setElegido(s);
    setPaso("final");
    if (!token) return;
    try {
      await fetch("/api/asesor/vehiculo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, vehicleId: s.id }),
      });
    } catch {
      /* Ver comentario de arriba. */
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!rgpd || !clientType) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/asesor/expediente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.nombre,
          phone: form.telefono,
          email: form.email,
          clientType,
          // Sin vehicleId: en este punto todavía no ha visto coches. Se anota
          // después, cuando elige, con /api/asesor/vehiculo.
          pageUrl: pathname ?? "",
          rgpd: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "No hemos podido registrar tu solicitud.");
        return;
      }
      setRequisitos(data.requisitos ?? []);
      setWhatsappFinal(data.whatsappLink ?? null);
      if (data.token) {
        setToken(data.token);
        try {
          sessionStorage.setItem("ml_asesor_token", data.token);
        } catch {
          /* Navegación privada: el expediente ya está creado igualmente. */
        }
      }
      // A partir de aquí el lead YA está guardado y notificado. Si el visitante
      // abandona en cualquier paso siguiente, Adrián tiene su teléfono igual.
      setPaso("presupuesto");
    } catch {
      setError("No hemos podido registrar tu solicitud.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-7">
      {/* aria-live: quien use lector de pantalla tiene que enterarse de que el
          panel ha cambiado de paso, porque no hay navegación real entre ellos. */}
      <div aria-live="polite" className="flex flex-col gap-3">
        {paso === "inicio" && (
          <Bloque texto="¿Te echo una mano para encontrar tu renting?">
            <Opcion onClick={() => setPaso("perfil")}>Quiero ver coches</Opcion>
            <Opcion onClick={() => setPaso("dudas")}>Tengo una duda</Opcion>
            <EnlaceWhatsApp texto="Prefiero hablar por WhatsApp" />
          </Bloque>
        )}

        {paso === "dudas" && (
          <Bloque texto="Estas son las preguntas que más nos hacen:">
            {faq.length === 0 && <p className="text-[14px] text-white/50">Cargando…</p>}
            {faq.map((f, i) => (
              <div key={f.q} className="rounded-xl border border-white/10 bg-white/[0.03]">
                <button
                  type="button"
                  onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}
                  aria-expanded={faqAbierta === i}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[14.5px] font-medium text-white"
                >
                  {f.q}
                  <span className="text-white/40">{faqAbierta === i ? "−" : "+"}</span>
                </button>
                {faqAbierta === i && (
                  <p className="px-4 pb-3 text-[14px] leading-relaxed text-white/70">{f.a}</p>
                )}
              </div>
            ))}
            <Opcion onClick={() => setPaso("perfil")}>Resuelto, quiero ver coches</Opcion>
            <EnlaceWhatsApp texto="Mi duda no está aquí" />
          </Bloque>
        )}

        {paso === "perfil" && (
          <Bloque texto="¿El renting es para ti, como autónomo, o para una empresa?">
            {(Object.keys(CLIENT_TYPE_LABELS) as ClientType[]).map((k) => (
              <Opcion
                key={k}
                onClick={() => {
                  setClientType(k);
                  setPaso("contacto");
                }}
              >
                {CLIENT_TYPE_LABELS[k]}
              </Opcion>
            ))}
          </Bloque>
        )}

        {paso === "presupuesto" && (
          <Bloque texto="¿Qué cuota mensual te encaja?">
            {PRESUPUESTOS.map((p) => (
              <Opcion
                key={p.etiqueta}
                onClick={() => {
                  setMaxPrice(p.max);
                  setPaso("carroceria");
                }}
              >
                {p.etiqueta}
              </Opcion>
            ))}
          </Bloque>
        )}

        {paso === "carroceria" && (
          <Bloque texto="¿Qué tipo de coche buscas?">
            {CARROCERIAS.map((c) => (
              <Opcion key={c.valor} onClick={() => void buscarCoches(c.valor)}>
                {c.etiqueta}
              </Opcion>
            ))}
            <Opcion onClick={() => void buscarCoches()}>Me da igual, enséñame opciones</Opcion>
          </Bloque>
        )}

        {paso === "coches" && (
          <Bloque
            texto={
              cargando
                ? "Mirando el catálogo…"
                : sugerencias.length
                  ? "Esto es lo que tenemos disponible ahora mismo:"
                  : "No tenemos nada que encaje justo con eso."
            }
          >
            {sugerencias.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => void elegirCoche(s)}
                className="flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-[#5AA0FF]/40 hover:bg-white/[0.07]"
              >
                {s.imagen ? (
                  <Image
                    src={s.imagen}
                    alt={s.titulo}
                    width={96}
                    height={72}
                    className="h-[72px] w-[96px] shrink-0 rounded-lg object-contain"
                  />
                ) : (
                  <div className="h-[72px] w-[96px] shrink-0 rounded-lg bg-white/5" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-white">{s.titulo}</span>
                  <span className="block truncate text-[12.5px] text-white/50">{s.version}</span>
                  <span className="block text-[15px] font-semibold text-[#5AA0FF]">{s.precio}</span>
                </span>
              </button>
            ))}
            {!cargando && !sugerencias.length && (
              <>
                <Opcion onClick={() => setPaso("presupuesto")}>Probar con otro presupuesto</Opcion>
                <EnlaceWhatsApp texto="Cuéntanos qué buscas por WhatsApp" />
              </>
            )}
          </Bloque>
        )}

        {paso === "contacto" && (
          <form onSubmit={enviar} className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-white/80">
              Déjanos tu nombre y tu teléfono y seguimos: te enseñamos los coches
              que encajan y, si te interesa alguno, te preparamos la oferta.
            </p>
            <input
              required
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="input-glass"
            />
            <input
              required
              type="tel"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="input-glass"
            />
            <input
              type="email"
              placeholder="Email (opcional)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-glass"
            />
            <label className="flex items-start gap-3 text-[13.5px] leading-relaxed text-white/75">
              <input
                type="checkbox"
                required
                checked={rgpd}
                onChange={(e) => setRgpd(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[#0068FF]"
              />
              <span>
                Acepto la{" "}
                <a href="/politica-privacidad" target="_blank" className="underline">
                  política de privacidad
                </a>
              </span>
            </label>
            <div aria-live="polite" aria-atomic="true">
              {error && (
                <p className="rounded-xl border border-red-400/30 bg-red-500/[0.12] px-4 py-3 text-[13.5px] text-red-200">
                  {error}
                </p>
              )}
            </div>
            <button type="submit" disabled={cargando || !rgpd} className="btn-primary btn-block">
              {cargando ? "Enviando…" : "Continuar y ver coches"}
            </button>
          </form>
        )}

        {paso === "final" && (
          <Bloque
            texto={
              elegido
                ? `Anotado el ${elegido.titulo}. Te contactamos en menos de 24 horas.`
                : "Recibido. Te contactamos en menos de 24 horas."
            }
          >
            {requisitos.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-2 text-[14px] font-semibold text-white">
                  Para tramitarlo necesitaremos:
                </p>
                <ul className="space-y-1">
                  {requisitos.map((r) => (
                    <li key={r.key} className="text-[13.5px] leading-relaxed text-white/65">
                      · {r.label}
                      {r.esperados && r.esperados > 1 ? ` (${r.esperados})` : ""}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[12.5px] text-white/40">
                  No hace falta que lo busques ahora: te lo pediremos al hablar contigo.
                </p>
              </div>
            )}
            {whatsappFinal && (
              <a
                href={whatsappFinal}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp btn-block"
              >
                Continuar por WhatsApp
              </a>
            )}
          </Bloque>
        )}
      </div>
    </div>
  );
}

function Bloque({ texto, children }: { texto: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[15px] leading-relaxed text-white/80">{texto}</p>
      {children}
    </div>
  );
}

function Opcion({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-left text-[15px] font-medium text-white transition-colors hover:border-[#5AA0FF]/40 hover:bg-white/[0.08]"
    >
      {children}
    </button>
  );
}

/** La salida a WhatsApp está en todos los pasos, no solo al final: ante
 *  cualquier duda, que el cliente llame o escriba. */
function EnlaceWhatsApp({ texto }: { texto: string }) {
  return (
    <a
      href={buildWhatsAppLink("Hola, estoy mirando el renting en la web y tengo una duda.")}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-3 text-center text-[15px] font-medium text-[#4ade80] transition-colors hover:bg-[#25D366]/20"
    >
      {texto}
    </a>
  );
}
