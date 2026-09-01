import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ClientTypeEnum,
  Conversation,
  DocPeriodRuleEnum,
  DocumentRequirement,
  Expediente,
  ExpedienteDocument,
  KnowledgeEntry,
  MessageRoleEnum,
} from "@/types/database.types";

/**
 * Capa de datos del asesor IA.
 *
 * Usa el cliente admin y no el público como el resto de `src/lib/data/`: el
 * cliente del chat es anónimo y la migración 0005 no concede a `anon` ni un
 * permiso de lectura sobre estas tablas. Todo pasa por rutas de servidor que
 * ya han verificado el token de sesión. Ver la cabecera de 0005_asesor_ia.sql.
 *
 * Se mantiene la regla de la casa: **esta capa nunca lanza**. Si Supabase no
 * responde, devuelve [] o null y quien llama degrada. Un chat que se cae
 * entero porque falló una consulta es peor que un chat que dice que no puede
 * comprobar algo ahora mismo.
 */

/* ------------------------------------------------------------------ */
/* Periodo fiscal                                                      */
/* ------------------------------------------------------------------ */

export interface PeriodoResuelto {
  /** Texto listo para enseñar al cliente: "ejercicio 2025". Null si no aplica. */
  etiqueta: string | null;
  /** Cuántos archivos se esperan cuando la regla lo determina. */
  cantidad: number | null;
}

/**
 * Traduce una regla de periodo al ejercicio concreto que toca hoy.
 *
 * Existe para que las listas documentales no vuelvan a caducar. Las plantillas
 * originales decían "renta 23/24" y en septiembre de 2026 seguían pidiendo un
 * ejercicio de hace dos años. Aquí no hay año escrito: se calcula.
 *
 * Los tres plazos de presentación son distintos y por eso hay tres reglas:
 *   - Renta: campaña de abril a junio. Hasta julio, la última presentada es
 *     la del antepenúltimo ejercicio.
 *   - Modelo 390 (resumen anual de IVA): se presenta en enero.
 *   - Modelo 200 (Sociedades): seis meses y 25 días tras el cierre, que para
 *     un ejercicio natural es julio.
 */
export function resolverPeriodo(regla: DocPeriodRuleEnum, hoy: Date = new Date()): PeriodoResuelto {
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth() + 1;

  switch (regla) {
    case "ultima_renta_presentada":
      return { etiqueta: `ejercicio ${mes >= 7 ? anio - 1 : anio - 2}`, cantidad: null };

    case "ultimo_iva_anual":
      return { etiqueta: `ejercicio ${mes >= 2 ? anio - 1 : anio - 2}`, cantidad: null };

    case "ultimo_impuesto_sociedades":
      return { etiqueta: `ejercicio ${mes >= 8 ? anio - 1 : anio - 2}`, cantidad: null };

    case "trimestres_ano_en_curso": {
      // Plazos de presentación: 1T en abril, 2T en julio, 3T en octubre.
      // El 4T se presenta en enero del año siguiente, así que nunca cuenta
      // como "del año en curso".
      const presentados = mes >= 10 ? 3 : mes >= 7 ? 2 : mes >= 4 ? 1 : 0;
      if (presentados === 0) {
        // De enero a marzo todavía no hay ningún trimestre del año en curso.
        // No se inventa aquí qué pedir en su lugar: es una decisión de negocio
        // que hay que confirmar con Adrián antes de ponerla en boca de la IA.
        return { etiqueta: null, cantidad: 0 };
      }
      return { etiqueta: `${presentados} trimestre${presentados > 1 ? "s" : ""} de ${anio}`, cantidad: presentados };
    }

    case "ninguna":
    default:
      return { etiqueta: null, cantidad: null };
  }
}

/* ------------------------------------------------------------------ */
/* Requisitos documentales                                             */
/* ------------------------------------------------------------------ */

export interface RequisitoResuelto {
  key: string;
  /** Etiqueta con el periodo ya incorporado: "Modelo 390 (ejercicio 2025)". */
  label: string;
  helpText: string | null;
  /** Archivos esperados. Null cuando es variable y no lo fija el periodo. */
  expectedCount: number | null;
  sortOrder: number;
}

/**
 * Los documentos que toca pedir a un perfil, con el periodo ya resuelto.
 *
 * Es lo que consumirá la herramienta `documentacion_requerida` de la IA. La
 * lista sale de la base de datos y es editable desde el panel: la IA no lleva
 * ninguna lista escrita en su prompt, precisamente para que cambiarla no
 * exija tocar código ni volver a desplegar.
 */
