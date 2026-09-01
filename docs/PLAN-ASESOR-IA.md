# PLAN DE IMPLEMENTACIÓN — ASESOR IA DE RENTING

> Pasos 6 a 10 del proceso acordado. **Nada de esto está construido todavía.**
> Documento para aprobar antes de tocar código.
>
> Fecha: 02/09/2026. Decisiones cerradas con Adrián en `project_movilease_asesor_ia`
> y listas documentales en `DOCUMENTACION-POR-PERFIL.md`.

---

## PASO 6 — TECNOLOGÍAS

| Pieza | Elección | Por qué |
|---|---|---|
| Modelo | Claude con **tool use** | Es el mecanismo que hace estructuralmente imposible inventar un precio. Ver abajo. |
| SDK | `@anthropic-ai/sdk` en servidor | Una dependencia. El repo tiene 8 y esa sobriedad es una virtud, no un descuido. |
| Streaming | `ReadableStream` nativo de Next | Evita meter un framework de chat entero para hacer lo que la plataforma ya hace. |
| Archivos | **Supabase Storage**, bucket privado | Ya usáis Supabase. Cero piezas nuevas de infraestructura. |
| Validación | **zod** | Ya es dependencia. Valida también los argumentos de las herramientas. |
| Base vectorial | **Ninguna** | Ver abajo. |

### Por qué herramientas y no RAG

Con RAG, la IA lee prosa sobre coches y puede parafrasear mal una cuota. Con
herramientas, **la IA no puede pronunciar un precio que no le hayan entregado**:
llama a `buscar_vehiculos`, recibe filas de la base de datos y repite lo que
recibe. La regla "nunca inventes precios ni disponibilidad" deja de depender
del buen comportamiento del modelo y pasa a ser una imposibilidad de diseño.

Efecto secundario valioso: el catálogo se lee en vivo. Cambias un coche en la
base de datos y la IA ya lo sabe. No hay nada que reindexar.

La base de conocimientos —FAQ, condiciones, las tres listas documentales— cabe
de sobra en el contexto y se cachea entre conversaciones. Una base vectorial
aquí sería infraestructura para un problema que no tenemos.

### Control de coste

1. **Tope de mensajes por conversación.** Superado, la IA deriva a WhatsApp,
   que es además lo que Adrián quiere que pase con las dudas complejas.
2. **Tope de gasto mensual.** Alcanzado, el widget se apaga solo y la web
   muestra el formulario de siempre. Nunca una factura sorpresa.
3. **Caché del prompt de sistema**, que es la parte grande y constante.

---

## PASO 7 — BASE DE DATOS

Seis tablas nuevas. Ninguna existente se modifica salvo `leads`, que gana una
columna opcional.

### `conversations`
La sesión de chat. `id`, `session_token_hash`, `client_type`, `status`,
`lead_id`, `vehicle_id`, `created_at`, `last_activity_at`, `stalled_notified_at`.

### `messages`
`id`, `conversation_id`, `role`, `content`, `tool_calls` (jsonb), `created_at`.

### `expedientes`
El caso comercial. `id`, `conversation_id`, `lead_id`, `client_type`,
`vehicle_id`, `doc_status`, `commercial_status`, `assigned_to`, `notes`,
`created_at`, `completed_at`.

### `document_requirements`
**La base de conocimientos documental, editable desde el panel sin tocar código.**
`client_type`, `key`, `label`, `help_text`, `expected_count`, `period_rule`,
`sort_order`, `is_active`.

`period_rule` es lo que impide que esto vuelva a caducar: guarda
`ultima_renta_presentada` o `trimestres_año_en_curso` y el sistema resuelve el
ejercicio según la fecha, en vez de un "23/24" escrito a mano que envejece.

### `documents`
`id`, `expediente_id`, `requirement_key`, `storage_path`, `original_name`,
`mime_type`, `size_bytes`, `status`, `uploaded_at`, `reviewed_by`, `reviewed_at`,
`review_notes`.

### `knowledge_entries`
FAQ y condiciones que la IA consulta. `category`, `question`, `answer`,
`is_active`, `sort_order`.

### Decisión de seguridad: el navegador nunca habla con Supabase

El cliente es anónimo. En lugar de inventar identidades para que RLS las
gobierne, **todas las escrituras del cliente pasan por rutas de servidor** que
verifican el token de sesión y usan el cliente admin. El navegador no tiene
credenciales de base de datos para nada de esto.

Consecuencia: RLS gobierna únicamente el acceso del panel, que es donde hay
usuarios reales con rol. Menos superficie, menos que pueda salir mal.

### Almacenamiento

Bucket **privado** `expedientes`, ruta `{expediente_id}/{requirement_key}/{uuid}.{ext}`.
Ningún documento tendrá jamás URL pública. La descarga es por URL firmada de
caducidad corta, generada solo para administradores autenticados.

**Validación de subida** en el servidor: tipo MIME, tamaño y **bytes de
cabecera**. La extensión no se comprueba nunca, porque se falsifica en dos
segundos y es el vector clásico para colar un ejecutable.

---

## PASO 8 — FLUJOS CONVERSACIONALES

