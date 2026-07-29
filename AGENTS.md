<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Movilease Development Guide

## Objetivo
Construir la mejor plataforma de renting de España con un diseño moderno, premium y orientado a la conversión.

## Arquitectura general
- Next.js 15 (App Router) + React 19 + TypeScript + Tailwind v4 + Supabase (Postgres + Storage), desplegado en Vercel.
- Un solo proyecto y una sola base de datos sirven dos dominios (movilease.es y quierorenting.es), resueltos por host en `src/lib/brand.ts` (`getCurrentBrand()` / `resolveBrand()`). Nunca hardcodear el nombre o descripción de marca en código visible al usuario: usar siempre `getCurrentBrand()`.
- Rutas principales:
  - `src/app/(public)/*` — sitio público: home, catálogo, ficha de vehículo (`[slug]`), comparador, calculadora, blog, contacto, favoritos, páginas legales.
  - `src/app/admin/(dashboard)/*` — panel de administración multiusuario (leads, vehículos, modelos, marcas, blog, SEO, usuarios), protegido tras `src/app/admin/login`.
  - `src/app/api/*` — route handlers (leads, favoritos, revalidate para invalidar ISR desde el admin).
- Capa de datos: `src/lib/data/` (consultas de catálogo), `src/lib/supabase/{client,server,admin,middleware}.ts` (un cliente Supabase por contexto de ejecución), `src/lib/actions/` (server actions), `src/lib/validations/` (esquemas zod).
- Notificaciones de leads: `src/lib/notifications/{telegram,web3forms}.ts`.
- Base de datos versionada en `supabase/migrations/*.sql`, datos de ejemplo en `supabase/seed*.sql`.
- Scripts de mantenimiento puntuales en `scripts/` y `src/scripts/` — ambos cargan credenciales vía su `_env.py` (lee `.env.local`); nunca hardcodear claves ahí.

## Convenciones de código
- TypeScript estricto (`strict: true`) — no usar `any` ni silenciar el compilador.
- Código limpio y modular.
- Componentes reutilizables.
- Evitar duplicación.
- Server Components por defecto; Client Components solo cuando haga falta interactividad real.
- Claves y tokens de servidor (`SUPABASE_SERVICE_ROLE_KEY`, tokens de notificaciones) solo en código marcado `server-only`, nunca expuestos al cliente ni hardcodeados.

## Reglas de diseño
- Mantener una estética limpia y premium.
- No cambiar la identidad visual (logo, paleta, tipografía) sin autorización.
- Mantener consistencia entre todas las páginas y entre las dos marcas (mismo sistema de diseño; solo cambian nombre y descripción vía `getCurrentBrand()`).

## Reglas SEO
- Todas las páginas deben tener `title` y `meta description`.
- URLs amigables.
- Estructura preparada para posicionamiento (jerarquía de encabezados, `sitemap.ts` y `robots.ts` actualizados).
- Datos estructurados (JSON-LD) cuando proceda.

## Reglas de rendimiento
- Optimizar imágenes (usar `next/image`, respetar `remotePatterns` de `next.config.ts`).
- Lazy loading donde aplique.
- No añadir dependencias innecesarias.
- Aprovechar el SSR/ISR ya existente; no convertir páginas estáticas en client-only sin motivo.

## Flujo de trabajo
- Cambios pequeños y revisables; no mezclar refactors grandes con fixes puntuales.
- Commits descriptivos, uno por cambio lógico.
- Antes de tocar lógica de negocio o esquema de datos, revisar `supabase/migrations/` y `src/lib/data/` para no duplicar ni romper contratos existentes.

## Qué NO debe modificar un agente sin autorización
- Identidad visual de marca (logo, paleta, tipografía).
- `src/lib/brand.ts` y la lógica de resolución de marca por host.
- Datos de contacto compartidos (WhatsApp, email, redes sociales) — son iguales para ambas marcas, no específicos de una.
- Las páginas legales (`aviso-legal`, `politica-privacidad`, `politica-cookies`) mientras contengan el placeholder `[PENDIENTE: completar con datos fiscales]` — no inventar CIF ni razón social.
- Migraciones ya aplicadas en `supabase/migrations/` — no editarlas retroactivamente; crear una migración nueva si hace falta cambiar el esquema.
- Claves y secretos (`.env.local`, `SUPABASE_SERVICE_ROLE_KEY`, tokens de Telegram/Web3Forms) — nunca hardcodear, nunca commitear.
- Configuración de Git remoto, Vercel o CI/CD.
- El catálogo y las reglas de negocio de quierorenting.es como referencia de paridad — no se tocan desde este proyecto.

## Checklist obligatorio antes de finalizar cualquier tarea
- [ ] Ejecutar lint.
- [ ] Ejecutar build.
- [ ] Corregir cualquier error — no dejar código roto.
- [ ] Comprobar responsive (mobile/tablet/desktop).
- [ ] Comprobar accesibilidad básica (contraste, `alt` en imágenes, foco de teclado, semántica).
- [ ] Comprobar SEO de las páginas tocadas (title, meta description, encabezados).
- [ ] Explicar de forma breve los cambios realizados.