export async function getRequisitos(
  clientType: ClientTypeEnum,
  hoy: Date = new Date()
): Promise<RequisitoResuelto[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("document_requirements")
      .select("*")
      .eq("client_type", clientType)
      .eq("is_active", true)
      .order("sort_order");

    if (error || !data) return [];

    return (data as DocumentRequirement[]).map((r) => {
      const periodo = resolverPeriodo(r.period_rule, hoy);
      return {
        key: r.key,
        label: periodo.etiqueta ? `${r.label} — ${periodo.etiqueta}` : r.label,
        helpText: r.help_text,
        // El periodo manda sobre expected_count cuando lo determina: los
        // trimestres de IVA son uno en abril y tres en octubre, y la fila de
        // la tabla no puede saberlo.
        expectedCount: periodo.cantidad ?? r.expected_count,
        sortOrder: r.sort_order,
      };
    });
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Conversación                                                        */
/* ------------------------------------------------------------------ */

export async function crearConversacion(sessionTokenHash: string): Promise<Conversation | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("conversations")
      .insert({ session_token_hash: sessionTokenHash })
      .select()
      .single();
    return error ? null : (data as Conversation);
  } catch {
    return null;
  }
}

export async function getConversacion(sessionTokenHash: string): Promise<Conversation | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("session_token_hash", sessionTokenHash)
      .maybeSingle();
    return error ? null : (data as Conversation | null);
  } catch {
    return null;
  }
}

export async function guardarMensaje(
  conversationId: string,
  role: MessageRoleEnum,
  content: string,
  toolCalls?: Record<string, unknown>[]
): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      role,
      content,
      tool_calls: toolCalls ?? null,
    });
    if (error) return false;

    // El contador y la última actividad se actualizan aparte porque PostgREST
    // no expone `column = column + 1`. Se lee y se escribe: con un solo
    // proceso escribiendo por conversación no hay carrera posible.
    const { data: conv } = await supabase
      .from("conversations")
      .select("message_count")
      .eq("id", conversationId)
      .single();

    await supabase
      .from("conversations")
      .update({
        message_count: ((conv as { message_count: number } | null)?.message_count ?? 0) + 1,
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Expediente                                                          */
/* ------------------------------------------------------------------ */

export async function getExpedientePorConversacion(
  conversationId: string
): Promise<Expediente | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("expedientes")
      .select("*")
      .eq("conversation_id", conversationId)
      .maybeSingle();
    return error ? null : (data as Expediente | null);
  } catch {
    return null;
  }
}

export interface EstadoDocumental {
  requisito: RequisitoResuelto;
  recibidos: number;
  completo: boolean;
}

/**
 * Qué tiene y qué le falta a un expediente, requisito por requisito.
 *
 * Es lo que permite que la IA diga "te falta una nómina" en lugar de dar el
 * requisito por cumplido con el primer archivo. Cuenta archivos por requisito
 * y los compara con los esperados; cuando el número es variable —trimestres de
 * IVA, varios apoderados— basta con que haya al menos uno, porque cuántos
 * hacen falta solo lo sabe el cliente.
 */
export async function getEstadoDocumental(
  expedienteId: string,
  clientType: ClientTypeEnum,
  hoy: Date = new Date()
): Promise<EstadoDocumental[]> {
  try {
    const [requisitos, documentos] = await Promise.all([
      getRequisitos(clientType, hoy),
      getDocumentos(expedienteId),
    ]);

    return requisitos.map((requisito) => {
      const recibidos = documentos.filter(
        (d) => d.requirement_key === requisito.key && d.status !== "rechazado"
      ).length;
      const esperados = requisito.expectedCount;
      return {
        requisito,
        recibidos,
        completo: esperados === null ? recibidos > 0 : recibidos >= esperados,
      };
    });
  } catch {
    return [];
  }
}

export async function getDocumentos(expedienteId: string): Promise<ExpedienteDocument[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("expediente_id", expedienteId)
      .order("uploaded_at");
    return error || !data ? [] : (data as ExpedienteDocument[]);
  } catch {
    return [];
  }
}

/**
 * Expedientes empezados que llevan parados más de las horas indicadas y a los
 * que todavía no se ha avisado.
 *
 * El cliente que sube seis de nueve documentos y se atasca es el lead más
 * caliente que hay —ya eligió coche y ya está enseñando el DNI— y sin esto
 * moriría en silencio en la base de datos.
 */
export async function getExpedientesParados(horas = 48): Promise<Expediente[]> {
  try {
    const supabase = createAdminClient();
    const limite = new Date(Date.now() - horas * 3600 * 1000).toISOString();
    const { data, error } = await supabase
      .from("expedientes")
      .select("*")
      .eq("doc_status", "incompleta")
      .is("stalled_notified_at", null)
      .lt("updated_at", limite);
    return error || !data ? [] : (data as Expediente[]);
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Base de conocimientos                                               */
/* ------------------------------------------------------------------ */

export async function getConocimiento(): Promise<KnowledgeEntry[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("knowledge_entries")
      .select("*")
      .eq("is_active", true)
      .order("category")
      .order("sort_order");
    return error || !data ? [] : (data as KnowledgeEntry[]);
  } catch {
    return [];
  }
}
