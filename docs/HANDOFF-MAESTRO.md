# DOCUMENTO MAESTRO DE TRASPASO — Ecosistema web (MoviLease · QuieroRenting · La Ponce · Adri Daganzo)

> **Fecha de verificación: 1 de septiembre de 2026.**
> Todo lo que aparece aquí se ha comprobado leyendo el código de este
> repositorio y consultando las webs en producción ese día (cabeceras HTTP,
> HTML servido, `sitemap.xml`, `robots.txt`). Lo que **no** se ha podido
> comprobar va marcado como **`NO CONFIRMADO — REQUIERE REVISIÓN`**.
>
> **Cómo se usa:** pega este documento entero en una sesión nueva de Claude
> Code, o dile *"lee `docs/HANDOFF-MAESTRO.md` entero antes de tocar nada"*.
> La sección 19 es el prompt de arranque listo para copiar.
>
> Documento hermano, más corto: `docs/PROMPT-WEBS.md`. **Ojo: ese documento
> contiene un error que este corrige** — dice que quierorenting.es sirve esta
> misma aplicación Next.js, y eso hoy **no es cierto** (ver §2 y §7).

---

## 1. RESUMEN EJECUTIVO

Hay **cuatro webs vivas** y **dos sistemas técnicos completamente distintos**.
Confundirlos es el error más caro que puede cometer un desarrollador nuevo.

| Web | Qué es | Sistema | Código |
|---|---|---|---|
| **movilease.es** | Renting de coches para particulares, autónomos y empresas. Marca premium. | **A** — Next.js 15 + Supabase | **Este repositorio** |
| **quierorenting.es** | La marca de captación original. Renting, mismo negocio. | **B** — HTML estático de una sola página | Fuera del repo (§7) |
| **laponce.es** | Conciertos de música urbana en Oh My Club, Madrid | **B** — HTML estático | Fuera del repo (§7.4) |
| **adridaganzo.com** | Portfolio del promotor: La Ponce, Hypeland, Quiero Renting, First Class Booking, VIP Concierge | **B** — HTML estático (~41 páginas) | Fuera del repo (§7.5) |

- **Sistema A** = aplicación real: base de datos, panel de administración,
  ISR, build, despliegue continuo. Es lo que hay en este repositorio.
- **Sistema B** = HTML escrito a mano y servido tal cual desde Vercel. Sin
  framework, sin bundler, sin `npm install`, sin build. **Todo el CSS y el JS
  van inline dentro de cada `.html`.** Lo que sirve el dominio *es* el código
  fuente (llega sin minificar y con comentarios).

**Las cuatro comparten el mismo WhatsApp de negocio: `+34 613 26 73 75`**
(`34613267375`). Es el canal principal de conversión de todo el ecosistema.

**Objetivo de negocio común:** captar leads de renting (nombre + teléfono) y
cerrarlos por WhatsApp. Ninguna de las webs vende online: todas son
generadores de contacto.

### La relación MoviLease ↔ QuieroRenting (importante)

- **QuieroRenting es el origen.** Su catálogo (80 coches, 28 marcas) fue la
  **semilla** de la base de datos de MoviLease
  (`scripts/generate-catalog-seed.mjs` transforma literalmente su array
  `CARS` a SQL; ver `supabase/seed_catalog_real.sql`).
- **MoviLease es la evolución**: mismo negocio, marca nueva, aplicación real.
- El código de este repositorio **ya está preparado** para servir
  quierorenting.es con su propia marca (`src/lib/brand.ts` tiene las dos
  entradas), **pero eso hoy no está activo**: el dominio quierorenting.es
  sigue apuntando al HTML estático antiguo. Verificado el 01/09/2026 (§2.2).

---

## 2. REPOSITORIOS Y ACCESOS NECESARIOS

### 2.1 MoviLease (Sistema A)

| Concepto | Valor | Estado |
|---|---|---|
| Repositorio | `https://github.com/quierorenting-collab/movilease` | Confirmado (`git remote -v`) |
| Rama principal | `master` | Confirmado |
| Rama de trabajo actual | `claude/proyecto-handoff-completo-x2xlqj` | Confirmado |
| URL de producción | `https://movilease.es` | Confirmado: HTTP 200, `server: Vercel`, `x-powered-by: Next.js` |
| Redirección | `https://www.movilease.es` → `https://movilease.es` (308) | Confirmado. Se define en `next.config.ts` |
| Hosting / despliegue | **Vercel** | Confirmado por cabecera `server: Vercel` + `x-vercel-id` |
| Nombre del proyecto en Vercel | — | **NO CONFIRMADO — REQUIERE REVISIÓN** |
| Cuenta/organización de Vercel | — | **NO CONFIRMADO — REQUIERE REVISIÓN** |
| Registrador del dominio movilease.es | — | **NO CONFIRMADO — REQUIERE REVISIÓN** |
| Base de datos | **Supabase** (proyecto propio) | Confirmado por código; la URL exacta vive en `.env.local`, fuera del repo |
| Notificación de leads | **Web3Forms** (email) + **Telegram** (bot) | Confirmado en `src/lib/notifications/` |
| Fotos externas permitidas | `*.supabase.co/storage/v1/object/public/**` y `fotos.quecochemecompro.com` | Confirmado en `next.config.ts` |
| Google Search Console | Propiedad verificada por meta-etiqueta en `src/app/layout.tsx` (`verification.google`) | Confirmado en el código |
| Analítica web | **Ninguna instalada** | Confirmado: el HTML de producción no contiene GA4, GTM, Meta Pixel, Hotjar, Clarity ni Vercel Analytics |
| CRM | **No existe** | Los leads viven en la tabla `leads` de Supabase |

### 2.2 QuieroRenting (Sistema B) — **CORRECCIÓN IMPORTANTE**

Verificado el 01/09/2026 con `curl -I https://quierorenting.es`:

```
server: Vercel
content-type: text/html; charset=utf-8
content-length: 133382
etag: "3254ef265fc73acbba3c13bc2c210c6c"
last-modified: Sun, 30 Aug 2026 05:30:54 GMT
x-vercel-cache: HIT
```

**No hay `x-powered-by: Next.js`, no hay `x-matched-path`, hay `etag` y
`last-modified` de fichero estático.** quierorenting.es sirve **un único
archivo HTML de 133 KB**, no esta aplicación.

| Concepto | Valor | Estado |
|---|---|---|
| URL de producción | `https://quierorenting.es` | Confirmado, HTTP 200 |
| Hosting | **Vercel** | Confirmado por cabecera |
| Tecnología | HTML estático de una sola página, CSS y JS inline | Confirmado |
| Repositorio | **Desconocido / probablemente inexistente** | **NO CONFIRMADO — REQUIERE REVISIÓN**. Ver §7.3 para recuperar el código |
| Registrador del dominio | — | **NO CONFIRMADO — REQUIERE REVISIÓN** |
| Email de contacto publicado | `quierorenting@outlook.es` | Confirmado en su JSON-LD |
| Instagram | `@quierorenting` | Confirmado (compartido con MoviLease) |

### 2.3 laponce.es y adridaganzo.com (Sistema B)

Según `docs/PROMPT-WEBS.md` (verificación del 26/08/2026, **reconfirmada hoy
en lo esencial**):

| | laponce.es | adridaganzo.com |
|---|---|---|
| Alojamiento | Vercel | Vercel |
| Registrador | DonDominio | DonDominio |
| Repositorio | **Ninguno conocido** | **Ninguno conocido** |
| Páginas | 1 (~105 KB) | ~41 URLs en su `sitemap.xml` (contadas hoy) |

### 2.4 Lo que hay que pedirle al cliente para trabajar sin bloqueos

1. **Acceso a Vercel** (o al menos saber en qué cuenta están los 4 proyectos).
2. **Acceso al panel de Supabase** del proyecto de MoviLease, o el
   `.env.local` completo. Sin la `SUPABASE_SERVICE_ROLE_KEY` **no se puede
   dar de alta ningún coche con `add_vehicle.py`** (hay una vía alternativa,
   §8.6).
3. **Acceso al registrador de dominios** (DonDominio para laponce/adridaganzo;
   el de movilease.es y quierorenting.es sin confirmar).
4. Si se van a tocar laponce.es / adridaganzo.com / quierorenting.es:
   **primero la cuenta de Vercel, después el código.** Mientras otra persona
   conserve acceso al proyecto, puede volver a desplegar su copia y pisar
   cualquier cambio.

---

## 3. STACK TECNOLÓGICO

### 3.1 Sistema A — MoviLease (este repositorio)

**`package.json` real, sin añadidos:**

