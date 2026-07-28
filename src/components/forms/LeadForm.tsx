"use client";

import { useActionState } from "react";
import { createLeadAction, type CreateLeadResult } from "@/lib/actions/leads";
import { Button } from "@/components/ui/Button";

const initialState: CreateLeadResult = { success: false };

const inputClass =
  "mt-1 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-primary";

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
      <div className="rounded-2xl border border-primary/30 bg-primary/10 p-6 text-center">
        <p className="font-medium text-foreground">¡Gracias! Hemos recibido tu solicitud.</p>
        <p className="mt-1 text-sm text-muted">Te contactaremos en breve.</p>
        {state.whatsappLink && (
          <a
            href={state.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium text-primary underline"
          >
            Continuar la conversación por WhatsApp →
          </a>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
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
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input id="name" name="name" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="phone" className="text-sm font-medium">
          Teléfono
        </label>
        <input id="phone" name="phone" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email (opcional)
        </label>
        <input id="email" name="email" type="email" className={inputClass} />
      </div>
      <div>
        <label htmlFor="message" className="text-sm font-medium">
          Mensaje (opcional)
        </label>
        <textarea id="message" name="message" rows={3} className={inputClass} />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Enviando…" : "Solicitar información"}
      </Button>
    </form>
  );
}
