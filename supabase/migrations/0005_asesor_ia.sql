-- Asesor IA de renting: conversación, expediente y documentación del cliente.
--
-- Seis tablas nuevas. Ninguna existente se modifica: si mañana se apaga el
-- asistente, la web pública sigue exactamente igual.
--
-- DECISIÓN DE SEGURIDAD QUE EXPLICA TODOS LOS GRANT DE ESTE FICHERO:
-- el cliente del chat es anónimo, no hay login. En vez de inventarle una
-- identidad para que RLS la gobierne, **el navegador no habla nunca con
-- Supabase**: todas las escrituras del cliente pasan por rutas de servidor
-- que verifican el token de sesión y usan la service_role. Por eso aquí
-- `anon` no recibe ni un solo permiso, ni siquiera de lectura. Al otro lado
-- de estas tablas hay DNI y nóminas; cuanta menos superficie, mejor.

-- =========================================================================
-- 1. Enums
-- =========================================================================

create type message_role as enum ('user', 'assistant');

-- Estado del caso. Deliberadamente distinto de lead_status: aquel describe
-- la gestión comercial de un lead y este el recorrido del cliente por el
-- chat. Mezclarlos obligaría a que un enum sirviera a dos flujos distintos.
create type expediente_status as enum (
  'conversacion',
  'contacto_recibido',
  'documentacion_pendiente',
  'documentacion_completa',
  'derivado_asesor',
  'cerrado'
);

-- Estado documental, separado del comercial a propósito: un expediente puede
-- tener la documentación completa y la venta parada, o al revés.
create type expediente_doc_status as enum ('sin_iniciar', 'incompleta', 'completa');

create type document_status as enum ('pendiente', 'recibido', 'revisado', 'rechazado');

-- Cómo se resuelve el periodo fiscal de un documento.
--
-- Existe porque las plantillas originales decían "renta 23/24" y "IVA
-- 2024/25" escritos a mano, y en septiembre de 2026 ya pedían ejercicios de
-- hace dos años. Guardar el año fijo garantiza que vuelva a caducar cada
-- enero; guardar la regla hace que se resuelva sola.
-- Hay tres reglas y no una porque los plazos de presentación no coinciden:
-- la renta se presenta de abril a junio, el Modelo 390 en enero y el Modelo
-- 200 en julio. Con una sola regla, entre enero y julio estaríamos pidiendo
-- un Impuesto de Sociedades que todavía no existe.
create type doc_period_rule as enum (
  'ninguna',
  'ultima_renta_presentada',
  'ultimo_iva_anual',
  'ultimo_impuesto_sociedades',
  'trimestres_ano_en_curso'
);

-- =========================================================================
-- 2. Conversación
-- =========================================================================

create table conversations (
  id uuid primary key default gen_random_uuid(),
  -- Se guarda el HASH del token de sesión, nunca el token. Si alguien lee
  -- esta tabla no obtiene con qué suplantar una conversación ajena.
  session_token_hash text not null unique,
  -- Estado de trabajo mientras la conversación avanza. El lead_id NO está
  -- aquí sino en expedientes: guardarlo en las dos tablas es garantizar que
  -- algún día discrepen.
  client_type client_type,
  vehicle_id uuid references vehicles(id) on delete set null,
  -- Contador materializado en vez de count(*) sobre messages: se consulta en
  -- cada turno para aplicar el tope de mensajes, y no merece un escaneo.
  message_count integer not null default 0,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

create index idx_conversations_last_activity on conversations(last_activity_at);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role message_role not null,
  content text not null,
  -- Las llamadas a herramientas se guardan para poder auditar de dónde salió
  -- cada dato que la IA dio por bueno. Si algún día un cliente discute un
  -- precio, aquí está la consulta exacta que lo devolvió.
  tool_calls jsonb,
  created_at timestamptz not null default now()
);

create index idx_messages_conversation on messages(conversation_id, created_at);

-- =========================================================================
-- 3. Expediente
-- =========================================================================

