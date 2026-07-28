import { NextResponse } from "next/server";
import { createLead } from "@/lib/actions/leads";

/**
 * Wrapper JSON sobre la misma lógica que la Server Action `createLead`,
 * para integraciones que no puedan usar Server Actions directamente.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 });
  }

  const formData = new FormData();
  Object.entries(body as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.set(key, String(value));
  });

  const result = await createLead(formData);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
