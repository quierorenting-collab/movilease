"use client";

import { useActionState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createLeadAction, type CreateLeadResult } from "@/lib/actions/leads";
import { CLIENT_TYPE_LABELS } from "@/lib/constants";

const initialState: CreateLeadResult = { success: false };

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2";

export function LeadForm({
  vehicleId,
  modelId,
  source = "contact_form",
}: {
  vehicleId?: string;
  modelId?: string;
  source?: string;
}) {
  const pathname = usePathname();
  const [state, formAction, isPending] = useActionState(createLeadAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-[#0068FF]/20 bg-[#0068FF]/[0.06] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0068FF]/15">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0068FF"
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
        <p className="mt-2 text-sm leading-relaxed text-white/50">
          No tardaremos más de unos minutos en contactar contigo.
        </p>
        {state.whatsappLink && (
          <a
            href={state.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost mt-6 inline-flex"
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Nombre
          </label>
          <input id="name" name="name" required className="input-glass" placeholder="Tu nombre" />
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>
            Apellidos
          </label>
          <input
            id="lastName"
            name="lastName"
            className="input-glass"
            placeholder="Tus apellidos"
          />
        </div>
      </div>
      <div>
        <label htmlFor="company" className={labelClass}>
          Empresa (opcional)
        </label>
        <input
          id="company"
          name="company"
          className="input-glass"
          placeholder="Nombre de tu empresa"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className={labelClass}>
            Teléfono
          </label>
          <input
            id="phone"
            name="phone"
            required
            className="input-glass"
            placeholder="600 000 000"
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email (opcional)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="input-glass"
            placeholder="tu@email.com"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="province" className={labelClass}>
            Provincia
          </label>
          <input
            id="province"
            name="province"
            className="input-glass"
            placeholder="Madrid"
          />
        </div>
        <div>
          <label htmlFor="clientType" className={labelClass}>
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
        <label htmlFor="message" className={labelClass}>
          Mensaje (opcional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="input-glass resize-none"
          placeholder="Cuéntanos qué coche buscas o cualquier duda que tengas"
        />
      </div>

      <label className="flex items-start gap-3 text-[13px] leading-relaxed text-white/50">
        <input
          type="checkbox"
          name="rgpd"
          required
          className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-transparent accent-[#0068FF]"
        />
        <span>
          He leído y acepto la{" "}
          <Link href="/politica-privacidad" className="underline hover:text-white/80">
            política de privacidad
          </Link>{" "}
          de MoviLease.
        </span>
      </label>

      {state.error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full justify-center disabled:opacity-40"
      >
        {isPending ? "Enviando…" : "Solicitar información"}
      </button>
    </form>
  );
}
