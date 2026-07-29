-- Amplia el formulario de solicitud de oferta: apellidos, empresa,
-- provincia, tipo de cliente, y metadatos de origen del lead (IP, user
-- agent, pagina de referencia) para las notificaciones enriquecidas.

create type client_type as enum ('empresa', 'autonomo', 'particular');

alter table leads
  add column if not exists last_name text,
  add column if not exists company text,
  add column if not exists province text,
  add column if not exists client_type client_type,
  add column if not exists ip_address text,
  add column if not exists user_agent text,
  add column if not exists page_url text;

-- "Oferta enviada" como estado intermedio entre "en_proceso" y "ganado".
alter type lead_status add value if not exists 'oferta_enviada' after 'en_proceso';