create table expedientes (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null unique references conversations(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  client_type client_type not null,
  vehicle_id uuid references vehicles(id) on delete set null,
  status expediente_status not null default 'conversacion',
  doc_status expediente_doc_status not null default 'sin_iniciar',
  assigned_to uuid references profiles(id) on delete set null,
  notes text,
  -- Aviso de expediente parado: cliente que empezó a subir documentación y se
  -- atascó. Es el lead más caliente que existe —ya eligió coche y ya está
  -- enseñando el DNI— y sin esta marca moriría en silencio en la base de
  -- datos. Se guarda la fecha del aviso, no un booleano, para no repetirlo.
  stalled_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_expedientes_status on expedientes(status);
create index idx_expedientes_doc_status on expedientes(doc_status);

-- =========================================================================
-- 4. Requisitos documentales — la base de conocimientos editable
-- =========================================================================

create table document_requirements (
  id uuid primary key default gen_random_uuid(),
  client_type client_type not null,
  key text not null,
  label text not null,
  help_text text,
  -- Cuántos archivos espera este requisito. NULL = variable.
  --
  -- No es un capricho: "2 últimas nóminas" son exactamente dos y "trimestres
  -- de IVA del año en curso" son uno en enero y tres en octubre. Sin esto, el
  -- sistema daría el requisito por cumplido con el primer archivo y el
  -- expediente llegaría cojo sin que nadie se enterara.
  expected_count integer check (expected_count is null or expected_count > 0),
  period_rule doc_period_rule not null default 'ninguna',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_type, key)
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid not null references expedientes(id) on delete cascade,
  -- Sin clave foránea a document_requirements a propósito: si algún día se
  -- desactiva o renombra un requisito, los documentos ya subidos deben
  -- sobrevivir. Es un registro histórico, no una relación viva.
  requirement_key text not null,
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes integer not null check (size_bytes > 0),
  status document_status not null default 'recibido',
  uploaded_at timestamptz not null default now(),
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_notes text
);

create index idx_documents_expediente on documents(expediente_id);

-- =========================================================================
-- 5. Base de conocimientos general
-- =========================================================================

create table knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_knowledge_active on knowledge_entries(category, sort_order) where is_active;

-- =========================================================================
-- 6. RLS y permisos
-- =========================================================================
-- Igual que en 0002_grants.sql: RLS no sustituye al GRANT de tabla, hacen
-- falta las dos cosas. Y `anon` no aparece en ningún GRANT de este bloque,
-- por la razón explicada en la cabecera del fichero.

alter table conversations enable row level security;
alter table messages enable row level security;
alter table expedientes enable row level security;
alter table document_requirements enable row level security;
alter table documents enable row level security;
alter table knowledge_entries enable row level security;

-- Quien puede ver leads puede ver expedientes: es la misma información
-- comercial vista de otra manera.
create policy "conversations_staff_read" on conversations for select
  using ( current_role_is(array['admin','leads_viewer']::user_role[]) );
create policy "conversations_admin_write" on conversations for all
  using ( current_role_is(array['admin']::user_role[]) )
  with check ( current_role_is(array['admin']::user_role[]) );

create policy "messages_staff_read" on messages for select
  using ( current_role_is(array['admin','leads_viewer']::user_role[]) );
create policy "messages_admin_write" on messages for all
  using ( current_role_is(array['admin']::user_role[]) )
  with check ( current_role_is(array['admin']::user_role[]) );

create policy "expedientes_staff_read" on expedientes for select
  using ( current_role_is(array['admin','leads_viewer']::user_role[]) );
create policy "expedientes_staff_update" on expedientes for update
  using ( current_role_is(array['admin','leads_viewer']::user_role[]) );
-- Sin política de INSERT a propósito: los expedientes solo los crea el
-- servidor con service_role, que se salta RLS. Una política que nunca puede
-- dispararse es código muerto que confunde a quien la lee.
create policy "expedientes_admin_delete" on expedientes for delete
  using ( current_role_is(array['admin']::user_role[]) );

-- Los documentos NO son borrables desde el panel por nadie que no sea admin:
-- borrar un DNI subido por un cliente es una acción con consecuencias.
create policy "documents_staff_read" on documents for select
  using ( current_role_is(array['admin','leads_viewer']::user_role[]) );
create policy "documents_staff_update" on documents for update
  using ( current_role_is(array['admin','leads_viewer']::user_role[]) );
create policy "documents_admin_delete" on documents for delete
  using ( current_role_is(array['admin']::user_role[]) );

create policy "doc_requirements_staff_read" on document_requirements for select
  using ( current_role_is(array['admin','catalog_editor','leads_viewer']::user_role[]) );
create policy "doc_requirements_admin_write" on document_requirements for all
  using ( current_role_is(array['admin']::user_role[]) )
  with check ( current_role_is(array['admin']::user_role[]) );

create policy "knowledge_staff_read" on knowledge_entries for select
  using ( current_role_is(array['admin','catalog_editor','leads_viewer']::user_role[]) );
create policy "knowledge_admin_write" on knowledge_entries for all
  using ( current_role_is(array['admin']::user_role[]) )
  with check ( current_role_is(array['admin']::user_role[]) );

grant select on conversations, messages, expedientes, documents to authenticated;
grant update on expedientes, documents to authenticated;
grant select on document_requirements, knowledge_entries to authenticated;
grant insert, update, delete on document_requirements, knowledge_entries to authenticated;
grant select, insert, update, delete on
  conversations, messages, expedientes, documents,
  document_requirements, knowledge_entries
  to service_role;

-- =========================================================================
-- 7. Almacén de documentos
-- =========================================================================
-- Bucket PRIVADO. Ningún documento tendrá jamás URL pública: la descarga es
-- por URL firmada de caducidad corta, generada en servidor solo para
-- administradores autenticados.

insert into storage.buckets (id, name, public)
values ('expedientes', 'expedientes', false)
on conflict (id) do nothing;

-- =========================================================================
-- 8. Semilla: las tres listas documentales
-- =========================================================================
-- Fuente: plantillas reales de Adrián, 02/09/2026 (docs/DOCUMENTACION-POR-PERFIL.md).
-- Los tres perfiles: TODOS los documentos son obligatorios, no hay opcionales.
-- No añadir ni quitar nada aquí sin confirmarlo con Adrián.

insert into document_requirements (client_type, key, label, expected_count, period_rule, sort_order) values
  -- PARTICULAR
  ('particular', 'dni',                  'Foto del DNI (ambas caras)',                 1,    'ninguna', 1),
  ('particular', 'nominas',              'Dos últimas nóminas',                        2,    'ninguna', 2),
  ('particular', 'renta',                'Última declaración de la renta',             1,    'ultima_renta_presentada', 3),
  ('particular', 'vida_laboral',         'Vida laboral',                               1,    'ninguna', 4),
  ('particular', 'titularidad_bancaria', 'Certificado de titularidad bancaria actualizado', 1, 'ninguna', 5),
  ('particular', 'carnet_conducir',      'Carnet de conducir',                         1,    'ninguna', 6),

  -- AUTÓNOMO
  ('autonomo',   'dni',                  'DNI o NIE del titular',                      1,    'ninguna', 1),
  ('autonomo',   'vida_laboral',         'Vida laboral',                               1,    'ninguna', 2),
  ('autonomo',   'renta',                'Última declaración de la renta',             1,    'ultima_renta_presentada', 3),
  ('autonomo',   'iva_anual',            'Resumen anual de IVA (Modelo 390)',          1,    'ultimo_iva_anual', 4),
  ('autonomo',   'iva_trimestral',       'Trimestres de IVA del año en curso (Modelo 303)', null, 'trimestres_ano_en_curso', 5),
  ('autonomo',   'titularidad_bancaria', 'Certificado de titularidad bancaria actualizado', 1, 'ninguna', 6),
  ('autonomo',   'alta_censal',          'Modelo 036 o 037 de alta censal',            1,    'ninguna', 7),
  ('autonomo',   'carnet_conducir',      'Carnet de conducir',                         1,    'ninguna', 8),

  -- EMPRESA
  ('empresa',    'cif',                  'CIF definitivo de la empresa',               1,    'ninguna', 1),
  -- expected_count NULL: "apoderado/s" en plural. Una sociedad puede tener
  -- varios apoderados mancomunados y harían falta todos sus DNI.
  ('empresa',    'dni_apoderados',       'DNI o NIE del apoderado o apoderados',       null, 'ninguna', 2),
  ('empresa',    'balance',              'Balance de pérdidas y ganancias',            1,    'ninguna', 3),
  ('empresa',    'escrituras',           'Escrituras de constitución',                 1,    'ninguna', 4),
  ('empresa',    'sociedades',           'Último Impuesto de Sociedades (Modelo 200)', 1,    'ultimo_impuesto_sociedades', 5),
  ('empresa',    'iva_anual',            'Resumen anual de IVA (Modelo 390)',          1,    'ultimo_iva_anual', 6),
  ('empresa',    'iva_trimestral',       'Trimestres de IVA del año en curso (Modelo 303)', null, 'trimestres_ano_en_curso', 7),
  ('empresa',    'titularidad_bancaria', 'Recibo de titularidad bancaria',             1,    'ninguna', 8),
  ('empresa',    'carnet_conducir',      'Carnet de conducir',                         1,    'ninguna', 9);

-- =========================================================================
-- 9. Comprobación
-- =========================================================================
-- Esta migración se pega a mano en el editor SQL porque el proyecto no tiene
-- CLI de Supabase, y ahí un error no lo detecta ningún build. Si algo no se
-- ha creado, que se sepa AQUÍ y no tres semanas después cuando falle el chat.

do $$
declare
  tabla text;
  n_req integer;
begin
  foreach tabla in array array[
    'conversations','messages','expedientes',
    'document_requirements','documents','knowledge_entries'
  ] loop
    if to_regclass('public.' || tabla) is null then
      raise exception 'FALTA LA TABLA %. La migración no se ha aplicado entera.', tabla;
    end if;
  end loop;

  select count(*) into n_req from document_requirements;
  if n_req <> 23 then
    raise exception 'Se esperaban 23 requisitos documentales y hay %. Revisa la semilla.', n_req;
  end if;

  if not exists (select 1 from storage.buckets where id = 'expedientes' and public = false) then
    raise exception 'El bucket "expedientes" no existe o no es privado.';
  end if;

  raise notice 'Migración 0005 aplicada correctamente: 6 tablas, % requisitos, bucket privado.', n_req;
end $$;