```json
"dependencies": {
  "@supabase/ssr": "^0.12.3",
  "@supabase/supabase-js": "^2.110.9",
  "framer-motion": "^12.42.2",
  "next": "^15.5.22",
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "server-only": "^0.0.1",
  "zod": "^4.4.3"
},
"devDependencies": {
  "@tailwindcss/postcss": "^4",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "eslint": "^9",
  "eslint-config-next": "^15.5.22",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

- **Framework:** Next.js 15.5 con **App Router** y React 19.
- **Lenguaje:** TypeScript en modo `strict` (`tsconfig.json`), alias `@/*` → `./src/*`.
- **Estilos:** **Tailwind CSS v4** — `@import "tailwindcss"` + `@theme inline`
  dentro de `src/app/globals.css`. **NO existe `tailwind.config.js` y no debe
  crearse**: en la v4 la configuración vive en el CSS.
- **PostCSS:** solo `@tailwindcss/postcss` (`postcss.config.mjs`).
- **Animación:** `framer-motion` v12, usado con cuentagotas (§9).
- **Validación:** `zod` v4 (`src/lib/validations/lead.ts`).
- **Base de datos / auth / storage:** Supabase (`@supabase/ssr` para SSR con
  cookies, `@supabase/supabase-js` para el cliente admin).
- **`server-only`:** marca módulos que fallan el build si se importan desde
  cliente (`lib/brand.ts`, `lib/auth.ts`, `lib/data/*`, `lib/supabase/admin.ts`,
  `lib/notifications/*`).
- **Linter:** ESLint 9 con `next/core-web-vitals` + `next/typescript`.
- **Tests:** **no hay ninguno.** No existe Jest, Vitest ni Playwright. La
  verificación es `npm run lint` + `npm run build`.
- **CI:** **no hay `.github/`.** No hay GitHub Actions. No hay `vercel.json`.

**Herramientas auxiliares fuera de `package.json`** (se ejecutan a mano):

- **Python 3** con `requests` — scripts de catálogo (`scripts/*.py`).
- **Node + `sharp`** — tratamiento de imágenes (`scripts/*.mjs`). `sharp` no
  está en `package.json`: hay que instalarlo aparte si se usan esos scripts.
- **ffmpeg** — `scripts/build-section-video.mjs`.

### 3.2 Sistema B — quierorenting.es, laponce.es, adridaganzo.com

- HTML5 escrito a mano. **Cero dependencias, cero build.**
- CSS y JavaScript **inline** en cada `.html`.
- Fuentes desde Google Fonts.
- Fotos de quierorenting.es: carpeta local `fotos/` (80 imágenes) más algunas
  de `fotos.quecochemecompro.com`.
- Servicios externos que sí usan: **Web3Forms** (email) y **API de Telegram**
  (notificación), llamados **desde el navegador** (esto es un problema serio,
  ver §7.2).

---

## 4. ESTRUCTURA DEL PROYECTO (MoviLease)

### 4.1 Árbol real

```
movilease/
├── AGENTS.md                  # aviso: "este NO es el Next.js que conoces"
├── CLAUDE.md                  # una línea: @AGENTS.md
├── README.md                  # el de create-next-app, sin personalizar
├── .env.example               # plantilla de variables (sin valores)
├── next.config.ts             # redirección www + config de imágenes
├── eslint.config.mjs
├── postcss.config.mjs
├── tsconfig.json
├── package.json
├── .claude/launch.json        # config de depuración (rutas de Windows)
├── docs/
│   ├── PROMPT-WEBS.md         # traspaso corto de las 4 webs (con 1 error, ver §1)
│   └── HANDOFF-MAESTRO.md     # este documento
├── public/                    # ~180 archivos, ~8 MB
│   ├── logo.svg / logo.png    # logo MoviLease
│   ├── brand/movilease-logo.png
│   ├── brands/                # 28 logos de marca (svg/png, ≤240 px)
│   ├── coches-nuevos/         # 139 fotos .webp de las fichas
│   ├── img/                   # 3 fondos (popup, quiénes somos, carretera)
│   ├── videos/                # 10 archivos: 4 vídeos + pósters
│   └── *.webp                 # fondos de sección (hero, ofertas, contacto…)
├── scripts/                   # gestión del catálogo (Python + Node)
│   ├── _env.py                # carga .env.local sin python-dotenv
│   ├── add_vehicle.py         # ALTA/ACTUALIZACIÓN de un coche  ← el importante
│   ├── ficha_a_sql.py         # misma alta, pero como SQL para pegar en Supabase
│   ├── _fichas_drive.py       # genera fichas JSON desde las láminas del Drive
│   ├── galerias_quecoche.py   # rellena galerías desde quecochemecompro.com
│   ├── build-galleries.mjs    # arma el bloque "images" de una ficha
│   ├── slice-photo-sheet.mjs  # trocea hojas de contacto del Drive
│   ├── build-section-video.mjs
│   ├── optimize-brand-logos.mjs
│   ├── generate-catalog-seed.mjs  # catálogo de quierorenting.es → SQL
│   ├── seed_db.py / upload_images.py / mark_all_featured.py
│   ├── _posts_iniciales.py / _posts_tanda2.py  # los 9 artículos del blog
│   └── fichas/*.json          # 20 fichas de coche en formato propio
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init.sql      # esquema completo + RLS + storage
│   │   ├── 0002_grants.sql    # GRANT de tabla (imprescindible, ver §5.6)
│   │   ├── 0003_lead_fields.sql
│   │   └── 0004_vehicle_detail_fields.sql  # vehicle_pricing + campos de ficha
│   ├── seed.sql
│   ├── seed_catalog_real.sql  # catálogo semilla desde quierorenting.es
│   └── alta_seat_leon.sql     # alta generada, PENDIENTE DE EJECUTAR (§14)
└── src/
    ├── middleware.ts          # solo protege /admin/:path*
    ├── app/
    │   ├── layout.tsx         # fuentes, metadatos globales, verificación GSC
    │   ├── globals.css        # 911 líneas — TODO el sistema de diseño
    │   ├── sitemap.ts  robots.ts  opengraph-image.tsx
    │   ├── error.tsx  not-found.tsx  favicon.ico
    │   ├── (public)/          # web pública
    │   │   ├── layout.tsx     # Header + Footer + WhatsApp + popup + cookies
    │   │   ├── page.tsx       # HOME (910 líneas, ~11 secciones)
    │   │   ├── [slug]/page.tsx        # ficha de modelo O landing (813 líneas)
    │   │   ├── catalogo/page.tsx      # catálogo y vistas por marca (508)
    │   │   ├── blog/page.tsx  blog/[slug]/page.tsx
    │   │   ├── calculadora/  comparador/  favoritos/
    │   │   ├── contacto/  sobre-nosotros/
    │   │   ├── renting-empresas/  renting-autonomos/
    │   │   └── aviso-legal/  politica-privacidad/  politica-cookies/
    │   ├── admin/             # panel (login funciona, el resto son stubs)
    │   │   ├── login/page.tsx
    │   │   └── (dashboard)/   # page, vehiculos, modelos, marcas, leads,
    │   │                      # blog, seo, usuarios  ← TODOS "Fase 4"
    │   └── api/
    │       ├── leads/route.ts           # POST JSON → createLead
    │       ├── revalidate/route.ts      # POST protegido por secreto
    │       └── favorites/resolve/route.ts
    ├── components/
    │   ├── layout/    Header, Footer, WhatsAppButton
    │   ├── home/      HeroVideo, HeroContent, HeroCanvas, HeroImage,
    │   │              FAQAccordion, LeadPopup, CookieBanner
    │   ├── vehicles/  VehicleCard, VehicleGallery, VehiclePricingTable,
    │   │              FavoriteButton, CompareButton, ComparisonBar,
    │   │              FavoritosClient
    │   ├── catalog/   BrandCard
    │   ├── forms/     LeadForm
    │   ├── calculator/RentingCalculator
    │   ├── blog/      Markdown
    │   ├── seo/       JsonLd  (8 generadores de datos estructurados)
    │   ├── ui/        Button, Container, Logo, Reveal, Parallax, VideoBackdrop
    │   └── admin/     Sidebar
    ├── hooks/         useLocalStorageIds, useFavorites, useComparison
    ├── lib/
    │   ├── brand.ts           # multi-dominio (BRANDS, resolveBrand)
    │   ├── constants.ts       # CONTACT, etiquetas de enums, RENTING_DEFAULTS
    │   ├── metadata.ts        # pageMetadata() ← usar SIEMPRE
    │   ├── utils.ts           # formatPriceFromCents
    │   ├── auth.ts            # getCurrentProfile, requireRole
    │   ├── brand-logos.ts     # nombre de marca → /brands/<slug>.<ext>
    │   ├── supabase/          # server.ts, client.ts, admin.ts, middleware.ts
    │   ├── data/              # vehicles.ts, blog.ts, landing.ts  (server-only)
    │   ├── actions/leads.ts   # Server Action createLead
    │   ├── validations/lead.ts
    │   └── notifications/     # web3forms.ts, telegram.ts, types.ts
    ├── scripts/               # ⚠️ carpeta HEREDADA con scripts Python viejos
    └── types/database.types.ts # tipos de la BD, ESCRITOS A MANO
```

### 4.2 Qué hace cada carpeta

- **`src/app/(public)/`** — todo lo que ve el visitante. El grupo de rutas
  `(public)` no aparece en la URL; existe solo para que estas páginas
  compartan `layout.tsx` (header, footer, botón de WhatsApp, pop-up, banner
  de cookies).
- **`src/app/admin/`** — panel interno. Login real contra Supabase Auth; las
  páginas del dashboard son **maquetas con el control de rol ya puesto**,
  a la espera de la "Fase 4".
- **`src/lib/data/`** — la única capa que habla con la base de datos para
  contenido público. **Regla firme: nunca lanza excepciones.** Si Supabase no
  responde, devuelve `[]` o `null` y la página se degrada.
- **`src/components/`** — presentación. Los componentes de servidor son los
  que no llevan `"use client"`.
- **`scripts/`** — la herramienta real de gestión del catálogo hoy.
- **`supabase/migrations/`** — el esquema. Se aplican por orden numérico.

### 4.3 Archivos críticos (tocar con cuidado)

| Archivo | Por qué es delicado |
|---|---|
| `src/app/globals.css` | 911 líneas. Es **todo** el sistema de diseño. Un cambio aquí afecta a todas las páginas. |
| `src/lib/supabase/server.ts` | Elegir mal el cliente rompe producción (§5.3). |
| `src/lib/data/vehicles.ts` | 509 líneas. Alimenta home, catálogo, fichas, sitemap y menú. |
| `src/app/(public)/[slug]/page.tsx` | Catch-all: ficha de modelo, landing o 404. Cambiar la lógica de resolución puede tirar 72 URLs. |
| `src/types/database.types.ts` | Escrito a mano. Ver el aviso `type` vs `interface` dentro del propio archivo. |
| `supabase/migrations/*` | Ya aplicadas en producción. **Nunca se editan: se añade una migración nueva.** |
| `next.config.ts` | La redirección www y los orígenes de imagen permitidos. |
| `src/middleware.ts` | Su `matcher` cubre solo `/admin`. Ampliarlo haría que la web pública dependa de Supabase para renderizar. |

---

## 5. ARQUITECTURA Y FUNCIONAMIENTO (MoviLease)

### 5.1 Multi-marca por dominio

`src/lib/brand.ts`:

```ts
export const BRANDS = {
  "movilease.es":     { name: "MoviLease",     domain: "movilease.es",     description: "Renting de coches para particulares sin complicaciones. Sin entrada, todo incluido, gestión en 48h." },
  "quierorenting.es": { name: "QuieroRenting", domain: "quierorenting.es", description: "Renting de coches para particulares desde 264€/mes. Sin entrada, seguro incluido, gestión en 48h." },
} as const;

export const DEFAULT_BRAND_DOMAIN = "movilease.es";
export function resolveBrand(host)       // normaliza, quita www y puerto, cae en el default
export async function getCurrentBrand()  // server-only, lee headers().get("host")
```

Las dos marcas comparten catálogo, base de datos y lógica; **solo cambian
nombre y descripción**. Donde no hay request de la que leer el host
(`sitemap.ts`, `robots.ts`, panel) se usa `DEFAULT_BRAND_NAME` / `SITE_URL`
de `src/lib/constants.ts`.

**Estado real:** solo movilease.es está apuntando a esta aplicación. La
entrada de quierorenting.es está lista pero inactiva (§2.2).

### 5.2 Rutas

**Públicas** — `src/app/(public)/`:

| Ruta | Archivo | Revalidación (ISR) |
|---|---|---|
| `/` | `page.tsx` | `revalidate = 3600` |
| `/catalogo` | `catalogo/page.tsx` | `revalidate = 900` |
| `/[slug]` | `[slug]/page.tsx` | `revalidate = 1800` |
| `/blog` | `blog/page.tsx` | `revalidate = 1800` |
| `/blog/[slug]` | `blog/[slug]/page.tsx` | `revalidate = 3600` + `generateStaticParams` |
| `/calculadora`, `/comparador`, `/favoritos` | herramientas de cliente (localStorage) | — |
| `/contacto`, `/sobre-nosotros`, `/renting-empresas`, `/renting-autonomos` | landings | — |
| `/aviso-legal`, `/politica-privacidad`, `/politica-cookies` | legales | — |

`/[slug]` es un **catch-all deliberado** en la raíz. Su orden de resolución:

1. ¿Existe un modelo activo con ese slug **y con vehículos activos**? → ficha de modelo.
2. ¿Existe una `landing_page` activa con ese slug? → landing SEO.
3. Si no → `notFound()` (404).

**Un modelo sin vehículos activos devuelve 404, no una página vacía.** Se
decidió al retirar el SEAT Arona y el Opel Combo por falta de stock: sus URLs
devolvían 200 con una ficha sin precio ni fotos. Si vuelve el stock, basta con
reactivar el vehículo — la URL es la misma.

Los slugs de modelo tienen la forma **`renting-<marca>-<modelo>`**
(p. ej. `/renting-seat-ibiza`, `/renting-volkswagen-taigo`).

**Panel** — `src/app/admin/`: `login` funcional + `(dashboard)` con
`page`, `vehiculos`, `modelos`, `marcas`, `leads`, `blog`, `seo`, `usuarios`.
**Todas las páginas del dashboard son stubs** que dicen "Fase 4", pero **cada
una ya llama a `requireRole([...])` con los roles correctos**, así que la
protección funciona hoy.

**API:**

- `POST /api/leads` — envoltorio JSON sobre la Server Action `createLead`.
- `POST /api/revalidate` — invalidación ISR bajo demanda, protegida por la
  cabecera `x-revalidate-secret`.
- `POST /api/favorites/resolve` — resuelve IDs de favoritos (localStorage)
  contra la BD para devolver precio y disponibilidad al día.

**Middleware** (`src/middleware.ts`): `matcher: ["/admin/:path*"]`. A
propósito: **la web pública no debe depender de que exista un Supabase
configurado para renderizar.**

### 5.3 Los tres clientes de Supabase — elegir mal rompe producción

| Cliente | Archivo | Cuándo usarlo |
|---|---|---|
| `createClient()` | `lib/supabase/server.ts` | Cuando hace falta la sesión del usuario (panel). Usa `cookies()`. |
| `createPublicClient()` | `lib/supabase/server.ts` | **Contenido público idéntico para todos.** No toca cookies. |
| `createAdminClient()` | `lib/supabase/admin.ts` | Service role, se salta RLS. Solo servidor. Hoy solo para insertar leads. |

**El fallo histórico que hay que no repetir:** usar el cliente con cookies en
una página que tiene `generateStaticParams` hace que producción reviente con
*"Page changed from static to dynamic at runtime, reason: headers"*. Pasó con
los artículos del blog (commit *"Arreglar el 500 de los artículos en
producción: cliente sin cookies"*, 07/08/2026) y por eso `lib/data/blog.ts`
usa `createPublicClient()`.

> **Deuda técnica conocida:** `lib/data/vehicles.ts` y `lib/data/landing.ts`
> **siguen usando `createClient()` (con cookies)**. Hoy no rompe nada porque
> ninguna página de catálogo/ficha usa `generateStaticParams`. **Si algún día
> se añade `generateStaticParams` a `/[slug]` o a `/catalogo`, hay que migrar
> esos módulos a `createPublicClient()` ANTES**, o producción devolverá 500.

### 5.4 Cómo se resuelven marca y modelo

`src/types/database.types.ts` está escrito a mano y **no tiene metadatos
`Relationships`**, así que los embeds de PostgREST (`models(...)`) no
funcionan. Marca y modelo se resuelven con **dos consultas planas + un join en
memoria** (`attachModelsAndBrands` en `lib/data/vehicles.ts`). No es un
descuido: es la consecuencia de no haber generado los tipos con
`supabase gen types typescript`.

### 5.5 Esquema de base de datos

Tablas (`supabase/migrations/0001_init.sql` + 0003 + 0004):

`profiles` · `brands` · `models` · `vehicles` · `vehicle_images` ·
`vehicle_pricing` · `leads` · `blog_posts` · `seo_metadata` ·
`landing_pages` · `redirects`

**Tabla `vehicles` (la central):**

```sql
id                   uuid pk
model_id             uuid not null → models(id) on delete cascade
version              text not null
version_slug         text not null
category             vehicle_category not null     -- turismo|suv|hibrido|furgoneta|4x4|diesel
fuel_type            fuel_type not null            -- gasolina|hibrido|electrico|diesel|phev
transmission         transmission_type not null    -- manual|automatico
monthly_price_cents  integer not null check (> 0)  -- ← EL PRECIO, EN CÉNTIMOS
contract_months      integer not null default 36
annual_km            integer not null default 15000
horsepower           integer
consumption_value    numeric(5,2)
consumption_unit     text default 'l/100km'
seats, doors         integer
main_image_url       text
is_featured          boolean not null default false   -- sale en "Destacados" de la home
is_offer             boolean not null default false   -- muestra la píldora "Oferta"
badge_text           text
short_description    text
description          text
included_services    text[] not null default [5 servicios]
stock_status         text not null default 'available'
is_active            boolean not null default true    -- ← false = desaparece de la web
environmental_label  environmental_label              -- '0'|'eco'|'c'|'b'
colors               text[]
body_type            text
equipment            text[] not null default '{}'
created_by, created_at, updated_at
unique (model_id, version_slug)
```

**Tabla `vehicle_pricing`** (la tabla de cuotas de la ficha):

```sql
unique (vehicle_id, contract_months, annual_km)
monthly_price_cents integer not null check (> 0)
```

Una fila por celda de la tabla plazo × kilometraje. **Si un vehículo no tiene
filas aquí, la ficha no muestra la tabla** y cae al precio único de
`vehicles.monthly_price_cents`.

Enums en SQL, **etiquetas en `src/lib/constants.ts`**: añadir un valor obliga
a tocar **los dos sitios** (migración + constantes + `database.types.ts`).

### 5.6 Seguridad de la base de datos

- **RLS activo en todas las tablas**, con el helper `current_role_is(roles)`.
- Lectura pública (`using (true)` o equivalente) en `brands`, `models`,
  `vehicles`, `vehicle_images`, `vehicle_pricing`, `seo_metadata`,
  `landing_pages`, `blog_posts` (solo `published`).
- `leads`: **inserción anónima permitida**, lectura solo para staff.
- **RLS no sustituye al `GRANT` de tabla.** Por eso existe `0002_grants.sql`:
  sin `GRANT`, Postgres deniega antes de evaluar la política. **Toda tabla
  nueva necesita las dos cosas** (mira cómo lo hace `0004` con
  `vehicle_pricing`).
- Triggers: `prevent_role_self_escalation` (nadie se sube el rol a sí mismo) y
  `handle_new_auth_user` (crea el perfil con el rol más restrictivo).
- Storage: bucket público `vehicle-images`, escritura solo para
  `admin` / `catalog_editor`.

### 5.7 Roles del panel

| Rol | Etiqueta | Acceso |
|---|---|---|
| `admin` | Administrador | Todo |
| `catalog_editor` | Editor de catálogo | Vehículos, modelos, marcas, blog, SEO |
| `leads_viewer` | Solo lectura de clientes | Leads |

---

## 6. MOVILEASE — CONTEXTO FUNCIONAL Y DE NEGOCIO

### 6.1 Objetivo y público

- **Qué vende:** renting de coches **nuevos**, sin entrada, con todo incluido
  en una cuota mensual, entrega en toda España.
- **Público:** principalmente **particulares**; también autónomos y pequeñas
  empresas (hay landings específicas: `/renting-autonomos`,
  `/renting-empresas`).
- **Promesa comercial repetida en toda la web:** *sin entrada · seguro a todo
  riesgo, mantenimiento e impuestos incluidos · respuesta en 48 h laborables ·
  entrega a domicilio*.
- **Conversión:** el objetivo real de cada página es que el visitante deje
  **nombre + teléfono** o abra **WhatsApp**.

### 6.2 Branding

- **Nombre:** MoviLease. **Slogan: "Hazlo fácil. Hazlo MoviLease."**
  (aparece en el titular del hero; antes estaba en pequeño en el header y se
  subió a grande a propósito — commit del 30/07/2026).
- **Logo:** `public/logo.svg` (vectorial, texto "MOVILEASE" en azul marino) y
  `public/logo.png`. Se pinta con `src/components/ui/Logo.tsx`:
  - `variant="color"` → en el header (banda blanca).
  - `variant="white"` → sobre fondo oscuro; **se consigue con el filtro CSS
    `brightness(0) invert(1)`, no con un segundo SVG**.
  - Se usa `<img>` normal, **no `next/image`**: el optimizador bloquea SVG
    salvo `dangerouslyAllowSVG`, que no hace falta aquí.
- **Instagram:** `@quierorenting` (`https://www.instagram.com/quierorenting`)
  — sí, el de la marca antigua; es el que hay.
- **Email:** `contacto@movilease.es`.
- **Teléfono / WhatsApp:** `+34 613 26 73 75`.

### 6.3 Paleta y sistema visual (todo en `src/app/globals.css`)

**Colores de marca:**

| Token | Valor | Uso |
|---|---|---|
| `--blue` | `#0068FF` | Azul MoviLease. Botones, acentos, badges. |
| `--blue-light` | `#5AA0FF` | **Azul para TEXTO sobre fondo oscuro.** `#0068FF` sobre `#071A3D` solo llega a 3,1:1 y no pasa AA; este llega a 5,6:1. |
| `--dark` | `#0B2A5E` | Fondo base (también el `themeColor` del navegador). |
| `--dark-2 / -3 / -4` | `#10306B` / `#16407F` / `#2358B4` | Escala de azules oscuros. |
| `--ink` | `#0A0A0A` | Texto principal sobre fondo claro. |
| `--ink-light` | `#5B6472` | Texto secundario sobre claro. |
| `--whatsapp` | `#25D366` | Verde WhatsApp (hover `#1DA851`). |

**Texto sobre oscuro:** `--on-dark-1` (blanco), `--on-dark-2` (86 %),
`--on-dark-3` (72 %), `--on-dark-ornament` (30 %). **La jerarquía se hace por
tamaño y peso, no bajando opacidades hasta lo ilegible.** Las opacidades
subieron de 74/58 a 86/72 precisamente porque sobre `surface-graphite`
(#2358B4) no pasaban AA.

**Superficies:** `.surface-black` (#0B2A5E) · `.surface-dark` (#10306B) ·
`.surface-graphite` (degradado #2358B4→#133A78) · `.surface-carbon`
(degradado #2A62BE→#16407F→#0B2A5E) · `.card-dark` · `.glass` · `.glass-dark` ·
`.bg-texture-light` / `.bg-texture-dark` · `.ambient-blue` / `.ambient-blue-top`.

**Tipografía** (cargada con `next/font/google` en `src/app/layout.tsx`):

- **Space Grotesk** — display/titulares (`--font-space-grotesk`).
- **Inter** — texto (`--font-inter`).
- Pesos 400/500/600/700. **El 300 se quitó a propósito**: no se usaba en
  ningún sitio y eran dos archivos de fuente menos en la primera visita.
- Clases: `.display-xl/lg/md/sm`, `.body-lg/md/sm`, `.section-label`,
  `.eyebrow`.

**Ritmo:** `.section-y` (padding vertical grande) · `.section-y-sm` ·
`.section-head` (margen inferior del encabezado de sección).

**Botones:** `.btn-primary` · `.btn-ghost` · `.btn-white` · `.btn-whatsapp`,
combinables con `.btn-lg`, `.btn-sm`, `.btn-block`.

**Formularios:** `.input-glass` (sobre oscuro) · `.input-light` (sobre claro) ·
`.form-label`.

**Movimiento:** todo comparte `--easing-premium: cubic-bezier(.16,1,.3,1)` y
**anima solo `transform` y `opacity`**. `prefers-reduced-motion` está
respetado en **todas** las animaciones — si añades una, añade su excepción.

**Costumbre del proyecto que hay que mantener:** las decisiones de color
llevan la **ratio de contraste medida** escrita en el comentario. La web se ha
ido midiendo, no estimando.

### 6.4 Estructura de la home (`src/app/(public)/page.tsx`, 910 líneas)

En orden:

1. **HERO** — pantalla completa, vídeo de fondo (`/videos/hero.mp4`), titular
   con el slogan, CTA.
2. **STATS** — `+10.000` clientes · `4.9` valoración Google · `+30` marcas ·
   `48h` gestión. Números animados (`AnimatedCounter`).
   **NO CONFIRMADO — REQUIERE REVISIÓN:** son afirmaciones de marketing, no
   datos calculados. No las cambies sin preguntar.
3. **MARQUEE** — cinta con 18 nombres de marca (array `MARQUEE_BRANDS`,
   escrito a mano, **no sale de la BD**).
4. **OFERTAS** (`#ofertas`) — fondo claro `#F4F6FA` con la foto del BMW
   (`hero-car.webp`). **6 ofertas**, en rejilla de 3 columnas. La constante
   `OFERTAS_VIDEO = false` desactiva el vídeo de fondo: es una **decisión de
   contenido**, no un fallo; el vídeo y su script siguen ahí por si se retoma.
5. **MARCAS** (`#marcas`) — todas las marcas del catálogo con `BrandCard`.
6. **DESTACADOS** (`#catalogo`) — "Selección de la semana", vehículos con
   `is_featured = true`, sobre `surface-graphite` con vídeo de fondo.
   La consulta pide `getFeaturedVehicles(200)`, se **deduplica por modelo** y
   se **corta a 8**. Las ofertas son `getOfferVehicles(6)`, también
   deduplicadas por modelo.
7. **PROCESO** (`#por-que`) — 4 pasos (`HOW_STEPS`): elige · solicita ·
   gestionamos · disfruta.
8. **INCLUIDO** (`#incluido`) — 8 tarjetas (`INCLUDED`) con lo que entra en la
   cuota. Se creó como sección propia porque *"es el argumento de venta
   principal del renting"* y antes solo se contaba de pasada.
9. **COMPARATIVA** — tabla MoviLease vs concesionario (`COMPARISON`, 7 filas).
10. **TESTIMONIOS** — 6 reseñas (`TESTIMONIALS`) con nombre y coche.
    **NO CONFIRMADO — REQUIERE REVISIÓN** si son reseñas reales de Google.
11. **FAQ** (`#faq`) — 6 preguntas (`FAQ_ITEMS`) + `FaqJsonLd`.
12. **CTA FINAL** — copy + `LeadForm` sobre `#071A3D`.

Los textos de las secciones están **como constantes al principio del archivo**
(`STATS`, `HOW_STEPS`, `INCLUDED`, `COMPARISON`, `TESTIMONIALS`,
`FAQ_ITEMS`). **Los precios NO están en el JSX: salen de la base de datos.**

### 6.5 IVA y precios — cómo funciona de verdad

**Esto es importante y contraintuitivo:**

- **No existe ningún cálculo de IVA en el código.** No hay una constante del
  21 %, ni una multiplicación, ni una columna `price_without_vat`.
- **El precio guardado en `vehicles.monthly_price_cents` y en
  `vehicle_pricing.monthly_price_cents` es la cuota final, con el IVA ya
  incluido**, tal y como viene en la lámina del proveedor.
- La web se limita a **declararlo por escrito** en los sitios donde el
  visitante lo necesita saber:
  - `[slug]/page.tsx:389` → `IVA incluido` bajo la cuota.
  - `[slug]/page.tsx:436` → `IVA incluido en todos los precios.`
  - `[slug]/page.tsx:207` → FAQ generada: *"Desde X € al mes con IVA incluido
    y sin entrada…"*.
  - `catalogo/page.tsx:276` → *"Todas las cuotas van con el IVA incluido"*.
  - `page.tsx:94` y `page.tsx:187` → sección "Precios transparentes" y FAQ.
- El único sitio donde el IVA se menciona como **concepto fiscal** es
  `/renting-autonomos` (*"¿Puedo deducirme el IVA y el gasto del renting?"*).

**Regla práctica: para cambiar un precio se cambia el número de la cuota
final. No hay nada que recalcular.**

**Formato:** `formatPriceFromCents()` en `src/lib/utils.ts` usa
`Intl.NumberFormat("es-ES", { style:"currency", currency:"EUR",
maximumFractionDigits: 0 })`. Es decir: **céntimos en la BD → "264 €" en
pantalla**, sin decimales. `30300` → `303 €`.

**Condiciones de referencia** (`RENTING_DEFAULTS` en `lib/constants.ts`):

```ts
contractMonths: 36,
annualKm: 10000,          // se bajó de 15.000 a 10.000 el 06/08/2026
includedServices: ["Seguro a todo riesgo", "Mantenimiento",
                   "Asistencia 24h", "Impuesto de circulación", "Neumáticos"]
```

⚠️ **Inconsistencia real detectada:** `RENTING_DEFAULTS.annualKm` es `10000`,
pero el **default de la columna `vehicles.annual_km` en SQL sigue siendo
`15000`**, igual que el default de `add_vehicle.py` y `ficha_a_sql.py`. Las
fichas nuevas traen su `annual_km` explícito, así que en la práctica no da
problema, pero **si das de alta un coche sin especificar `annual_km`, saldrá
15.000 km/año y la web dirá 10.000 en otros sitios**. Especifícalo siempre.

### 6.6 CTAs y captación

Los puntos de conversión, por orden de agresividad:

1. **Botón flotante de WhatsApp** — en todas las páginas públicas
   (`WhatsAppButton`, esquina inferior derecha).
2. **Botón "Lo quiero"** en cada `VehicleCard` → WhatsApp con mensaje
   prerellenado con marca, modelo y precio.
3. **`LeadPopup`** — se abre con lo que ocurra antes: **10 % de scroll**,
   **intención de salida** (puntero sale por arriba) o **5 segundos**.
   Silenciado en `/contacto` y `/favoritos`. Una vez por sesión
   (`sessionStorage`, clave `qr_popup_v4`).
   **Los 5 segundos los pidió Adrián expresamente**; está documentado en el
   propio componente que si sube el ratio de cierres sin rellenar, ese número
   es lo primero que hay que subir.
4. **`LeadForm`** — en la home (CTA final), en `/contacto` y en cada ficha de
   modelo.
5. **CTA de cierre del catálogo** — *"¿No encuentras el X que buscas?"* con
   WhatsApp + enlace a `/contacto`.

---

## 7. QUIERO RENTING — CONTEXTO FUNCIONAL Y DE NEGOCIO

> **Léelo entero antes de tocar nada de quierorenting.es. No es este
> repositorio.**

### 7.1 Qué es exactamente

Un **único archivo HTML de 133.382 bytes** servido desde Vercel. Sin
framework, sin build, sin bundle. Verificado el 01/09/2026.

- **Título:** *"Quiero Renting | Renting de Coches para Particulares desde
  264€/mes · Sin Entrada"*
- **Color de marca: verde `#18a05a`** (`<meta name="theme-color">`).
  **Nada que ver con el azul de MoviLease.** No mezcles paletas.
- **Email publicado:** `quierorenting@outlook.es`
- **Teléfono/WhatsApp:** `34613267375` (5 enlaces `wa.me` en la página)
- **Instagram/Twitter:** `@quierorenting`
- **JSON-LD:** `AutoDealer` (nombre, teléfono, email, `areaServed: España`)
- **Fotos:** 80 imágenes locales en `fotos/` + algunas de
  `fotos.quecochemecompro.com` (la imagen de Open Graph apunta ahí).
- **1 bloque `<style>` y 9 bloques `<script>`, todos inline.**
- **Sin analítica de ningún tipo**: no hay GA4, GTM ni Meta Pixel.

### 7.2 🚨 PROBLEMA CRÍTICO DE SEGURIDAD — LEER ANTES QUE NADA

**Las credenciales de Web3Forms y del bot de Telegram están escritas en texto
plano dentro del HTML público de quierorenting.es** (líneas ~1849-1851):

```js
var W3F_KEY    = '…';   // clave de Web3Forms — PÚBLICA
var TG_TOKEN   = '…';   // token del bot de Telegram — PÚBLICO
var TG_CHAT_ID = '…';   // chat id — PÚBLICO
```

Cualquiera que abra "ver código fuente" las tiene. Con el token de Telegram se
puede leer y escribir en ese bot; con la clave de Web3Forms se puede enviar
correo en nombre del formulario.

**No las copies a ningún sitio, no las pegues en un chat y no las publiques.**

**Qué hay que hacer (recomendación, requiere decisión del cliente):**

1. **Rotar las tres credenciales inmediatamente** (regenerar el bot en
   BotFather y la clave en Web3Forms).
2. Mover el envío a un endpoint de servidor. La vía natural es **apuntar el
   formulario a `POST https://movilease.es/api/leads`**, que ya hace
   exactamente esto con las claves a salvo en el servidor: valida, guarda en
   Supabase, notifica por email y Telegram, y tiene honeypot.
   Habría que permitir CORS desde quierorenting.es en esa ruta.
3. Como mínimo, si no se toca la arquitectura: que el formulario **solo abra
   WhatsApp**, como hace el modal de adridaganzo.com.

**Nota:** las claves de MoviLease (este repositorio) **no** tienen este
problema: viven en variables de servidor sin prefijo `NEXT_PUBLIC_` y nunca
llegan al navegador.

### 7.3 Cómo recuperar el código de quierorenting.es

Mientras no exista repositorio, el HTML servido **es** el código fuente:

```bash
mkdir -p quierorenting/fotos && cd quierorenting
curl -s https://quierorenting.es/ -o index.html
grep -oE 'fotos/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)' index.html | sort -u \
  | while read -r f; do curl -s "https://quierorenting.es/$f" -o "$f"; done
curl -s -O https://quierorenting.es/robots.txt
curl -s -O https://quierorenting.es/sitemap.xml
```

Después, crear un repo, subirlo y conectarlo al proyecto de Vercel. Un sitio
HTML estático en Vercel **no necesita configuración**: se conecta el repo y se
sirve la raíz. Sin `package.json`, sin comando de build.

Comprueba con la pestaña *Network* del navegador que no falta ningún asset no
enlazado en el HTML (iconos, imágenes de OG).

### 7.4 Catálogo de quierorenting.es

Es un array JavaScript **escrito a mano dentro del HTML**, en la línea ~1122:

```js
const CARS = [
  {b:'SEAT', m:'Ibiza', s:'1.0 MPI 70kW 80CV', t:'Compacto', fuel:'Gasolina',
   g:'Manual', p:264, cv:80, cons:'5.5L/100km', plazas:5,
   img:'fotos/seat-ibiza.jpg', cat:'turismo', feat:false, badge:null},
  …
];
```

**80 coches, 28 marcas.** Campos: `b` marca · `m` modelo · `s` versión ·
`t` tipo · `fuel` combustible · `g` cambio · **`p` precio en euros enteros
(no céntimos)** · `cv` potencia · `cons` consumo · `plazas` · `img` ruta de
foto · `cat` categoría · `feat` destacado · `badge` etiqueta · `oferta`.

Marcas por número de modelos: Volkswagen (9), Renault (7), Mazda (6),
Toyota (5), Peugeot (4), KGM (4), Škoda/Subaru/Opel/Omoda/Nissan/Hyundai/
Ford/Ebro/Citroën (3), SEAT/MG/MAXUS/Jeep/Jaecoo (2), y una cada uno
Mitsubishi, Kia, Foton, Fiat, Dacia, Cupra, Audi, Alfa Romeo.

Secciones de la página: `#mas-vendidos`, `#ofertas`, `#catalogo`, más un
banner de cookies (`#cookie-banner`), un modal de detalle (`#modal-box`) y el
formulario de captación (`#lp-form`).

**Para añadir un coche a quierorenting.es** hay que editar el array `CARS`
dentro del `index.html` y subir la foto a `fotos/`. No hay base de datos.

### 7.5 laponce.es y adridaganzo.com (resumen operativo)

Documentación completa en `docs/PROMPT-WEBS.md` §3. Resumen y **estado
reconfirmado el 01/09/2026**:

**laponce.es** — página única (~105 KB) de conciertos de música urbana en Oh
My Club (Madrid). Secciones `#evento`, `#artistas`, `#galeria`, `#nosotros`.
Paleta caribeña (`--teal #00E5B5`, `--sunset #FF6B35`, `--gold #FFBB3D` sobre
`--dk #010C18`). Tipografía Space Grotesk. JS a mano: partículas en canvas,
cuenta atrás, lightbox, menú móvil y un **chat simulado** que no habla con
ningún servidor.

> 🐞 **BUG VIVO, CONFIRMADO HOY:** el array `EVENTS` termina el
> **24/06/2026** (último evento: Darell). Como no hay ninguna fecha futura,
> `EVENTS.find(...) || EVENTS[EVENTS.length-1]` cae en el último, el `diff`
> sale negativo y **el contador lleva más de dos meses en 00:00:00:00**.
> El `<title>` sigue diciendo *"La Ponce — Darell · 24 Jun · Madrid"*.
> **Antes de arreglarlo hay que preguntar las fechas reales. No te las
> inventes.** Para publicar un evento hay que tocar **cinco sitios del mismo
> archivo**: el array `EVENTS`, el `<title>`, la meta description, el JSON-LD
> `MusicEvent` y el flyer en `fotos/`, más el enlace de FourVenues.

**adridaganzo.com** — portfolio con una home enorme (~211 KB) y unas 35
landings de SEO local; **41 URLs en su `sitemap.xml`** (contadas hoy). Un
color por marca: `--ponce #ff2d75`, `--hype #00d4ff`, `--renting #22ff88`,
`--vip #a01838`, `--fc/--gold #c8a96e`.

> 🐞 **BUGS VIVOS, CONFIRMADOS HOY:**
> 1. **El formulario de contacto no envía nada.** Su `onsubmit` es literalmente
>    `event.preventDefault();alert('¡Gracias! Te respondo personalmente en
>    menos de 24h.');`. El visitante ve éxito y **el mensaje se pierde**. Es
>    una fuga silenciosa de clientes. (El modal `submitLead` sí funciona: abre
>    WhatsApp.)
> 2. **La analítica está sin configurar:** Google con `G-XXXXXXXXXX` (dos
>    apariciones) y el píxel de Meta con `fbq('init','0000000000000000')`.
>    Ambos son marcadores de posición: no se está midiendo nada, y los eventos
>    `Lead`, `Contact` e `InitiateCheckout` que dispara el código no llegan a
>    ninguna parte.

---

## 8. CATÁLOGO Y GESTIÓN DE VEHÍCULOS (MoviLease)

### 8.1 Dónde están los vehículos

**En Supabase, no en el código.** Tres tablas:

- `brands` → marca (nombre, slug, logo)
- `models` → modelo (pertenece a una marca; **su `slug` es la URL pública**)
- `vehicles` → **versión concreta** con su precio (una fila por versión)
- `vehicle_images` → galería de fotos de una versión
- `vehicle_pricing` → cuotas por plazo × kilometraje

**Estado en producción el 01/09/2026** (leído de `/catalogo` y `/sitemap.xml`):
**30 marcas · 73 vehículos · 72 fichas de modelo · 9 artículos de blog.**

Las fotos viven en `public/coches-nuevos/*.webp` (139 archivos) y se
referencian con **ruta relativa** (`/coches-nuevos/opel-corsa-01.webp`). El
bucket de Supabase Storage `vehicle-images` existe y está permitido en
`next.config.ts`, pero **hoy las fichas nuevas usan archivos del repo**.

### 8.2 El formato de ficha (`scripts/fichas/*.json`)

Hay 20 fichas de ejemplo. **`opel-corsa-gs.json` y
`seat-leon-15-tsi-fr-special-edition.json` son las mejores plantillas.**
(El `EJEMPLO.json` que menciona el docstring de `add_vehicle.py` **no existe**.)

```json
{
  "brand": "SEAT",
  "model": "León",
  "version": "1.5 TSI FR Special Edition",
  "category": "turismo",
  "fuel_type": "gasolina",
  "transmission": "manual",
  "monthly_price_cents": 35800,
  "contract_months": 48,
  "annual_km": 10000,
  "horsepower": 150,
  "seats": 5,
  "doors": 5,
  "environmental_label": "c",
  "colors": ["Gris Grafeno", "Gris Magnetic", "Negro Metalizado"],
  "body_type": "Hatchback",
  "short_description": "Acabado FR Special Edition con motor 1.5 TSI de 150 CV",
  "description": "Párrafo 1.\nPárrafo 2.\nPárrafo 3.",
  "equipment": ["Llantas de 18\"", "Suspensión deportiva", "…"],
  "included_services": [
    "Seguro a todo riesgo", "Mantenimiento y revisiones",
    "Neumáticos incluidos", "Asistencia 24h", "Averías y reparaciones",
    "ITV e impuestos", "Gestión de multas", "Entrega a domicilio",
    "Cambio de neumáticos"
  ],
  "images": [
    { "url": "/coches-nuevos/seat-leon-fr-01.webp",
      "alt": "SEAT León FR en renting — vista exterior delantera" }
  ],
  "pricing": [
    { "contract_months": 36, "annual_km": 10000, "monthly_price_cents": 35900 },
    { "contract_months": 48, "annual_km": 10000, "monthly_price_cents": 35800 }
  ]
}
```

**Campos obligatorios:** `brand`, `model`, `version`, `category`, `fuel_type`,
`transmission`, `monthly_price_cents`.

**Campos opcionales que la web oculta sola si faltan:** todos los demás.

**Campo especial:** `"update_vehicle_id": "<uuid>"` — si está presente,
`add_vehicle.py` **actualiza** ese vehículo en lugar de crear uno nuevo, sin
tocar `version` / `version_slug` / `model_id`, **para no romper la URL ya
publicada**.

**Valores válidos de los enums:**

| Campo | Valores |
|---|---|
| `category` | `turismo` `suv` `hibrido` `furgoneta` `4x4` `diesel` |
| `fuel_type` | `gasolina` `hibrido` `electrico` `diesel` `phev` |
| `transmission` | `manual` `automatico` |
| `environmental_label` | `0` `eco` `c` `b` |

### 8.3 Cómo se generan las URLs

- Slug de modelo: **`renting-<marca-slug>-<modelo-slug>`**
  → `SEAT` + `León` = `/renting-seat-leon`
- Slug de versión: `slugify(version)` → `1-5-tsi-fr-special-edition`
  (se guarda en `version_slug` y forma parte de la clave única
  `unique (model_id, version_slug)`, pero **la ruta `/[modelo]/[version]` aún
  no existe**: hoy todas las versiones se muestran dentro de la ficha del
  modelo).

### 8.4 Cómo se arma la ficha en pantalla

`getModelBySlugWithVehicles()` (en `lib/data/vehicles.ts`) devuelve el modelo
con **todas** sus versiones activas, ordenadas por una regla concreta:

> **La versión con ficha completa (galería real) encabeza la página del modelo
> aunque no sea la más barata; entre versiones igual de completas, gana la más
> barata.**

La versión que encabeza (`primary`) es la que aporta especificaciones,
galería, tabla de cuotas y FAQ. Las demás salen listadas debajo.

Las **FAQ de la ficha se generan con los datos reales del coche** (cuota,
plazo, kilometraje, servicios, número de versiones) — no son texto genérico —
y se publican también como `FAQPage` en JSON-LD.

### 8.5 Cómo se calculan los importes

**No se calcula nada.** Todos los importes son literales guardados en la BD:

- La cuota que se ve en la tarjeta y en el "desde" de la ficha es
  `vehicles.monthly_price_cents` de la versión más barata.
- La tabla de cuotas de la ficha (`VehiclePricingTable`) pinta directamente
  las filas de `vehicle_pricing`, agrupadas en una rejilla plazo × km.
- El "desde X €" de una marca en el catálogo es el mínimo de sus vehículos.
- La calculadora **no calcula una cuota**: es un deslizador de presupuesto
  (200–900 €, paso 10) que redirige a `/catalogo?maxPrice=<n>`.

> ⚠️ **Regla dura heredada de las láminas del proveedor: NUNCA se escribe una
> cuota de 0 €.** En las láminas del Drive un 0 significa *"ese kilometraje no
> se ofrece para este coche"*. Publicarlo sería anunciar un renting gratis. Si
> la lámina pone 0, **no se escribe la fila** en `pricing`.
> (Y hay un `check (monthly_price_cents > 0)` en SQL que lo impediría igualmente.)

### 8.6 Las dos vías para publicar un coche

**Vía A — `add_vehicle.py` (la normal).** Necesita `.env.local` con
`NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.

```bash
python scripts/add_vehicle.py scripts/fichas/mi-coche.json
```

Crea marca y modelo si no existen, inserta el vehículo, las cuotas y las
fotos, e imprime la URL final. Con `"update_vehicle_id"` actualiza en vez de
crear (y **borra y reescribe** cuotas y fotos de ese vehículo).

**Vía B — `ficha_a_sql.py` (cuando no hay credenciales).**

```bash
python scripts/ficha_a_sql.py scripts/fichas/mi-coche.json > supabase/alta_mi_coche.sql
```

Genera SQL **idempotente** para pegar en el SQL Editor de Supabase: marca,
modelo y vehículo con `on conflict do nothing`; las cuotas actualizan el
precio si cambia; las fotos solo entran si el vehículo aún no tiene galería
(porque `vehicle_images` no tiene clave única que lo impida).

Esta vía se creó el 26/08/2026 precisamente porque la sesión donde se preparó
el SEAT León no tenía la service role a mano.

### 8.7 Todos los scripts de catálogo

| Script | Para qué |
|---|---|
| `add_vehicle.py <ficha.json>` | Alta o actualización completa de un coche. **El principal.** |
| `ficha_a_sql.py <ficha.json>` | La misma alta, pero como SQL idempotente para pegar en Supabase. |
| `_fichas_drive.py` | Genera los JSON desde las láminas del Drive (QUADIS + M AUTOMOCIÓN). **La lámina manda sobre lo que diga cualquier web.** |
| `slice-photo-sheet.mjs "<hoja.png>" <prefijo>` | Trocea las hojas de contacto del Drive detectando las "calles" entre viñetas. |
| `build-galleries.mjs` | Escribe el bloque `images` de la ficha y separa exterior de interior **midiendo cuánto fondo de estudio se ve**, con corte relativo por coche (con umbral fijo, el CR-V salía entero como "interior"). |
| `galerias_quecoche.py [--aplicar]` | Rellena galerías desde quecochemecompro.com. **Por debajo del listón de parecido no toca el coche**: mejor una foto sola que las de otro modelo. Sin `--aplicar` solo informa. |
| `build-section-video.mjs <url\|ruta> [--nombre …]` | Convierte un clip de stock en fondo de sección (~1 MB) + póster WebP. Necesita ffmpeg. |
| `optimize-brand-logos.mjs` | Reescala los logos de marca a 240 px (bajaron de 7,6 MB a 292 KB). |
| `generate-catalog-seed.mjs` | Convierte el array `CARS` de quierorenting.es al SQL de siembra. |
| `seed_db.py`, `upload_images.py`, `mark_all_featured.py` | Siembra inicial y utilidades puntuales. |
| `_posts_iniciales.py`, `_posts_tanda2.py` | Los 9 artículos del blog, insertados en `blog_posts`. |

> **`src/scripts/` es una carpeta heredada** con versiones antiguas
> (`update_images.py`, `update_images_fast.py`, `debug_patch.py`, `_env.py`).
> Su `_env.py` pide además `ANON_KEY`. **Usa `scripts/`, no `src/scripts/`.**

### 8.8 Después de publicar: revalidar

Las páginas tienen ISR (900–3600 s), así que el cambio aparece solo en ese
plazo. Para forzarlo:

```bash
curl -X POST https://movilease.es/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -d '{"path":"/renting-seat-leon"}'
```

Hay que revalidar **cada** ruta afectada: `/`, `/catalogo` y la ficha nueva.

---

## 9. COMPONENTES IMPORTANTES

| Componente | Ubicación | Función | Delicado | Seguro de tocar |
|---|---|---|---|---|
| **Header** | `components/layout/Header.tsx` (364 l., cliente) | Barra fija, nav, mega-menú de marcas, menú móvil a pantalla completa | **Trampa de foco del menú móvil** (Escape + Tab circular), retardo de 140 ms al cerrar el mega-menú (sin él parpadea), bloqueo de `body.overflow` | Textos de `NAV_LINKS`, orden de los enlaces |
| **Footer** | `components/layout/Footer.tsx` (238 l., servidor) | 4 columnas + marcas destacadas leídas de la BD | La lista de marcas viene de `getVehiclesByBrand()` | Enlaces y textos de las columnas |
| **VehicleCard** | `components/vehicles/VehicleCard.tsx` | Tarjeta de coche del catálogo y la home | **El levantamiento al pasar el ratón es CSS (`.card-lift`), no framer-motion**: eran ~70 componentes animados por JS. **No lo conviertas de vuelta.** El pie va en dos filas fijas a propósito | Textos, tamaño de fuentes |
| **BrandCard** | `components/catalog/BrandCard.tsx` | Tarjeta de marca | `unoptimized` para SVG (el optimizador de Next devuelve 400 sin `dangerouslyAllowSVG`). `width`/`height` explícitos para no provocar CLS. Pie en dos filas: en rejilla de 5 columnas la tarjeta mide ~200 px y precio + CTA no caben juntos | Textos |
| **VehicleGallery** | `components/vehicles/VehicleGallery.tsx` (cliente) | Galería con miniaturas y flechas | Cae con elegancia a la inicial de la marca si no hay fotos | Estilos, tamaños de miniatura |
| **VehiclePricingTable** | `components/vehicles/VehiclePricingTable.tsx` | Tabla plazo × km | Devuelve `null` si no hay filas. Marca con ★ el plazo destacado. Celda sin datos = `—` | Colores, tipografía |
| **LeadForm** | `components/forms/LeadForm.tsx` (271 l., cliente) | Formulario principal | **Honeypot `website` oculto**, `useActionState`, campo RGPD obligatorio, `pageUrl` desde `usePathname()`. **Solo nombre + teléfono a la vista**; el resto se despliega | Textos, placeholders, `submitLabel` |
| **LeadPopup** | `components/home/LeadPopup.tsx` (312 l., cliente) | Pop-up de captación | Disparo triple (10 % scroll / salida / 5 s), `sessionStorage` `qr_popup_v4`, gestión de foco. **Envía a `POST /api/leads`, no a la Server Action** | Copy, imagen, umbrales (documentados) |
| **CookieBanner** | `components/home/CookieBanner.tsx` (cliente) | Banner de cookies | **Reserva su altura en `--bottom-inset`** con `ResizeObserver` para que el botón de WhatsApp y la barra de comparación se aparten. **Si lo tocas, mantén eso** | Textos, botones |
| **WhatsAppButton** | `components/layout/WhatsAppButton.tsx` (servidor) | Botón flotante | **Sin framer-motion a propósito**: era un componente cliente entero para medio segundo de animación, y su `transition-all` impedía que se apartara del banner de cookies | Colores, tamaño |
| **VideoBackdrop** | `components/ui/VideoBackdrop.tsx` (cliente) | Fondo de vídeo de sección | **No lo simplifiques.** `preload="none"`, `<source>` que no se montan hasta 400 px antes del viewport, póster desde el primer render, sin descarga con `prefers-reduced-motion` ni con ahorro de datos, pausa fuera de pantalla | `veil`, `base`, `filter`, `position` |
| **Reveal / RevealGroup / RevealItem / AnimatedCounter** | `components/ui/Reveal.tsx` (231 l.) | Aparición al hacer scroll y contadores | Respetan `prefers-reduced-motion` vía CSS (`.reveal`) | `stagger`, `delay` |
| **Parallax** | `components/ui/Parallax.tsx` | Desplazamiento sutil | Desactivado con `prefers-reduced-motion` y en pantallas pequeñas | Intensidad |
| **JsonLd** | `components/seo/JsonLd.tsx` (270 l., servidor) | 8 generadores de datos estructurados | `VehicleModelJsonLd` usa `AggregateOffer` + `UnitPriceSpecification` con `unitCode: "MON"` **porque el precio es mensual**: sin eso Google mostraría "264 €" como precio del coche | Descripciones |
| **Logo** | `components/ui/Logo.tsx` | Logo | `<img>` normal, no `next/image`. `variant="white"` = filtro CSS | Tamaños |
| **RentingCalculator** | `components/calculator/RentingCalculator.tsx` (cliente) | Deslizador de presupuesto | Rango 200–900 €, paso 10. Redirige a `/catalogo?maxPrice=` | Rango, textos |
| **FAQAccordion** | `components/home/FAQAccordion.tsx` (cliente) | Acordeón de preguntas | Se reutiliza en home y en fichas | Estilos |
| **Markdown** | `components/blog/Markdown.tsx` (211 l.) | Renderizador propio de los artículos | **No interpreta HTML en bruto** (es la protección). Soporta títulos, listas, citas, negrita, cursiva y enlaces | Estilos de cada elemento |
| **Hooks de localStorage** | `hooks/useLocalStorageIds.ts` | Favoritos (sin límite) y comparador (máx. 3) | Claves `movilease:favorites:v1` y `movilease:comparison:v1`. Todo envuelto en `try/catch` (modo privado) | — |

---

## 10. FORMULARIOS Y LEADS

### 10.1 El flujo completo (MoviLease)

**`src/lib/actions/leads.ts` → `createLead(formData)`:**

1. **Valida con zod** (`leadFormSchema` en `lib/validations/lead.ts`).
2. **Honeypot:** si el campo oculto `website` viene relleno, **se descarta en
   silencio devolviendo éxito falso al bot**.
3. **Inserta en `leads`** con el cliente admin (service role), guardando
   además **IP** (`x-forwarded-for`), **user-agent** y **`page_url`**.
4. **Notifica en paralelo** (`Promise.allSettled`) a **Web3Forms** y
   **Telegram**, y marca `notified_web3forms` / `notified_telegram` en la fila.
5. Devuelve un **enlace de WhatsApp prerellenado** para continuar la conversación.

> **Regla de oro: cualquier fallo devuelve un mensaje controlado invitando a
> WhatsApp, nunca un 500.** El texto exacto es: *"No se ha podido registrar la
> solicitud. Escríbenos directamente por WhatsApp mientras tanto."*

### 10.2 Formularios existentes

| Formulario | Dónde | Campos visibles | Campos enviados | Vía |
|---|---|---|---|---|
| **LeadForm** | Home (CTA final), `/contacto`, cada ficha `/[slug]` | Nombre*, Teléfono*, RGPD* | + apellidos, email, provincia, tipo de cliente, empresa, mensaje, `vehicleId`, `modelId`, `source`, `pageUrl`, honeypot | Server Action `createLeadAction` |
| **LeadPopup** | Todas las páginas menos `/contacto` y `/favoritos` | Nombre, Teléfono, Email, RGPD | `source: "contact_form"` | `POST /api/leads` |
| **Login admin** | `/admin/login` | Email, Contraseña | — | Supabase Auth (`signInWithPassword`) |

`*` = obligatorio.

**Validación (zod):**

- `name`: 2–120 caracteres.
- `phone`: `/^[+\d][\d\s]{6,20}$/` — empieza por `+` o dígito, 7–21 caracteres.
- `email`: opcional, pero si viene debe ser válido.
- `rgpd`: obligatorio (`"on"`, `"true"` o `true`).
- `website` (honeypot): debe venir vacío.
- `source`: uno de `vehicle_page` `catalog` `contact_form` `whatsapp_cta`
  `calculator` `landing_page`.

### 10.3 Integraciones

**Web3Forms** (`lib/notifications/web3forms.ts`) — envía el lead por email.
Asunto: `🚗 Nuevo Lead MOVILEASE`. Remitente: `MoviLease Leads`. Campos en
español (nombre, teléfono, email, empresa, provincia, tipo_cliente, vehículo,
mensaje, fecha, hora, ip, user_agent, página). Fecha y hora en
`Europe/Madrid`. **Si no hay `WEB3FORMS_API_KEY`, devuelve `false` sin
romper nada.**

**Telegram** (`lib/notifications/telegram.ts`) — mensaje HTML instantáneo con
los mismos datos. **Si faltan `TELEGRAM_BOT_TOKEN` o `TELEGRAM_CHAT_ID`,
devuelve `false` sin romper nada.**

**WhatsApp** — `buildWhatsAppLink(mensaje)` en `lib/constants.ts` genera
`https://wa.me/34613267375?text=<mensaje codificado>`. Se usa en el header,
el footer, el botón flotante, cada `VehicleCard`, los CTA de catálogo y ficha,
y como paso siguiente tras enviar el formulario.

**CRM: no existe.** Los leads solo están en la tabla `leads` de Supabase, y
**la pantalla del panel para verlos está sin construir** (§14). Hoy los leads
se consultan por email, Telegram o directamente en el panel de Supabase.

### 10.4 Formularios de las otras webs

- **quierorenting.es** → `lpSubmit()` llama a Web3Forms y Telegram
  **desde el navegador con las claves en el HTML**. Ver §7.2. 🚨
- **adridaganzo.com** → el modal (`submitLead`) abre WhatsApp; el formulario
  de la sección de contacto **no envía nada** (solo un `alert`). Ver §7.5. 🐞
- **laponce.es** → no tiene formulario; el chat es simulado.

---

## 11. VARIABLES DE ENTORNO Y CONFIGURACIÓN

Plantilla: **`.env.example`** (está en el repo, sin valores). Copiar a
`.env.local` y rellenar. `.env*` está en `.gitignore` salvo `.env.example`.

### Públicas (se inyectan en el bundle de cliente — seguras de exponer)

**`NEXT_PUBLIC_SUPABASE_URL`**
- Propósito: URL del proyecto Supabase.
- Servicio: Supabase.
- Dónde se usa: `lib/supabase/{server,client,admin,middleware}.ts`, `scripts/_env.py`.
- Obligatoria: **Sí.**

**`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
- Propósito: clave anónima; el acceso lo limita la RLS.
- Servicio: Supabase.
- Dónde se usa: los tres clientes de Supabase y el middleware.
- Obligatoria: **Sí.**

**`NEXT_PUBLIC_SITE_URL`**
- Propósito: URL canónica del sitio. Alimenta `SITE_URL`, y con ella
  `metadataBase`, todos los `canonical`, el `sitemap.xml`, el `robots.txt` y
  todos los JSON-LD.
- Servicio: propio.
- Dónde se usa: `lib/constants.ts`.
- Obligatoria: **No** (por defecto `https://movilease.es`), pero **en Vercel
  debe estar puesta**: si apunta a otro sitio, se rompen todos los canonical.

**`NEXT_PUBLIC_WHATSAPP_NUMBER`**
- Propósito: número de WhatsApp del negocio, en formato internacional sin `+`.
- Servicio: WhatsApp.
- Dónde se usa: `lib/constants.ts` (`CONTACT`, `buildWhatsAppLink`).
- Obligatoria: **No** (por defecto `34613267375`).

### Solo servidor (NUNCA con prefijo `NEXT_PUBLIC_`, nunca al cliente)

**`SUPABASE_SERVICE_ROLE_KEY`**
- Propósito: clave que **se salta la RLS por completo**.
- Servicio: Supabase.
- Dónde se usa: `lib/supabase/admin.ts` (solo para insertar leads) y todos los
  scripts de `scripts/`.
- Obligatoria: **Sí** para que funcionen los formularios y los scripts.

**`WEB3FORMS_API_KEY`**
- Propósito: notificación de leads por email.
- Servicio: Web3Forms.
- Dónde se usa: `lib/notifications/web3forms.ts`.
- Obligatoria: **No** (sin ella, no se envía el email; el lead sí se guarda).

**`TELEGRAM_BOT_TOKEN`**
- Propósito: bot que avisa de cada lead.
- Servicio: Telegram Bot API.
- Dónde se usa: `lib/notifications/telegram.ts`.
- Obligatoria: **No** (sin ella, no hay aviso; el lead sí se guarda).

**`TELEGRAM_CHAT_ID`**
- Propósito: chat destino del aviso.
- Servicio: Telegram.
- Dónde se usa: `lib/notifications/telegram.ts`.
- Obligatoria: **No** (misma condición).

**`REVALIDATE_SECRET`**
- Propósito: secreto compartido que protege `POST /api/revalidate`.
- Servicio: propio.
- Dónde se usa: `app/api/revalidate/route.ts` (cabecera `x-revalidate-secret`).
- Obligatoria: **No** para renderizar, **Sí** para poder invalidar la caché
  bajo demanda. (Si está vacía, la ruta rechaza todo con 401.)

> **Regla absoluta: nada que no sea público lleva el prefijo `NEXT_PUBLIC_`.
> Jamás.** Y `.env.local` no se commitea nunca.

---

## 12. DESPLIEGUE

### 12.1 Levantar el proyecto en local

```bash
git clone https://github.com/quierorenting-collab/movilease
cd movilease
npm install                 # en una sesión nueva node_modules NO existe
cp .env.example .env.local  # y rellenar los valores
npm run dev                 # http://localhost:3000
```

**Comandos disponibles** (`package.json`, no hay más):

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint |

**No hay tests.** La verificación antes de commitear es
**`npm run lint` && `npm run build`**, siempre las dos.

**Sin `.env.local` la web pública sigue arrancando** (la capa de datos nunca
lanza y devuelve listas vacías), pero verás un catálogo vacío y los
formularios fallarán con el mensaje controlado.

### 12.2 Despliegue

- **Plataforma: Vercel.** Confirmado por cabeceras.
- **Al hacer push a `master`, Vercel despliega a producción.** Cualquier otra
  rama genera un *preview deployment*.
  **NO CONFIRMADO — REQUIERE REVISIÓN:** la configuración exacta del proyecto
  en Vercel (rama de producción, comando de build) no se ha podido consultar.
  Por convención de Next.js en Vercel: build `next build`, sin configuración.
- **No hay `vercel.json` ni GitHub Actions.**
- **Las variables de entorno de producción se configuran en Vercel**
  (Project → Settings → Environment Variables), no en el repo. Las seis
  obligatorias/recomendadas: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`, `WEB3FORMS_API_KEY`, `TELEGRAM_BOT_TOKEN`,
  `TELEGRAM_CHAT_ID`, `REVALIDATE_SECRET`.

### 12.3 Ramas

- `master` → producción.
- `claude/proyecto-handoff-completo-x2xlqj` → rama de trabajo actual.
- **Nunca se empuja a `master` sin permiso explícito.**

Formato de push: `git push -u origin <rama>`.

### 12.4 Dominios y DNS

| Dominio | Apunta a | Confirmado |
|---|---|---|
| `movilease.es` | Esta app en Vercel | Sí |
| `www.movilease.es` | 308 → `movilease.es` (definido en `next.config.ts`) | Sí |
| `quierorenting.es` | HTML estático en Vercel (**no** esta app) | Sí |
| `laponce.es` | HTML estático en Vercel (DNS en DonDominio) | Según `PROMPT-WEBS.md` |
| `adridaganzo.com` | HTML estático en Vercel (DNS en DonDominio) | Según `PROMPT-WEBS.md` |

**El dominio es la palanca definitiva:** quien controla el DNS decide a dónde
apunta la web, pase lo que pase con Vercel o con el código.

### 12.5 Aplicar migraciones de base de datos

No hay CLI de Supabase configurada en el repo. Las migraciones se han aplicado
**pegando el SQL en el SQL Editor del panel de Supabase**, por orden numérico.
Una migración nueva va como `supabase/migrations/0005_<nombre>.sql` y se pega
igual. **Las migraciones ya aplicadas no se editan nunca.**

---

## 13. SEO, ANALÍTICA Y TRACKING

### 13.1 SEO — lo que hay (y funciona bien)

**Helper obligatorio: `pageMetadata()`** en `src/lib/metadata.ts`.
**Úsalo en TODA página nueva.** Genera título, descripción, `canonical`,
Open Graph y Twitter Card de una vez.

```ts
export const metadata: Metadata = pageMetadata({
  title: "Título de la página",
  description: "Descripción de ~155 caracteres.",
  path: "/mi-ruta",
  images: ["/ruta/foto.webp"],  // opcional
  noIndex: false,               // opcional
});
```

> Detalle que hay que conocer: **declarar `openGraph` a mano desactiva el
> descubrimiento automático de `app/opengraph-image.tsx`**, por eso la imagen
> se referencia explícitamente dentro del helper.

**Metadatos globales** — `src/app/layout.tsx`:
- `metadataBase`, plantilla de título `%s | <marca>`, descripción por marca.
- `formatDetection: { telephone: false, … }` — evita que iOS convierta los
  precios del catálogo en enlaces de llamada.
- `robots` con `max-image-preview: large` y `max-snippet: -1`.
- `verification.google` — **la verificación de Google Search Console está
  aquí**. La propiedad de GSC está reclamada. La cuenta concreta:
  **NO CONFIRMADO — REQUIERE REVISIÓN.**
- `viewport.themeColor: "#0B2A5E"`.

**Datos estructurados** — `src/components/seo/JsonLd.tsx`:
`OrganizationJsonLd` (tipo `AutoRental`) · `WebSiteJsonLd` · `FaqJsonLd` ·
`BreadcrumbJsonLd` · `ItemListJsonLd` · `VehicleModelJsonLd` (`Product` +
`AggregateOffer` + `UnitPriceSpecification` con `unitCode: "MON"`) ·
`WebPageJsonLd` · `ArticleJsonLd`.

**Sitemap** — `src/app/sitemap.ts` (revalida cada hora): 12 rutas fijas + las
fichas de modelo + los artículos del blog + una entrada por marca
(`/catalogo?brand=…`). **Si Supabase falla, sirve igualmente las estáticas.**
Las fichas de versión (`/[modelo]/[version]`) quedan fuera a propósito: esa
ruta aún no existe.
**Estado hoy: 123 URLs.**

**Robots** — `src/app/robots.ts`: bloquea `/admin`, `/api/`, `/favoritos` y
`/comparador` (los dos últimos dependen del localStorage del visitante: no hay
nada que indexar).

**Canonical por marca** — `/catalogo?brand=seat` tiene canonical propio; las
combinaciones con filtro de categoría o combustible llevan `noIndex`. Sin
esto, las ~28 vistas de marca y todas sus combinaciones competían como
duplicados de `/catalogo`.

**Descripciones de ficha** — se arman con datos reales (cuota mínima, número
de versiones) y se recortan a ~158 caracteres.

**Enlazado interno** — cada ficha enlaza a otros 4 modelos de su misma marca
(`getSameBrandModels`), y el catálogo enlaza **todos** los modelos (antes solo
12). Las FAQ de ficha enlazan a artículos concretos del blog.

**Imágenes** (`next.config.ts`): AVIF primero (baja 20-30 % frente a WebP en
fotos de coche), `qualities: [75, 92]`, caché mínima de **30 días**.
**Un origen nuevo de fotos hay que declararlo en `remotePatterns`.**

### 13.2 Analítica y tracking — **NO HAY NINGUNO**

Verificado el 01/09/2026 sobre el HTML de producción de movilease.es: **no
aparece GA4, ni Google Tag Manager, ni Meta Pixel, ni Hotjar, ni Clarity, ni
Vercel Analytics.**

**Consecuencia práctica: hoy no se sabe cuántas visitas hay, de dónde vienen,
ni qué porcentaje convierte.** El único dato de conversión es el número de
leads que llegan por email/Telegram.

Lo mismo vale para quierorenting.es (sin analítica) y laponce.es (sin
analítica). adridaganzo.com tiene el código puesto pero **con IDs de ejemplo**
(§7.5).

**Si el cliente pide instalar analítica**, el sitio dónde ponerlo es
`src/app/layout.tsx` (o un componente de cliente montado desde
`(public)/layout.tsx`), y **hay que respetar el banner de cookies**:
`CookieBanner` ya guarda la preferencia en `localStorage` con la clave
`ml_cookie_pref` (`"accept"` / `"reject"`), pero **hoy esa preferencia no
condiciona nada** porque no hay scripts que condicionar.

---

## 14. ESTADO ACTUAL DEL PROYECTO

### ✅ TERMINADO Y FUNCIONANDO (MoviLease)

- Web pública completa y en producción: home, catálogo, 72 fichas de modelo,
  blog con 9 artículos, calculadora, comparador, favoritos, contacto,
  quiénes somos, landings de empresas y autónomos, páginas legales.
- **30 marcas y 73 vehículos** publicados y navegables.
- Sistema de diseño completo y coherente (`globals.css`, 911 líneas).
- Captación de leads de punta a punta: formulario → validación → Supabase →
  email + Telegram → WhatsApp.
- SEO técnico: canonical, Open Graph, 8 tipos de datos estructurados,
  sitemap dinámico (123 URLs), robots, verificación de Search Console.
- Accesibilidad trabajada: `skip-link`, trampa de foco en el menú móvil,
  `aria-current`, `aria-live`, contraste medido, `prefers-reduced-motion`
  respetado en todas las animaciones.
- Rendimiento: logos de 7,6 MB → 292 KB, framer-motion fuera de 6 rutas,
  vídeos de fondo perezosos, AVIF, caché de 30 días.
- Redirección `www` → apex en el edge.
- Login del panel con Supabase Auth y control de roles funcionando.
- Base de datos con RLS, GRANTs y triggers anti-escalada de privilegios.
- Scripts de catálogo maduros (alta, actualización, galerías, SQL alternativo).

### 🔄 EN PROCESO / A MEDIO HACER

- **SEAT León 1.5 TSI FR Special Edition** — ficha y 7 fotos preparadas
  (`scripts/fichas/seat-leon-15-tsi-fr-special-edition.json` +
  `public/coches-nuevos/seat-leon-fr-0*.webp`), y el SQL de alta generado en
  **`supabase/alta_seat_leon.sql`**. **Pero NO está publicado:**
  `https://movilease.es/renting-seat-leon` devuelve **404** (verificado hoy) y
  no aparece en el sitemap. **Falta ejecutar ese SQL en el SQL Editor de
  Supabase.** Es la tarea abierta más inmediata.
- **Rama `claude/proyecto-handoff-completo-x2xlqj`** — documentación de
  traspaso (este documento).

### ⏳ PENDIENTE (conocido, no empezado)

1. **"Fase 4": el panel de administración.** Las 7 páginas del dashboard son
   stubs. Hoy **cambiar un precio es ejecutar un script o SQL, no usar la
   web**. Es la carencia funcional más grande del proyecto.
   Falta: CRUD de vehículos con subida de fotos, gestión de modelos y marcas,
   listado de leads, editor de blog, editor de SEO, gestión de usuarios.
2. **Aviso legal vacío.** `/aviso-legal` está publicado con el texto
   *"[PENDIENTE: completar con los datos fiscales/identificativos reales del
   responsable del sitio — nombre o razón social, NIF, domicilio y email —
   según exige la LSSI-CE]"*. **Es un incumplimiento legal visible en
   producción.** Requiere los datos reales del cliente (o de la S.L. que
   `brand.ts` menciona como "futura").
3. **Sin analítica.** No se mide nada (§13.2).
4. **Ruta `/[modelo]/[version]`** — el esquema la contempla (`version_slug`)
   pero la ruta no existe y el sitemap la excluye a propósito.
5. **Tipos de base de datos escritos a mano.** Sustituir
   `src/types/database.types.ts` por la salida de
   `supabase gen types typescript` desbloquearía los embeds de PostgREST y
   permitiría simplificar `attachModelsAndBrands`.
6. **`landing_pages` sin contenido conocido.** La infraestructura está
   (`lib/data/landing.ts`, resolución en `/[slug]`), pero
   **NO CONFIRMADO — REQUIERE REVISIÓN** si hay filas en producción.
7. **`redirects` y `seo_metadata` sin usar.** Las tablas existen; ningún
   código las lee todavía.
8. **quierorenting.es**: decidir si se migra a esta aplicación (el código ya
   lo soporta) o se mantiene como HTML estático.

### 🐞 BUGS Y PROBLEMAS CONOCIDOS

**MoviLease:**

| # | Problema | Gravedad |
|---|---|---|
| 1 | **SEAT León preparado pero no publicado** (404). Falta ejecutar `supabase/alta_seat_leon.sql`. | Media — trabajo hecho sin efecto |
| 2 | **Aviso legal con texto de marcador de posición en producción.** | Alta — cumplimiento legal |
| 3 | **`lib/data/vehicles.ts` y `landing.ts` usan el cliente con cookies.** Hoy no rompe porque esas rutas no usan `generateStaticParams`; si alguien lo añade, producción devuelve 500. | Latente — trampa peligrosa |
| 4 | **`annual_km` inconsistente:** `RENTING_DEFAULTS` dice 10.000, el default de SQL y de los scripts dice 15.000. | Baja — pero da datos contradictorios si se olvida el campo |
| 5 | **`.section-label` es CSS sin capa y gana a las utilidades de Tailwind.** Por eso en la home hay un `style={{color}}` inline. Si un `text-*` "no hace nada" sobre `.section-label`, es esto. | Baja — trampa conocida |
| 6 | **`README.md` es el genérico de `create-next-app`**, sin una sola línea del proyecto. | Cosmética |
| 7 | **`.claude/launch.json` tiene rutas de Windows** (`C:\PROGRA~1\nodejs\node.exe`): inservible fuera de esa máquina. | Cosmética |
| 8 | **`src/scripts/` es una carpeta heredada** que duplica `scripts/` con versiones viejas. Confunde. | Cosmética |
| 9 | **Sin tests de ningún tipo.** | Estructural |

**Otras webs:**

| # | Problema | Gravedad |
|---|---|---|
| 10 | 🚨 **quierorenting.es expone la clave de Web3Forms y el token del bot de Telegram en el HTML público.** | **Crítica — rotar credenciales** |
| 11 | 🐞 **adridaganzo.com: el formulario de contacto no envía nada** (solo un `alert`). Fuga silenciosa de clientes. | Alta |
| 12 | 🐞 **laponce.es: cuenta atrás muerta desde el 24/06/2026**, título y JSON-LD anunciando eventos ya celebrados. | Alta |
| 13 | 🐞 **adridaganzo.com: analítica con IDs de ejemplo** (`G-XXXXXXXXXX`, píxel `0000000000000000`). | Media |
| 14 | laponce.es no tiene `robots.txt` ni `sitemap.xml`, y carga el fondo del hero desde Unsplash en caliente. | Media |
| 15 | adridaganzo.com `/en/` es un *stub* de 9 KB, no una traducción. Si piden "traducir la web", ojo. | Media |

---

## 15. HISTORIAL DE DECISIONES IMPORTANTES

Reconstruido a partir de los **53 commits** del repositorio (29/07/2026 →
26/08/2026) y de los comentarios del código, que en este proyecto explican
**por qué** se hizo cada cosa.

### Decisiones de arquitectura

1. **Next.js 15 + App Router + Supabase, no un CMS.** Se eligió una aplicación
   propia con base de datos porque el catálogo tiene precios por plazo ×
   kilometraje y fichas ricas que un HTML estático (lo que era
   quierorenting.es) no puede sostener.
2. **Una sola aplicación para dos marcas** (`lib/brand.ts`), en vez de dos
   repositorios. Comparten catálogo y lógica; solo cambian nombre y
   descripción por host.
3. **La capa de datos nunca lanza.** Si Supabase cae, la web se degrada
   (catálogo vacío) pero no se cae. Decisión consciente y aplicada en los tres
   módulos de `lib/data/`.
4. **El middleware solo cubre `/admin`.** Descartado cubrir todo el sitio: la
   web pública no debe depender de que exista un Supabase configurado.
5. **Tres clientes de Supabase separados** en vez de uno configurable.
   Nació de un incidente real: el 500 de los artículos en producción.
6. **Join en memoria en vez de embeds de PostgREST**, porque los tipos están
   escritos a mano y no tienen `Relationships`. Es deuda técnica aceptada, no
   un descuido.
7. **El catálogo se gestiona con scripts, no con el panel.** El panel se dejó
   para la "Fase 4"; mientras tanto, los scripts de Python son la herramienta.
8. **`ficha_a_sql.py` como segunda vía** (26/08/2026), para poder publicar un
   coche sin tener la service role a mano. Idempotente a propósito, porque se
   pega a mano y no se recuerda si ya se ejecutó.

### Decisiones de diseño (no revertir sin pedirlo)

9. **Azul `#0068FF` como color de marca, `#5AA0FF` para texto sobre oscuro.**
   El primero solo llega a 3,1:1 sobre el azul oscuro y no pasa AA.
10. **Jerarquía por tamaño y peso, no bajando opacidades.** Las opacidades de
    texto sobre oscuro subieron de 74/58 a 86/72 para pasar AA sobre
    `surface-graphite`.
11. **Space Grotesk (display) + Inter (texto), sin el peso 300.**
12. **Curva de movimiento única `cubic-bezier(.16,1,.3,1)`** para todo, y
    animar **solo `transform` y `opacity`**.
13. **`prefers-reduced-motion` respetado en todas las animaciones.** Regla
    firme: animación nueva ⇒ excepción nueva.
14. **Header con banda blanca y logo a color** (30/07/2026); el slogan pasó de
    letra pequeña en el header a **titular grande del hero**.
15. **Vídeos de fondo propios en las secciones clave**, siempre con velo para
    mantener el contraste del texto.
16. **`OFERTAS_VIDEO = false`** — la sección de ofertas usa la foto del BMW en
    vez del vídeo de tráfico. **Decisión de contenido; el vídeo sigue en el
    repo por si se retoma. No lo "arregles".**
17. **El pie de `BrandCard` y de `VehicleCard` va en dos filas fijas**, nunca
    precio y CTA en la misma línea: en rejilla de 5 columnas la tarjeta mide
    ~200 px y no caben. Los breakpoints `sm:` no sirven porque miran el ancho
    de la ventana, no el de la tarjeta.
18. **Seis ofertas destacadas, no cuatro** (las que marca Adrián: Ibiza, Polo,
    Taigo, Ebro S400, GLC Coupé y CR-V). Con el tope en cuatro no llegaban a
    verse el GLC ni el CR-V, porque la consulta ordena por cuota ascendente.
19. **El pop-up dispara a los 5 segundos.** Lo pidió Adrián expresamente,
    con la contrapartida documentada en el propio componente.

### Cosas que se descartaron

20. **framer-motion en las tarjetas del catálogo** — eran ~70 componentes
    animados por JS para lo que hace una transición CSS. Sustituido por
    `.card-lift`. **No lo devuelvas a JS.**
21. **framer-motion en el botón de WhatsApp** — un componente cliente entero
    para medio segundo de animación, y su `transition-all` impedía que el
    botón se apartara del banner de cookies.
22. **`dangerouslyAllowSVG` en `next/image`** — descartado. Los SVG se sirven
    con `unoptimized` (ya son vectoriales y pesan 9-13 kB).
23. **El peso 300 de las fuentes** — 0 usos, dos archivos menos que descargar.
24. **Mostrar solo 12 coches en "todo el catálogo"** — se corrigió: ahora
    salen todos, que es lo que se espera de un catálogo, y de paso cada modelo
    queda enlazado desde una página que el rastreador ya visita.
25. **Devolver 200 con una ficha vacía** para modelos sin stock — se cambió a
    404 (SEAT Arona, Opel Combo).
26. **Convertir laponce.es o adridaganzo.com a Next.js** — descartado como
    "arreglo": son webs de una tarde; convertirlas es un proyecto, y debe ser
    una decisión tomada a propósito, no el efecto colateral de un cambio
    pequeño.

### Errores que ya cometimos y no hay que repetir

27. **Usar el cliente de Supabase con cookies en una página con
    `generateStaticParams`** → 500 en producción (*"Page changed from static
    to dynamic at runtime"*). Ver §5.3.
28. **Mostrar dos veces el mismo modelo en la vista de marca** (SEAT enseñaba
    dos Ibiza; VW, dos Polo y dos Taigo). Ahora se deduplica por `modelSlug`
    quedándose con la versión más barata.
29. **Poner el resultado de la calculadora detrás de 30 marcas.** Llegando con
    presupuesto, el resultado va **antes**; sin presupuesto, se queda el orden
    de siempre.
30. **Capitalizar el slug de marca** daba "Seat" y "Kgm" en el título de
    Google. Ahora se usa el nombre real (`getBrandDisplayName`).
31. **Logos de marca de 7,6 MB** (uno de 1,6 MB) para mostrarse a 64 px.
32. **Servir la web entera en `www` y en el apex con 200 en las dos**: partía
    la señal de SEO.
33. **Descripciones de ficha de 70 caracteres genéricos.** Ahora llevan precio
    real, "sin entrada" y número de versiones.
34. **Coger el precio mínimo de una versión y el plazo de otra** en la FAQ de
    ficha: decía "263 € para un contrato de 60 meses" cuando esos 263 € eran
    de otra versión. Ahora precio y condiciones salen del **mismo** vehículo.
35. **Desbordamiento horizontal en móvil** (primer commit del repo).

---

## 16. REGLAS QUE DEBES RESPETAR SIEMPRE

### Reglas de proceso

1. **Analiza antes de modificar.** Lee el archivo entero y sus comentarios.
   En este proyecto los comentarios explican decisiones, no obviedades: si hay
   un comentario largo encima de algo raro, ese algo raro está ahí por una
   razón.
2. **Lee `AGENTS.md` antes de escribir código Next.js.** Dice, literalmente,
   que **este no es el Next.js que recuerdas**: consulta la guía
   correspondiente en `node_modules/next/dist/docs/`.
   `cookies()`, `headers()` y `params` **son asíncronos**.
3. **`npm install` primero.** En una sesión nueva `node_modules` no existe.
4. **Verifica con `npm run lint` Y `npm run build` antes de commitear.**
   Las dos, siempre. No hay tests que te salven.
5. **Comentarios en español, explicando el PORQUÉ, nunca el qué.** Es la
   norma de todo el código. Imítala.
6. **Mensajes de commit en español, sin prefijos tipo `feat:`**, con cuerpo
   que explique el problema, la decisión y **cómo se verificó**.
   Mira `git log -5` para ver el tono.
7. **Desarrolla y empuja solo a la rama indicada. Nunca a `master` sin
   permiso explícito.**
8. **No inventes datos de negocio.** Fechas, precios, cuentas, testimonios,
   número de clientes: si no lo puedes comprobar, pregúntalo.
9. **Explica claramente qué has cambiado**, en qué archivos y qué impacto
   tiene en otras páginas.

### Reglas de seguridad

10. **Nada de secretos en el repositorio.** `.env.local` está en `.gitignore`.
11. **Nada que no sea público lleva el prefijo `NEXT_PUBLIC_`. Jamás.**
12. **No publiques, copies ni pegues las credenciales que hay expuestas en el
    HTML de quierorenting.es** (§7.2). Si trabajas ahí, avisa de que hay que
    rotarlas.
13. **`createAdminClient()` solo en servidor.** El `import "server-only"` te
    lo impedirá, pero no lo fuerces.

### Reglas técnicas del Sistema A

14. **Elige bien el cliente de Supabase** (§5.3). Contenido público idéntico
    para todos ⇒ `createPublicClient()`.
15. **La capa de datos nunca lanza.** Si añades una función a `lib/data/`,
    envuélvela en `try/catch` y devuelve `[]` o `null`.
16. **Toda página nueva usa `pageMetadata()`**, se añade a `sitemap.ts` y se
    enlaza desde `Header` o `Footer`.
17. **No inventes estilos: casi siempre la clase ya existe en `globals.css`.**
    Antes de escribir un `text-[15px]` suelto, busca `.body-md`.
18. **No crees `tailwind.config.js`.** Tailwind v4 se configura en el CSS.
19. **Anima solo `transform` y `opacity`**, con `--easing-premium`, y añade la
    excepción de `prefers-reduced-motion`.
20. **Toda tabla nueva necesita RLS *y* `GRANT`** (§5.6).
21. **Las migraciones ya aplicadas no se editan: se añade una nueva.**
22. **Un valor nuevo en un enum se toca en tres sitios:** la migración SQL,
    `src/lib/constants.ts` y `src/types/database.types.ts`.
23. **En `database.types.ts` usa `type`, nunca `interface`**, para las filas.
    Una `interface` no satisface `Record<string, unknown>` y vuelve `never`
    los tipos de `.insert()`/`.update()` sin avisar.
24. **Un origen nuevo de imágenes se declara en `next.config.ts`.**
25. **Nunca escribas una cuota de 0 €** (§8.5).
26. **Mantén la consistencia entre catálogo y ficha:** el precio que ve el
    usuario en la tarjeta debe ser el mismo "desde" de la ficha. Ambos salen
    de la misma consulta, así que no los calcules por separado.

### Reglas de producto y diseño

27. **Prioriza móvil.** Todo el proyecto está pensado móvil primero;
    comprueba siempre el responsive antes de dar algo por hecho.
28. **No cambies el branding sin que te lo pidan**: azul `#0068FF`, logo,
    slogan *"Hazlo fácil. Hazlo MoviLease."*, tipografías.
29. **No bajes el contraste.** Si tocas un color sobre fondo oscuro, mide la
    ratio y déjala escrita en el comentario, como hace el resto del código.
30. **No rompas la accesibilidad ya conseguida**: `skip-link`, trampa de foco
    del menú móvil, `aria-current`, `aria-live` del formulario.
31. **No quites el honeypot ni el campo RGPD** del formulario.
32. **No simplifiques `VideoBackdrop`.** Cada línea rara de ese componente
    evita un coste real (§9).
33. **Revisa el impacto en otras páginas.** `globals.css`, `lib/data/vehicles.ts`
    y `[slug]/page.tsx` los usa medio sitio.
34. **No dupliques código innecesariamente**, pero tampoco extraigas una
    abstracción por dos usos: el proyecto prefiere claridad local.

### Reglas del Sistema B (webs estáticas)

35. **No hay build que te avise.** Abre el HTML en el navegador y mira la
    consola.
36. **Cada página lleva su propia copia del CSS.** Un cambio global en
    adridaganzo.com son ~40 archivos (41 URLs en su sitemap): hazlo con un
    script, no a mano, y verifica un par de páginas después.
37. **Los datos están escritos a mano dentro del HTML.** Un dato que cambia
    hay que cambiarlo en todos los sitios donde aparezca, **incluido el
    JSON-LD**.
38. **El JSON-LD tiene que coincidir con lo visible.** Si el texto dice una
    fecha y el JSON-LD otra, Google se queda con la discrepancia.
39. **No metas un framework para un cambio pequeño.**
40. **Vercel sirve la raíz tal cual:** el nombre de la carpeta es la URL.
    `discotecas-madrid/index.html` → `/discotecas-madrid/`.

---

## 17. PROTOCOLO PARA CADA MODIFICACIÓN

Sigue estos diez pasos, en este orden, cada vez que se pida un cambio:

1. **Entender la petición.** ¿Qué web? ¿Sistema A o B? Si es ambiguo entre
   MoviLease y QuieroRenting, **pregunta**: son dos bases de código distintas.
2. **Localizar los archivos afectados.** Usa la sección 4 de este documento y
   una búsqueda por contenido (`grep`) antes de abrir nada al azar.
3. **Analizar dependencias.** ¿Quién más importa este módulo? `globals.css`,
   `lib/data/vehicles.ts`, `lib/constants.ts` y `[slug]/page.tsx` están
   importados desde muchos sitios.
4. **Revisar el impacto.** ¿Afecta a la home, al catálogo, a las 72 fichas, al
   sitemap, al menú? ¿Cambia una URL indexada? ¿Toca la base de datos?
5. **Leer los comentarios del código que vas a tocar.** Casi todo lo raro está
   justificado por escrito. Si vas a deshacer una decisión, di por qué.
6. **Implementar el cambio, mínimo y localizado.** Nada de refactores de
   propina ni de "ya que estoy". No toques partes innecesarias.
7. **Revisar errores:** `npm run lint` y `npm run build`. **Las dos.**
   Si el cambio toca la BD, verifica también el SQL (idealmente contra un
   Postgres local con las 4 migraciones aplicadas — así se verificó
   `alta_seat_leon.sql`).
8. **Comprobar el responsive**, empezando por móvil, y las animaciones con
   `prefers-reduced-motion` activo.
9. **Comprobar accesibilidad y contraste** si has tocado color, foco o
   semántica.
10. **Explicar claramente qué se ha cambiado**: archivos, decisión tomada,
    cómo se verificó y qué queda pendiente. Luego commitear en español con ese
    mismo cuerpo, y empujar a la rama indicada.

---

## 18. GUÍA RÁPIDA PARA MODIFICACIONES HABITUALES

Todas las rutas son reales.

### 18.1 Añadir un coche nuevo

1. Consigue las fotos y súbelas a `public/coches-nuevos/` en `.webp`, con el
   patrón `<marca>-<modelo>-01.webp`, `-02`, …
   *(Si vienen como hoja de contacto del Drive:
   `node scripts/slice-photo-sheet.mjs "FOTOS Coche.png" marca-modelo`.)*
2. Crea `scripts/fichas/<marca>-<modelo>-<version>.json` copiando
   `scripts/fichas/seat-leon-15-tsi-fr-special-edition.json` (§8.2).
   *(El bloque `images` lo puede escribir `node scripts/build-galleries.mjs`.)*
3. Publica:
   - Con credenciales: `python scripts/add_vehicle.py scripts/fichas/<ficha>.json`
   - Sin credenciales: `python scripts/ficha_a_sql.py scripts/fichas/<ficha>.json > supabase/alta_<coche>.sql`
     y pega ese SQL en el SQL Editor de Supabase.
4. Si la marca es nueva, añade su logo a `public/brands/<slug>.svg|png` **y su
   extensión al mapa `EXTENSION_BY_SLUG` de `src/lib/brand-logos.ts`**
   (si no, la tarjeta de marca saldrá sin logo). Opcional:
   `node scripts/optimize-brand-logos.mjs`.
5. Revalida `/`, `/catalogo` y `/<slug-del-modelo>` (§8.8).
6. Commitea las fotos y la ficha JSON.

### 18.2 Modificar el precio de un coche

**No se toca el código.** El precio vive en la base de datos.

- **Vía script:** edita el JSON de la ficha, añádele
  `"update_vehicle_id": "<uuid del vehículo>"` y ejecuta `add_vehicle.py`.
  Ojo: **borra y reescribe** las cuotas y las fotos de ese vehículo.
- **Vía SQL directo** (un solo precio):
  ```sql
  update vehicles set monthly_price_cents = 35800
   where id = '<uuid>';
  ```
- **La tabla de cuotas** está en `vehicle_pricing` (una fila por plazo × km).
- **Recuerda:** el número es la **cuota final con IVA, en céntimos**
  (`35800` = 358 €). No hay nada que recalcular.
- Revalida después.

### 18.3 Añadir una oferta destacada

- **Píldora "Oferta" en la tarjeta:** `update vehicles set is_offer = true where id = '…'`.
- **Aparecer en "Destacados" de la home:** `is_featured = true`.
- La home pide `getOfferVehicles(6)` y `getFeaturedVehicles(200)`; ambos
  ordenan por cuota ascendente. Si un coche caro no aparece, es por el `limit`.
- Etiqueta libre: columna `badge_text`.

### 18.4 Crear una ficha nueva

No se crea a mano: **la ficha se genera sola** en cuanto el modelo tiene un
vehículo activo. La URL será `/renting-<marca>-<modelo>`. Si un modelo existe
pero no tiene vehículos activos, la URL devuelve 404 a propósito (§5.2).

### 18.5 Cambiar imágenes

- **Fotos de un coche:** sustituye los `.webp` en `public/coches-nuevos/` y
  reejecuta la ficha (o `update vehicle_images set storage_path = …`).
  La primera foto (`sort_order = 0`, `is_primary = true`) es la de la tarjeta,
  y también se guarda en `vehicles.main_image_url`.
- **Fondos de sección:** los `.webp` de la raíz de `public/`
  (`hero-bg`, `empresas-bg`, `autonomos-bg`, `contacto-bg`, `calculadora-bg`,
  `testimonios-bg`, `ficha-bg`, `cierre-bg`, `hero-car`).
- **Vídeos:** `public/videos/` (mp4 + webm + póster webp). Uno nuevo:
  `node scripts/build-section-video.mjs <url-o-ruta> --nombre <nombre>`.
- **Logo:** `public/logo.svg`. Si cambia, revisa que el filtro
  `brightness(0) invert(1)` de `Logo.tsx` siga dando blanco puro.

### 18.6 Añadir una página nueva

1. Crea `src/app/(public)/<ruta>/page.tsx`.
2. Exporta `metadata` con **`pageMetadata({ title, description, path })`**.
3. Estructura estándar de sección:
   ```tsx
   <section className="surface-black section-y">
     <Reveal className="section-head">
       <p className="section-label">Etiqueta</p>
       <h2 className="display-md text-white">Titular</h2>
     </Reveal>
     …
   </section>
   ```
4. Añade la ruta a la lista `staticEntries` de **`src/app/sitemap.ts`**.
5. Enlázala desde `Header.tsx` (`NAV_LINKS`) o `Footer.tsx`.
6. Si necesita datos, usa una función de `src/lib/data/` (y respeta la regla
   de "nunca lanza").
7. Añade `BreadcrumbJsonLd` y, si encaja, `WebPageJsonLd`.

### 18.7 Modificar el menú

- **Escritorio y móvil:** array `NAV_LINKS` al principio de
  `src/components/layout/Header.tsx`.
- **Mega-menú de marcas:** se alimenta solo desde la BD
  (`(public)/layout.tsx` → `getVehiclesByBrand()` → `Header brands={…}`).
  Para que salga una marca, basta con que tenga un vehículo activo.
- **Pie de página:** las tres listas de `Footer.tsx` (Plataforma, Empresa,
  Contacto y legal) más la fila de marcas destacadas.

### 18.8 Modificar formularios

- **Campos visibles / textos:** `src/components/forms/LeadForm.tsx`.
- **Validación:** `src/lib/validations/lead.ts` (zod).
- **Lógica de guardado y notificación:** `src/lib/actions/leads.ts`.
- **Columnas nuevas:** hacen falta los cuatro pasos —
  migración SQL nueva + `src/types/database.types.ts` + `leadFormSchema` +
  el `insert` de `createLead`, y probablemente también las notificaciones.
- **No quites el honeypot (`website`) ni el checkbox `rgpd`.**

### 18.9 Cambiar un CTA

- **Texto del botón del formulario:** prop `submitLabel` de `<LeadForm />`.
- **Mensaje prerellenado de WhatsApp:** el argumento de `buildWhatsAppLink()`
  en cada punto de uso (`Header`, `Footer`, `WhatsAppButton`, `VehicleCard`,
  `catalogo/page.tsx`, `[slug]/page.tsx`, `page.tsx`).
- **Número de WhatsApp:** variable `NEXT_PUBLIC_WHATSAPP_NUMBER` (o el valor
  por defecto en `lib/constants.ts`). **Cámbialo ahí, en un solo sitio.**
- **Estilo:** clases `.btn-primary` / `.btn-ghost` / `.btn-white` /
  `.btn-whatsapp` de `globals.css`.

### 18.10 Cambiar el diseño de una sección

1. Localiza la sección en su `page.tsx` (la home las tiene rotuladas con
   comentarios `/* ══ NOMBRE ══ */`).
2. Cambia **clases existentes de `globals.css`**, no inventes estilos nuevos.
3. Si necesitas un estilo que no existe, añádelo a `globals.css` **junto a sus
   hermanos** y con un comentario que explique el porqué.
4. Comprueba móvil y `prefers-reduced-motion`.
5. Si tocas color sobre fondo oscuro, mide el contraste y déjalo escrito.

### 18.11 Añadir un artículo al blog

Los artículos viven en la tabla `blog_posts`. Para publicar uno:

```sql
insert into blog_posts (title, slug, excerpt, content, cover_image_url,
                        status, published_at)
