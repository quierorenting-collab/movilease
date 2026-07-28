-- Los permisos GRANT a nivel de tabla son un requisito previo a RLS: sin
-- ellos, Postgres deniega el acceso antes de evaluar ninguna política, con
-- independencia de lo permisivas que sean. Al crear las tablas via una
-- migracion SQL directa (fuera del flujo propio de Supabase) no se
-- heredaron los grants por defecto que Supabase aplica normalmente.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public
  to authenticated, service_role;

grant select on all tables in schema public to anon;

grant insert on leads to anon;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated, service_role;

alter default privileges in schema public
  grant select on tables to anon;
