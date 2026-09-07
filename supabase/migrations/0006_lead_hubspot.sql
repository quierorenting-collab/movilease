-- Marca de si el lead llegó a HubSpot.
--
-- Los leads ya se vuelcan en HubSpot como un canal más, junto al aviso de
-- Telegram y el de correo. Esta columna sirve para lo mismo que sus dos
-- hermanas: saber, mirando la fila, si ese lead concreto llegó o se quedó por
-- el camino (token caducado, HubSpot caído, red). Sin ella el fallo solo
-- aparece en los registros del servidor, que nadie mira.
--
-- Nullable y sin valor por defecto para las filas viejas: un lead anterior a
-- la integración no es que fallara, es que no se intentó. NULL dice justo eso,
-- y false diría algo distinto y falso.
alter table public.leads
  add column if not exists notified_hubspot boolean;

comment on column public.leads.notified_hubspot is
  'true si el lead se creó en HubSpot; false si se intentó y falló; NULL si no se intentó.';