values ('Título', 'slug-del-articulo', 'Entradilla…',
        '# Markdown del artículo…', '/img/portada.webp',
        'published', now());
```

`content` se renderiza con `src/components/blog/Markdown.tsx` (títulos,
listas, citas, negrita, cursiva y enlaces; **no interpreta HTML en bruto**).
La ruta `/blog/[slug]` usa `generateStaticParams`, así que **el artículo nuevo
aparece tras el siguiente build o revalidación**. Referencia de estilo y
formato: `scripts/_posts_iniciales.py` y `scripts/_posts_tanda2.py`.

### 18.12 Añadir una integración

- **Analítica:** `src/app/layout.tsx` (o un componente cliente montado desde
  `(public)/layout.tsx`). **Respeta `ml_cookie_pref` del banner de cookies.**
- **Servicio externo llamado desde el servidor:** crea un módulo en
  `src/lib/notifications/` (o una carpeta hermana) con `import "server-only"`,
  lee su clave de una variable **sin** `NEXT_PUBLIC_`, y devuelve `false` en
  vez de lanzar si falta la configuración — como hacen `web3forms.ts` y
  `telegram.ts`.
- **Documenta la variable nueva en `.env.example`** y añádela en Vercel.

### 18.13 Añadir una marca o un dominio nuevo

- **Marca comercial nueva** (otro dominio sobre la misma app): añade la
  entrada a `BRANDS` en `src/lib/brand.ts` y apunta el DNS al proyecto de
  Vercel. Hereda catálogo y lógica.
- **Marca de coche nueva:** se crea sola al dar de alta un coche
  (`add_vehicle.py` hace `get_or_create_brand`). Solo hay que aportar el logo
  (§18.1, paso 4).

---

## 19. PROMPT DE INICIO PARA EL NUEVO CLAUDE CODE

> Copia desde aquí hasta el final y pégalo al empezar.

---

**Estás tomando el control de los proyectos MoviLease y Quiero Renting (y de
dos webs más del mismo dueño: La Ponce y Adri Daganzo). A continuación tienes
toda la documentación necesaria sobre su arquitectura, código, diseño,
negocio, funcionalidades y reglas de desarrollo.**

**Lo primero que tienes que entender: NO son cuatro proyectos parecidos. Son
dos sistemas técnicos distintos y no hay que mezclarlos.**

- **movilease.es** → aplicación **Next.js 15 (App Router) + React 19 +
  TypeScript + Tailwind v4 + Supabase**, desplegada en Vercel desde el
  repositorio `quierorenting-collab/movilease`. Rama de producción `master`.
  30 marcas, 73 vehículos, 72 fichas, 9 artículos de blog.
- **quierorenting.es, laponce.es, adridaganzo.com** → **HTML estático escrito
  a mano**, servido tal cual desde Vercel. Sin framework, sin build, sin
  `npm install`. Todo el CSS y el JS van **inline dentro de cada `.html`**.
  **No hay repositorio conocido de ninguna de las tres.**

**Aviso importante:** si lees `docs/PROMPT-WEBS.md`, ese documento dice que
quierorenting.es sirve la misma aplicación Next.js. **Eso es falso.**
Comprobado el 01/09/2026: quierorenting.es sirve un único HTML estático de
133 KB con marca verde `#18a05a`. El código de MoviLease **está preparado**
para servirla (`src/lib/brand.ts`), pero el dominio no apunta ahí.

