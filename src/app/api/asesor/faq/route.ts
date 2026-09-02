import { NextResponse } from "next/server";
import { getConocimiento } from "@/lib/data/asesor";

/**
 * Las respuestas que el asesor puede dar.
 *
 * Salen de `knowledge_entries`, no de una constante en el código, para que
 * Adrián pueda corregir una respuesta desde el panel sin desplegar. Y son
 * exactamente las que la web ya publica en su FAQ: si algo no está aquí, el
 * asesor no se lo inventa, ofrece hablar con una persona.
 */
export const revalidate = 300;

export async function GET() {
  const entradas = await getConocimiento();
  return NextResponse.json({
    ok: true,
    faq: entradas.map((e) => ({ q: e.question, a: e.answer })),
  });
}
