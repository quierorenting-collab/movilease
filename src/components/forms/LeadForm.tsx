"use client";

import { useActionState } from "react";
import { createLeadAction, type CreateLeadResult } from "@/lib/actions/leads";

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
          Gracias por confiar en nosotros. Te contactaremos en breve para darte
          una respuesta personalizada.
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
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="name" className={labelClass}>
          Nombre
        </label>
        <input id="name" name="name" required className="input-glass" placeholder="Tu nombre" />
      </div>
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