**Antes de escribir una línea de código en MoviLease:**

1. Lee **`AGENTS.md`**: este **no** es el Next.js que recuerdas. Consulta la
   guía en `node_modules/next/dist/docs/`. `cookies()`, `headers()` y `params`
   son **asíncronos**.
2. Ejecuta **`npm install`** (en una sesión nueva `node_modules` no existe).
3. Copia `.env.example` a `.env.local` y pide los valores. Sin
   `SUPABASE_SERVICE_ROLE_KEY` no puedes dar de alta coches con el script
   normal (hay una vía alternativa: `scripts/ficha_a_sql.py`).
4. Verifica **siempre** con **`npm run lint` y `npm run build`** antes de
   commitear. **No hay tests.**

**Las diez reglas que más importan:**

1. **Comentarios en español explicando el PORQUÉ**, nunca el qué. Los
   comentarios de este código son decisiones documentadas: léelos antes de
   deshacer nada.
2. **Commits en español**, sin prefijos `feat:`, con cuerpo que explique el
   problema, la decisión y **cómo se verificó**.
3. **Nunca empujes a `master` sin permiso explícito.**
4. **Elige bien el cliente de Supabase.** `createPublicClient()` (sin cookies)
   para contenido público; `createClient()` (con cookies) solo donde hace
   falta sesión. Usar el de cookies en una página con `generateStaticParams`
   **revienta producción con un 500**. Ya pasó una vez.
