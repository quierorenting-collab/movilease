"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createLeadAction, type CreateLeadResult } from "@/lib/actions/leads";
import { CLIENT_TYPE_LABELS } from "@/lib/constants";

const initialState: CreateLeadResult = { success: false };

export function LeadForm({
  vehicleId,
  modelId,
  source = "contact_form",
  submitLabel = "Solicitar mi oferta sin compromiso",
}: {
  vehicleId?: string;
  modelId?: string;
  source?: string;
  submitLabel?: string;
}) {
  const pathname = usePathname();
  const [state, formAction, isPending] = useActionState(createLeadAction, initialState);
  /**
   * Solo nombre + teléfono a la vista. El resto de campos siguen ahí y se
   * envían igual, pero pedir ocho datos de golpe para un primer contacto
   * espanta: quien quiera detallar, los abre.
   */
  const [showDetails, setShowDetails] = useState(false);

  if (state.success) {
    return (
      <div
        className="rounded-2xl border border-[#0068FF]/20 bg-[#0068FF]/[0.06] p-8 text-center"
        role="status"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0068FF]/15">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5AA0FF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p
          className="mt-5 text-xl font-semibold text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Solicitud recibida
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-white/75">
          No tardaremos más de unos minutos en contactar contigo.
        </p>
        {state.whatsappLink && (
          <a
            href={state.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp mt-6 inline-flex"
          >
            Continuar por WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {vehicleId && <input type="hidden" name="vehicleId" value={vehicleId} />}
      {modelId && <input type="hidden" name="modelId" value={modelId} />}
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="pageUrl" value={pathname ?? ""} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="form-label">
            Nombre <span className="text-[#FFAFAF]">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="given-name"
            className="input-glass"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label htmlFor="phone" className="form-label">
            Teléfono <span className="text-[#FFAFAF]">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            className="input-glass"
            placeholder="600 000 000"
          />
        </div>
      </div>

      {!showDetails && (
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          aria-expanded={false}
          aria-controls="lead-detalles"
          className="flex min-h-[40px] items-center gap-2 text-[13.5px] font-semibold text-[#5AA0FF] transition-colors hover:text-white"
        >
          <span aria-hidden="true" className="text-[17px] leading-none">
            +
          </span>
          Añadir email, provincia u otros datos (opcional)
        </button>
      )}

      <div id="lead-detalles" hidden={!showDetails} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lastName" className="form-label">
              Apellidos
            </label>
            <input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              className="input-glass"
              placeholder="Tus apellidos"
            />
          </div>
          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className="input-glass"
              placeholder="tu@email.com"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="province" className="form-label">
              Provincia
            </label>
            <input
              id="province"
              name="province"
              autoComplete="address-level1"
              className="input-glass"
              placeholder="Madrid"
            />
          </div>
          <div>
            <label htmlFor="clientType" className="form-label">
              Tipo de cliente
            </label>
            <select id="clientType" name="clientType" className="input-glass" defaultValue="">
              <option value="" disabled>
                Selecciona una opción
              </option>
              {Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="company" className="form-label">
            Empresa
          </label>
          <input
            id="company"
            name="company"
            autoComplete="organization"
            className="input-glass"
            placeholder="Nombre de tu empresa"
          />
        </div>
        <div>
          <label htmlFor="message" className="form-label">
            Mensaje
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="input-glass resize-none"
            placeholder="Cuéntanos qué coche buscas o cualquier duda que tengas"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 text-[13.5px] leading-relaxed text-white/75">
        <input
          type="checkbox"
          name="rgpd"
          required
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-white/30 bg-transparent accent-[#0068FF]"
        />
        <span>
          He leído y acepto la{" "}
          <Link
            href="/politica-privacidad"
            className="underline underline-offset-2 hover:text-white"
          >
            política de privacidad
          </Link>{" "}
          de MoviLease.
        </span>
      </label>

      <div aria-live="polite" aria-atomic="true">
        {state.error && (
          <p className="rounded-xl border border-red-400/30 bg-red-500/[0.12] px-4 py-3 text-[14px] text-red-200">
            {state.error}
          </p>
        )}
      </div>

      <button type="submit" disabled={isPending} className="btn-primary btn-lg btn-block">
        {isPending ? "Enviando…" : submitLabel}
      </button>

      {/* Reduce la ansiedad justo donde se decide el envío */}
      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12.5px] text-white/70">
        {["Sin compromiso", "Respuesta en menos de 24 h", "No cedemos tus datos"].map((item) => (
          <li key={item} className="flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3.5 w-3.5 shrink-0">
              <circle cx="8" cy="8" r="8" fill="#5AA0FF" fillOpacity="0.2" />
              <path
                d="M5 8.2l2 2 4-4.4"
                stroke="#8FBEFF"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </form>
  );
}
