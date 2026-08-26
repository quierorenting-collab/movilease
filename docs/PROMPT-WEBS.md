# Prompt de continuidad — las webs de Adri Daganzo

> **Cómo se usa:** abre una sesión nueva de Claude Code en este repositorio y
> pega el bloque de la web que vayas a tocar (o simplemente di: *"lee
> `docs/PROMPT-WEBS.md` entero antes de empezar"*). Está escrito para que un
> Claude que no ha visto nunca el proyecto pueda modificar la web sin romper
> nada ni reinventar decisiones ya tomadas.

---

## 0. Mapa del ecosistema

Cuatro webs, un mismo dueño, **cuatro situaciones distintas**:

| Web | Qué es | Dónde vive el código |
|---|---|---|
| **movilease.es** | Renting de coches para particulares. Marca premium. | **Este repositorio** (`quierorenting-collab/movilease`) |
| **quierorenting.es** | Misma web, misma base de datos, otra marca de captación. | **Este repositorio.** Se sirve por dominio, ver `src/lib/brand.ts` |
| **laponce.es** | Eventos de música urbana en directo en Madrid (Oh My Club). | ⚠️ **No está en este repositorio ni en ningún repo accesible desde aquí.** Ver §4 |
| **adridaganzo.com** | Portfolio personal que agrupa las marcas: La Ponce, Hypeland, Quiero Renting, First Class Booking y VIP Concierge. | ⚠️ **No está en este repositorio ni en ningún repo accesible desde aquí.** Ver §4 |

Es decir: **de las cuatro, ahora mismo desde este repo sólo se pueden modificar
movilease.es y quierorenting.es**, que son la misma aplicación. Para las otras
dos hace falta dar acceso al repositorio correspondiente (§4).

---

## 1. Reglas de trabajo (válidas para cualquiera de las cuatro)

1. **Este NO es el Next.js que conoces.** Lo dice `AGENTS.md` y va en serio:
   antes de escribir código, lee la guía correspondiente en
   `node_modules/next/dist/docs/`. Hay cambios de API respecto a lo que
   recuerdas: `cookies()`, `headers()` y `params` son **asíncronos**.
2. **En una sesión nueva `node_modules` no existe.** Lo primero es
   `npm install`. Sin eso no hay ni docs de Next que leer ni build que hacer.
3. **Comentarios en español y explicando el porqué**, nunca el qué. Todo el
   código existente sigue esa norma: cada comentario cuenta la decisión y el
   problema que resolvía. Imítalo — es lo que hace mantenible el proyecto.
4. **Mensajes de commit en español**, en el mismo tono que `git log`: título
   descriptivo sin prefijos tipo `feat:`, cuerpo que explica el problema, la
   decisión y **cómo se verificó** (build de producción, contraste medido,
   rutas comprobadas). Mira `git log -5` antes de tu primer commit.
5. **Verifica antes de commitear**: `npm run lint` y `npm run build`. No hay
   suite de tests; el build de producción es la red de seguridad real.
6. **Nada de secretos en el repo.** `.env.local` está en `.gitignore`. La
   plantilla es `.env.example`.
7. **Rama de trabajo**: desarrolla y empuja sólo a la rama que te indiquen.
   Nunca a `master` sin permiso explícito.

---

## 2. movilease.es + quierorenting.es — traspaso técnico completo

### 2.1 Stack

- **Next.js 15.5 (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (`@import "tailwindcss"` + `@theme inline`, sin
  `tailwind.config.js`)
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`) como base de datos,
  auth del panel y almacenamiento de fotos
- **framer-motion 12** para las animaciones de entrada y el menú
- **zod 4** para validar formularios
- **`server-only`** marcando todo lo que jamás debe llegar al cliente
- Scripts auxiliares en **Python** (`requests`) y **Node** (`sharp`, `ffmpeg`)

Comandos: `npm run dev` · `npm run build` · `npm run start` · `npm run lint`

### 2.2 Dos dominios, una aplicación

`src/lib/brand.ts` es la pieza clave:

```ts
BRANDS = { "movilease.es": {...}, "quierorenting.es": {...} }
resolveBrand(host)        // normaliza, quita www y puerto, cae en el default
getCurrentBrand()         // server-only, lee headers().get("host")
```

Comparten catálogo, base de datos y lógica de negocio; **sólo cambian nombre y
descripción** según el host. Si añades una marca nueva, se añade ahí y hereda
todo lo demás. Donde no hay request de la que leer el host (sitemap, robots,
panel admin) se usa `DEFAULT_BRAND_NAME` / `SITE_URL` de `src/lib/constants.ts`.

`next.config.ts` redirige `www.movilease.es/*` → `movilease.es/*` con 301 en el
edge (había 200 en las dos direcciones y eso partía la señal de SEO).

### 2.3 Rutas

**Públicas** — `src/app/(public)/`:

| Ruta | Archivo | ISR |
|---|---|---|
| `/` | `page.tsx` (910 líneas, ~10 secciones) | 3600 s |
| `/catalogo` | `catalogo/page.tsx` (filtros por marca, categoría, presupuesto) | 900 s |
| `/[slug]` | ficha de modelo **o** landing SEO programática; 404 si no hay nada | 1800 s |
| `/blog`, `/blog/[slug]` | blog desde Supabase, con `generateStaticParams` | 1800 / 3600 s |
| `/calculadora`, `/comparador`, `/favoritos` | herramientas de cliente (localStorage) | — |
| `/renting-empresas`, `/renting-autonomos`, `/sobre-nosotros`, `/contacto` | landings de negocio | — |
| `/aviso-legal`, `/politica-privacidad`, `/politica-cookies` | legales | — |

`[slug]` es un catch-all deliberado: primero busca modelo con vehículos
activos, si no, landing page, y si no, `notFound()`. Un modelo **sin vehículos
activos devuelve 404**, no una página vacía (decisión tomada con el SEAT Arona
y el Opel Combo).

**Panel** — `src/app/admin/`: login con Supabase Auth y un dashboard cuyas
páginas (`vehiculos`, `modelos`, `marcas`, `leads`, `blog`, `seo`, `usuarios`)
**son stubs a la espera de la "Fase 4"**. Cada una ya llama a `requireRole(...)`
con los roles correctos. Hoy el catálogo se gestiona con los scripts de §2.7.

**API** — `src/app/api/`:
- `POST /api/leads` — envoltorio JSON sobre la misma lógica que la server action
- `POST /api/revalidate` — invalida ISR, protegida por `x-revalidate-secret`
- `/api/favorites/resolve` — resuelve los ids guardados en el navegador

`src/middleware.ts` **sólo cubre `/admin/:path*`** a propósito: la web pública
no debe depender de que exista un Supabase configurado para renderizar.

### 2.4 Datos

Tres clientes Supabase, y elegir mal rompe producción:

- `createClient()` (`lib/supabase/server.ts`) — con cookies. Sólo donde hace
  falta sesión.
- `createPublicClient()` — **sin cookies**. Para contenido público idéntico
  para todos (blog, catálogo, fichas). Si usas el de cookies en una página con
  `generateStaticParams`, producción revienta con *"Page changed from static to
  dynamic at runtime"*.
- `createAdminClient()` (`lib/supabase/admin.ts`) — service role, se salta RLS.
  Sólo servidor, y hoy sólo para insertar leads.

Capa de datos en `src/lib/data/` (`vehicles.ts`, `blog.ts`, `landing.ts`), toda
`server-only`. Regla firme: **nunca lanza**. Si Supabase no responde, devuelve
`[]` o `null` y la página se degrada, no se cae.

Detalle heredado: los embeds de PostgREST (`models(...)`) no se usan porque
`src/types/database.types.ts` está escrito a mano y no tiene `Relationships`.
Marca y modelo se resuelven con dos consultas planas y un join en memoria
(`attachModelsAndBrands`). Si algún día se generan los tipos con la CLI de
Supabase, ese rodeo se puede quitar.

**Esquema** (`supabase/migrations/`, cuatro migraciones):
`profiles` · `brands` · `models` · `vehicles` · `vehicle_images` ·
`vehicle_pricing` · `leads` · `blog_posts` · `seo_metadata` · `landing_pages` ·
`redirects`.

- Enums de negocio en SQL y sus etiquetas en `lib/constants.ts` — **si añades
  un valor, hay que tocar los dos sitios**.
- RLS activo en todas las tablas, con el helper `current_role_is(roles)`.
- Ojo: **RLS no sustituye al `GRANT`** de tabla (por eso existe
  `0002_grants.sql`). Toda tabla nueva necesita las dos cosas.
- Triggers: `prevent_role_self_escalation` (nadie se sube el rol a sí mismo) y
  `handle_new_auth_user` (crea el perfil con el rol más restrictivo).
- `vehicle_pricing` es la tabla de cuotas por plazo × kilometraje. Si un
  vehículo no tiene filas, la ficha cae al precio único de
  `vehicles.monthly_price_cents`. **Nunca se escribe una cuota de 0 €**: en las
  láminas el 0 significa "ese kilometraje no se ofrece", y publicarlo sería
  anunciar un renting gratis.

### 2.5 Diseño

Todo el sistema vive en **`src/app/globals.css`** (~900 líneas). No inventes
estilos nuevos: casi siempre ya existe la clase.

- **Color**: azul de marca `#0068FF`, azul oscuro `#0B2A5E`. Para *texto* sobre
  fondo oscuro se usa `--blue-light: #5AA0FF` porque el `#0068FF` sólo llega a
  3,1:1 y no pasa AA.
- **Texto sobre oscuro**: `--on-dark-1/2/3`. La jerarquía se hace con tamaño y
  peso, **no bajando opacidades hasta lo ilegible**.
- **Superficies**: `.surface-black`, `.surface-dark`, `.surface-graphite`,
  `.surface-carbon`, `.card-dark`, `.glass`, `.glass-dark`, más las texturas
  `.bg-texture-light` / `.bg-texture-dark`.
- **Tipografía**: `.display-xl/lg/md/sm`, `.body-lg/md/sm`, `.section-label`,
  `.eyebrow`. Fuentes: **Space Grotesk** (display) e **Inter** (texto), por
  `next/font`, sin el peso 300 (no se usa en ningún sitio).
- **Ritmo vertical**: `.section-y`, `.section-y-sm`, `.section-head`.
- **Botones**: `.btn-primary`, `.btn-ghost`, `.btn-white`, `.btn-whatsapp`,
  `+ .btn-lg` / `.btn-sm` / `.btn-block`.
- **Movimiento**: todo el sistema comparte
  `--easing-premium: cubic-bezier(.16, 1, .3, 1)` y anima **sólo `transform` y
  `opacity`**. Componentes: `Reveal`, `RevealGroup`/`RevealItem`,
  `AnimatedCounter`, `Parallax`, `VideoBackdrop`.
- **`prefers-reduced-motion` está respetado en todas las animaciones.** Si
  añades una, añade también su bloque de excepción.
- Contraste: las decisiones de color llevan la ratio medida en el comentario.
  Mantén esa costumbre — la web se ha ido midiendo, no estimando.

`VideoBackdrop` merece nota aparte: `preload="none"`, las `<source>` no se
montan hasta que la sección se acerca al viewport, el póster se pinta desde el
primer render, y no se descarga vídeo con *reduced motion* ni con ahorro de
datos. Si el archivo no existe, queda el póster. No lo simplifiques.

### 2.6 SEO

- `src/lib/metadata.ts` → `pageMetadata({ title, description, path, images })`.
  **Úsalo en toda página nueva**: canonical, Open Graph y Twitter Card de una
  vez. Declarar `openGraph` a mano desactiva el descubrimiento automático de
  `app/opengraph-image.tsx`, por eso la imagen se referencia explícita.
- `src/components/seo/JsonLd.tsx`: `Organization`, `WebSite`, `Faq`,
  `Breadcrumb`, `ItemList`, `VehicleModel`, `WebPage`, `Article`.
- `sitemap.ts` genera rutas fijas + fichas de modelo + posts + vistas por
  marca, y si Supabase falla sirve igualmente las estáticas.
- `robots.ts` bloquea `/admin`, `/api/`, `/favoritos` y `/comparador` (los dos
  últimos dependen del localStorage del visitante: no hay nada que indexar).
- Las descripciones de ficha se arman con datos reales (cuota, nº de versiones)
  y se recortan a ~158 caracteres. Lo genérico no gana clics.
- Imágenes: AVIF primero, `qualities: [75, 92]`, caché de 30 días. Los dominios
  remotos permitidos están en `next.config.ts` — si aparece una fuente nueva de
  fotos, hay que declararla ahí.

### 2.7 Leads (el corazón del negocio)

`src/lib/actions/leads.ts` → `createLead(formData)`:

1. Valida con `leadFormSchema` (zod).
2. **Honeypot**: si el campo `website` viene relleno, se descarta en silencio
   devolviendo éxito falso al bot.
3. Inserta con el cliente admin, guardando IP, user-agent y `page_url`.
4. Notifica en paralelo a **Web3Forms** y **Telegram** y marca
   `notified_web3forms` / `notified_telegram`.
5. Devuelve un enlace de WhatsApp prerellenado.

**Cualquier fallo devuelve un mensaje controlado invitando a escribir por
WhatsApp, nunca un 500.** WhatsApp es el canal principal del negocio: número en
`NEXT_PUBLIC_WHATSAPP_NUMBER` (34613267375), correo `contacto@movilease.es`,
Instagram `@quierorenting`.

### 2.8 Scripts (así se gestiona hoy el catálogo)

Los de Python necesitan `scripts/_env.py` con `SUPABASE_URL` y `SERVICE_KEY`.

| Script | Para qué |
|---|---|
| `add_vehicle.py fichas/<coche>.json` | Alta o actualización completa de un coche: marca, modelo, versión, cuotas por plazo/km, galería. Con `"update_vehicle_id"` actualiza sin tocar la URL publicada. |
| `_fichas_drive.py` | Genera los JSON de los coches de QUADIS y M AUTOMOCION desde las láminas del Drive. **La lámina manda sobre lo que diga cualquier web.** |
| `slice-photo-sheet.mjs` | Trocea las hojas de contacto del Drive detectando las calles entre viñetas (el montaje no es fijo). |
| `build-galleries.mjs` | Escribe el bloque `images` de cada ficha y distingue exterior de interior midiendo el fondo de estudio, con el corte calculado por coche. |
| `galerias_quecoche.py [--aplicar]` | Rellena galerías desde quecochemecompro.com. Empareja con listón de parecido + combustible como desempate. **Por debajo del listón no toca el coche**: mejor una foto que las de otro modelo. |
| `build-section-video.mjs` | Convierte un clip de stock en fondo de sección (~1 MB) + póster WebP. |
| `optimize-brand-logos.js` | Reescala los logos de marca a 240 px. |
| `seed_db.py`, `generate-catalog-seed.mjs`, `upload_images.py` | Siembra inicial desde el catálogo de quierorenting.es. |

El formato de ficha JSON está en `scripts/fichas/*.json` (`opel-corsa-gs.json`
es un buen ejemplo). El `EJEMPLO.json` que menciona el docstring de
`add_vehicle.py` no existe — usa cualquier ficha real como plantilla.

### 2.9 Variables de entorno

Copia `.env.example` a `.env.local`:

- Públicas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
- Sólo servidor: `SUPABASE_SERVICE_ROLE_KEY`, `WEB3FORMS_API_KEY`,
  `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `REVALIDATE_SECRET`

Nada que no sea público lleva el prefijo `NEXT_PUBLIC_`. Jamás.

### 2.10 Trampas conocidas

- `cookies()`, `headers()` y `params` son **asíncronos** (Next 15).
- Cliente con cookies + `generateStaticParams` = 500 en producción.
- `.section-label` es CSS sin capa y **gana a las utilidades de Tailwind**: en
  la home hay un `style={{color}}` inline justo por eso.
- El panel admin no gestiona todavía el catálogo: si te piden "cambiar un
  precio", eso hoy es `add_vehicle.py` o SQL, no la web.
- El catálogo muestra **todos** los modelos, no doce: ya se corrigió una vez.
- Al llegar desde la calculadora con presupuesto, el resultado va **antes** de
  las marcas.

---

## 3. Cómo abordar un encargo típico

- *"Cambia un texto/precio de la home"* → `src/app/(public)/page.tsx`. Los
  precios reales salen de la base de datos, no del JSX.
- *"Nueva sección en una landing"* → copia el patrón: `<section>` con clase de
  superficie + `.section-y` + `Container` + `Reveal` + `.section-head` +
  `.section-label` + `.display-md`.
- *"Página nueva"* → `src/app/(public)/<ruta>/page.tsx`, con `pageMetadata`,
  entrada en `sitemap.ts` y enlace en `Header`/`Footer` si es navegable.
- *"Coche nuevo"* → ficha JSON + `add_vehicle.py`, fotos a `public/coches-nuevos`
  o Supabase Storage, y revalidar.
- *"Artículo de blog"* → tabla `blog_posts` (`status = 'published'` y
  `published_at`); el renderizador es `src/components/blog/Markdown.tsx`.
- *"Marca/dominio nuevo"* → `BRANDS` en `src/lib/brand.ts` y el DNS apuntando.

---

## 4. laponce.es y adridaganzo.com — lo que falta

Las dos webs están **en producción y funcionando** (La Ponce: eventos de música
urbana en Oh My Club con cuenta atrás, artistas, entradas por Vivaticket y
FourVenues. adridaganzo.com: portfolio que agrupa La Ponce, Hypeland, Quiero
Renting, First Class Booking y VIP Concierge). Por lo que se ve, ninguna es
WordPress: parecen aplicaciones modernas tipo Next/React.

Pero **su código no está en este repositorio**, y el único repositorio al que
esta sesión tiene acceso es `quierorenting-collab/movilease`. Sin el código no
se puede escribir un traspaso técnico honesto de ellas: cualquier detalle de
arquitectura que pusiera aquí sería inventado.

**Para que un Claude nuevo pueda modificarlas, hace falta una de estas cosas:**

1. El nombre del repositorio de cada una (`owner/repo`) y que esté autorizado
   para Claude. Con eso se añade a la sesión y se documentan igual que §2.
2. O, si no están en Git, subirlas a un repositorio primero.
3. Y en cualquier caso, saber: dónde están desplegadas (¿Vercel?), de dónde
   salen los datos de eventos y artistas (¿base de datos, CMS, o escritos a
   mano en el código?), y qué integraciones llevan (FourVenues, Vivaticket,
   Instagram, WhatsApp).

Cuando eso exista, este documento se amplía con una sección por web con el
mismo nivel de detalle que la de movilease.

---

## 5. Frase corta para arrancar una sesión

> Vas a trabajar en la web de MoviLease / QuieroRenting (Next.js 15 App Router,
> React 19, Tailwind v4, Supabase). Lee `docs/PROMPT-WEBS.md` y `AGENTS.md`
> antes de tocar nada, ejecuta `npm install`, y sigue las convenciones que hay
> ahí: comentarios en español explicando el porqué, sistema de diseño de
> `globals.css` en vez de estilos nuevos, `pageMetadata` en toda página, la
> capa de datos nunca lanza, y se verifica con `npm run lint` y `npm run build`
> antes de commitear. Mi encargo es: <describe aquí lo que quieres>.