5. **La capa de datos nunca lanza**: devuelve `[]` o `null` y la página se
   degrada, no se cae.
6. **No inventes estilos:** casi siempre la clase ya existe en
   `src/app/globals.css` (911 líneas, todo el sistema de diseño). No crees
   `tailwind.config.js`: Tailwind v4 se configura en el CSS.
7. **Los precios están en la base de datos, en céntimos y con el IVA ya
   incluido.** No hay ningún cálculo de IVA en el código. Nunca escribas una
   cuota de 0 € (en las láminas del proveedor un 0 significa "ese kilometraje
   no se ofrece").
8. **Toda página nueva usa `pageMetadata()`**, entra en `sitemap.ts` y se
   enlaza desde el header o el footer.
9. **Nada que no sea público lleva el prefijo `NEXT_PUBLIC_`. Jamás.**
   Y nada de secretos en el repositorio.
10. **Móvil primero, contraste medido y `prefers-reduced-motion` respetado en
    todas las animaciones.** Si añades una animación, añade su excepción.

**Cómo se gestiona el catálogo hoy (importante):** el panel de administración
son **stubs a la espera de la "Fase 4"**. Cambiar un precio o añadir un coche
**no se hace por la web**: se hace con `python scripts/add_vehicle.py
scripts/fichas/<coche>.json`, o generando el SQL con
`python scripts/ficha_a_sql.py …` y pegándolo en el SQL Editor de Supabase.

**Estado abierto que deberías conocer nada más empezar:**

- El **SEAT León FR** tiene ficha, fotos y SQL listos
  (`supabase/alta_seat_leon.sql`) pero **no está publicado**:
  `/renting-seat-leon` da 404. Falta ejecutar ese SQL.
- **`/aviso-legal` está publicado con un texto de marcador de posición** en
  lugar de los datos fiscales reales. Es un incumplimiento legal visible.
- **No hay analítica de ningún tipo** en movilease.es.
- 🚨 **quierorenting.es tiene la clave de Web3Forms y el token del bot de
  Telegram escritos en texto plano dentro de su HTML público.** Hay que
  rotarlos. No los copies ni los publiques.
- 🐞 **adridaganzo.com**: el formulario de contacto no envía nada (solo un
  `alert`) y la analítica tiene IDs de ejemplo.
- 🐞 **laponce.es**: la cuenta atrás lleva parada desde el 24/06/2026 porque
  no hay eventos futuros en el array `EVENTS`. **Pregunta las fechas reales
  antes de tocarlo. No te las inventes.**

**Protocolo para cada encargo:** entender la petición → localizar archivos →
analizar dependencias → revisar impacto → leer los comentarios existentes →
implementar el cambio mínimo → `npm run lint` + `npm run build` → comprobar
responsive → comprobar accesibilidad → explicar claramente qué has cambiado.

**Si algo no lo puedes comprobar, dilo. No rellenes huecos a ojo.**

**El documento completo, con rutas, esquemas, decisiones históricas y guías
paso a paso, está en `docs/HANDOFF-MAESTRO.md`. Léelo entero antes de tocar
nada.**

**Mi encargo es:** _<describe aquí lo que quieres>_

---

*Fin del documento. Verificado contra el código y contra las webs en
producción el 1 de septiembre de 2026.*