```
1. DUDAS          La IA responde con la base de conocimientos.
                  Si no lo sabe, lo dice y ofrece WhatsApp.
        ↓
2. PERFIL         Descubre si es particular, autónomo o empresa.
                  De forma natural, no con un formulario disfrazado.
        ↓
3. RECOMENDACIÓN  Consulta el catálogo real. Nunca inventa coche ni precio.
        ↓
4. COCHE ELEGIDO  ← aquí, y no antes, se desbloquea la documentación
        ↓
5. CONTACTO       Nombre, teléfono, email.  →  AVISO 1 (Telegram + correo)
        ↓
6. DOCUMENTACIÓN  Lista según perfil. Todos obligatorios.
                  Sube por el chat; la IA nombra lo que falta.
        ↓
7. COMPLETO       →  AVISO 2 (Telegram + correo)
        ↓
8. PARADO 48 H    →  AVISO 3, con lo que falta, para dar un toque
```

Derivación a WhatsApp o teléfono **disponible en cualquier punto**, no solo al
final.

### Lo que la IA nunca hace

- Decir que alguien cualifica o no cualifica. **Todo el mundo sube la
  documentación.** Ante "¿me lo aprobarán?": lo estudia el proveedor.
- Dar un precio que no esté publicado en la ficha.
- Afirmar disponibilidad o plazo de entrega concreto.
- Prometer aprobaciones, condiciones o coberturas.
- Pedir documentación antes de que haya coche elegido.

---

## PASO 9 — PROMPT INTERNO (borrador)

> Eres el asesor virtual de MoviLease, especialista en renting de vehículos.
> Hablas en español de España, tuteando, con tono cercano y profesional. Ni
> robótico ni excesivamente comercial.
>
> **MoviLease es intermediario.** El contrato lo firma el cliente con el
> proveedor de renting. Nunca hables como si vosotros aprobarais nada.
>
> **Reglas que no puedes romper:**
> 1. No inventes nada. Precios, disponibilidad, plazos, condiciones,
>    coberturas y documentación salen de tus herramientas o de la base de
>    conocimientos. Si no está ahí, no existe.
> 2. Si no sabes algo, dilo con naturalidad y ofrece WhatsApp o teléfono.
> 3. **Nunca digas a nadie que no cualifica, ni insinúes que no va a salir.**
>    MoviLease trabaja con muchos proveedores y hay muchas vías. Ante la duda,
>    que suba la documentación y lo estudian.
> 4. Nunca prometas una aprobación.
> 5. No pidas documentación hasta que haya elegido coche.
> 6. Pregunta de una en una o en grupos pequeños. Esto es una conversación,
>    no un formulario.
> 7. No pidas datos que no necesitas.
> 8. Cuando pidas algo delicado, explica para qué sirve.
> 9. Antes de cerrar, resume lo que has entendido.

---

## PASO 10 — FASES

### FASE 1 · Cimientos
Las seis tablas, el bucket privado y la capa de datos.
**Archivos:** `supabase/migrations/0005_asesor_ia.sql`, `src/lib/data/asesor.ts`.
**Riesgo:** sin CLI de Supabase, el SQL se pega a mano y un error no lo detecta
ningún build. Mitigación: migración con comprobaciones al final que fallan
ruidosamente si algo no se creó.
**Prueba:** insertar y leer un expediente de mentira.

### FASE 2 · Motor conversacional
Ruta `api/asesor`, streaming, persistencia de mensajes, topes de gasto.
**Riesgo:** fugas de la clave de API. Mitigación: solo servidor, nunca `NEXT_PUBLIC_`.
**Prueba:** conversación completa por terminal antes de tocar la interfaz.

### FASE 3 · Herramientas
`buscar_vehiculos`, `documentacion_requerida`, `guardar_dato_cliente`,
`crear_expediente`, `marcar_documento`, `derivar_a_asesor`.
**Prueba:** pedirle precios de coches que no existen y verificar que no se los inventa.

### FASE 4 · Widget
Burbuja, streaming, indicador de escritura, tarjetas de vehículo, respuestas
rápidas. Con los tokens de diseño que ya existen.
**Prueba:** 375 px, y `prefers-reduced-motion`.

### FASE 5 · Documentación
Subida validada, barra de progreso, estados.
**Riesgo:** el más alto del proyecto. Archivos maliciosos, documentos
filtrados. Mitigación: bucket privado, validación por bytes, URLs firmadas.

### FASE 6 · Avisos
Los tres, reutilizando el módulo de notificaciones que ya existe.

### FASE 7 · Panel
Expedientes, revisión documental, edición de la base de conocimientos.
Sobre el armazón de `/admin` que hoy está vacío.

### FASE 8 · Legal
**Reescribir la política de privacidad.** Nuevo tratamiento, base legal,
conservación, el proveedor de IA como encargado con transferencia
internacional, y la comunicación de documentos al proveedor de renting.
**Esta fase bloquea el lanzamiento.** No es opcional ni posterior.

### FASE 9 · Pruebas y despliegue
Conversaciones reales de prueba, revisión de costes, despliegue.

---

## LO QUE SIGUE ABIERTO

- **Presupuesto mensual de IA.** Propuesta: empezar con modelo intermedio y
  topes, medir con conversaciones reales, ajustar con datos.
- **Enlace para retomar el expediente.** Adrián dijo que si se cierra la
  ventana se empieza de cero. Queda anotado el riesgo: nueve documentos en una
  sentada desde el móvil es mucho pedir, y se abandona justo en el paso que más
  interesa.
- Bloques 1, 2, 3, 7, 8, 9, 13, 15 y 16 de la entrevista. Afinan, no bloquean.
