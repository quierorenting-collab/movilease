# DOCUMENTO MAESTRO DE TRASPASO — Ecosistema web de Adri Daganzo

> **Qué es esto.** Todo lo que hace falta saber para seguir desarrollando estas
> webs sin volver a explicar nada. Está escrito para pegarse entero en una
> sesión nueva de Claude Code (o para decirle *"lee `docs/HANDOFF-MAESTRO.md`
> entero antes de tocar nada"*).
>
> **Fecha de verificación: 31 de agosto de 2026.** Todo lo que se afirma aquí
> está comprobado leyendo el código de este repositorio y consultando las webs
> en producción ese día (cabeceras HTTP, DNS, HTML servido, sitemaps), o
> ejecutando el proyecto (`npm install`, `npm run lint`, `npm run build`).
> Lo que **no** se ha podido comprobar aparece marcado como
> `NO CONFIRMADO — REQUIERE REVISIÓN`. Nada está inventado.
>
> Sustituye a `docs/PROMPT-WEBS.md` (26/08/2026), que sigue siendo válido en
> casi todo pero **contiene un error importante ya corregido aquí**: decía que
> quierorenting.es servía esta misma aplicación Next.js, y no es así (§2.2, §7).


> **Dónde encaja este documento (01/09/2026).** Es la **referencia larga y
> exhaustiva**. Para el día a día hay dos documentos más cortos:
>
> - `docs/CONTEXTO-MAESTRO.md` — el contexto que se le pega a un Claude nuevo.
>   Se carga solo en cada sesión desde `CLAUDE.md`.
> - `docs/MIGRACION-NUEVO-CLAUDE.md` — guía de accesos para el propietario.
>
> Todo lo que este documento afirmaba se ha vuelto a comprobar el **01/09/2026**
> y **sigue siendo cierto**: quierorenting.es continúa sin servir la aplicación
> Next.js, sigue sin haber ISR en producción, el SEAT León sigue devolviendo 404,
> las páginas legales siguen sin redactar y movilease.es sigue sin analítica.

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Repositorios y accesos necesarios](#2-repositorios-y-accesos-necesarios)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Arquitectura y funcionamiento](#5-arquitectura-y-funcionamiento)
6. [MoviLease — contexto funcional y de negocio](#6-movilease--contexto-funcional-y-de-negocio)
7. [Quiero Renting — contexto funcional y de negocio](#7-quiero-renting--contexto-funcional-y-de-negocio)
8. [Catálogo y gestión de vehículos](#8-catálogo-y-gestión-de-vehículos)
9. [Componentes importantes](#9-componentes-importantes)
10. [Formularios y leads](#10-formularios-y-leads)
11. [Variables de entorno y configuración](#11-variables-de-entorno-y-configuración)
12. [Despliegue](#12-despliegue)
13. [SEO, analítica y tracking](#13-seo-analítica-y-tracking)
14. [Estado actual del proyecto](#14-estado-actual-del-proyecto)
15. [Historial de decisiones importantes](#15-historial-de-decisiones-importantes)
16. [Reglas que debes respetar siempre](#16-reglas-que-debes-respetar-siempre)
17. [Protocolo de trabajo](#17-protocolo-de-trabajo)
18. [Guía rápida para modificaciones habituales](#18-guía-rápida-para-modificaciones-habituales)
19. [Prompt de inicio para el nuevo Claude Code](#19-prompt-de-inicio-para-el-nuevo-claude-code)

---

# 1. RESUMEN EJECUTIVO

Hay **cuatro webs en producción**, y son **dos mundos técnicos distintos**. No
conviene mezclarlos mentalmente:

| Web | Qué es | Sistema | Código |
|---|---|---|---|
| **movilease.es** | Renting de coches para particulares, autónomos y empresas. La marca principal y la web nueva. | **A** — Next.js 15 + Supabase | **Este repositorio** |
| **quierorenting.es** | La marca de captación anterior. Web **independiente**, HTML estático de una sola página + ~85 landings de SEO. Sigue viva y sigue captando leads. | **B** — HTML estático | Fuera de este repo (§2) |
| **laponce.es** | Conciertos de música urbana en Oh My Club, Madrid. | **B** — HTML estático | Fuera de este repo (§2) |
| **adridaganzo.com** | Portfolio que agrupa La Ponce, Hypeland, Quiero Renting, First Class Booking y VIP Concierge. | **B** — HTML estático | Fuera de este repo (§2) |

**Sistema A** — aplicación Next.js 15 (App Router) con base de datos Supabase,
panel de administración, ISR configurado, build y despliegue en Vercel. Es lo
único que vive en este repositorio y donde se concentra el 95 % del trabajo
técnico.

**Sistema B** — HTML escrito a mano y servido tal cual desde Vercel. Sin
framework, sin bundler, sin `npm install`, sin build. **Todo el CSS y el JS van
inline dentro de cada `.html`**, así que lo que sirve el dominio *es* el código
fuente.

**Objetivo de negocio de las cuatro:** generar contactos (leads) que acaben en
una conversación de WhatsApp, pero **no al mismo número y es a propósito**: las
dos webs de renting usan **+34 644 15 67 97** (`34644156797`) y laponce.es y
adridaganzo.com usan **+34 613 26 73 75** (`34613267375`). Ninguno es "el
antiguo" — son las dos líneas del negocio.

**Punto crítico a entender desde el minuto uno:** MoviLease y QuieroRenting
**no son la misma web con otra marca**. El código de este repositorio *soporta*
servir dos marcas por dominio (`src/lib/brand.ts`), pero hoy
**quierorenting.es no apunta a esta aplicación**: sirve un HTML estático
antiguo y completamente separado. Si te piden "cambiar algo en Quiero Renting",
lo más probable es que **no se toque este repositorio**. Ver §7.

---

# 2. REPOSITORIOS Y ACCESOS NECESARIOS

## 2.1 MoviLease (este repositorio)

| Campo | Valor |
|---|---|
| **Repositorio** | `quierorenting-collab/movilease` (GitHub) |
| **Rama principal** | `master` |
| **Rama de trabajo actual** | `claude/project-handoff-master-doc-f9menb` |
| **URL de producción** | https://movilease.es |
| **Dominio** | `movilease.es` — DNS A → `76.76.21.21` (Vercel). `www.movilease.es` responde **308** hacia `movilease.es` (redirección declarada en `next.config.ts`). Verificado 31/08/2026. |
| **Hosting / despliegue** | **Vercel** (cabecera `server: Vercel`, `x-vercel-id`, `x-vercel-cache`). Región observada: `iad1`. |
| **Registrador del dominio** | `NO CONFIRMADO — REQUIERE REVISIÓN`. Las otras dos webs del ecosistema están en DonDominio; comprobar si movilease.es también. |
| **Base de datos** | Supabase (proyecto real en producción; su URL y claves viven en variables de entorno, nunca en el repo) |
| **Servicios externos** | Supabase (BD + Auth + Storage), Web3Forms (email de leads), Telegram Bot API (aviso instantáneo de leads), `fotos.quecochemecompro.com` (CDN de fotos heredada), Google Search Console |
| **Cuenta de Vercel / equipo propietario** | `NO CONFIRMADO — REQUIERE REVISIÓN` |
| **Proyecto Supabase (ref/organización)** | `NO CONFIRMADO — REQUIERE REVISIÓN` |

Historia del repo: **53 commits**, del **29/07/2026** al **26/08/2026**. Todos
los mensajes de commit están en español, sin prefijos tipo `feat:`, con cuerpo
que explica el problema, la decisión y cómo se verificó. **Imita ese estilo.**

## 2.2 Quiero Renting

| Campo | Valor |
|---|---|
| **Repositorio** | `NO CONFIRMADO — REQUIERE REVISIÓN`. No hay ninguno conocido; el sitio se sirve como ficheros estáticos. Ver §2.5 para recuperar el código. |
| **URL de producción** | https://quierorenting.es |
| **Dominio** | `quierorenting.es` — DNS A → `76.76.21.93`, `76.76.21.21`, `66.33.60.194` (todos de Vercel). Verificado 31/08/2026. |
| **Hosting / despliegue** | **Vercel**, sirviendo HTML estático (`content-disposition: inline`, `etag`, `last-modified`, `x-vercel-cache: HIT`; **no** aparece `x-powered-by: Next.js`). |
| **Framework** | **Ninguno.** HTML+CSS+JS escritos a mano, todo inline. |
| **Estructura** | `/` (una página de 133 KB, 2.014 líneas) + **85 landings** listadas en `sitemap.xml` |
| **Estado actual** | En producción y captando leads. **No recibe mantenimiento desde este repositorio.** `sitemap.xml` marca `lastmod` **2026-06-18** en todas las URLs. |
| **Servicios externos** | Web3Forms (email), Telegram Bot API, `fotos.quecochemecompro.com` |

⚠️ **Riesgo de seguridad ya detectado (ver §14):** el JavaScript inline de
quierorenting.es lleva **la API key de Web3Forms y el token + chat id del bot de
Telegram escritos en claro**, visibles para cualquiera que abra el código fuente
de la página. Hay que **rotar esas credenciales** y sacarlas del cliente. En
este documento no se reproducen los valores a propósito.

## 2.3 La Ponce

| Campo | Valor |
|---|---|
| **Repositorio** | `NO CONFIRMADO — REQUIERE REVISIÓN` (ninguno conocido) |
| **URL** | https://laponce.es |
| **Hosting** | **Vercel**, HTML estático. `last-modified: 26/08/2026`. |
| **Dominio** | DonDominio (según verificación del 26/08/2026 recogida en `docs/PROMPT-WEBS.md`) |
| **Framework** | Ninguno. **1 sola página** de ~105 KB con todo el CSS y el JS inline. |
| **Estado** | En producción, **con la cuenta atrás rota desde junio** (§14). |

## 2.4 Adri Daganzo (portfolio)

| Campo | Valor |
|---|---|
| **Repositorio** | `NO CONFIRMADO — REQUIERE REVISIÓN` (ninguno conocido) |
| **URL** | https://adridaganzo.com |
| **Hosting** | **Vercel**, HTML estático. `last-modified: 26/08/2026`. |
| **Dominio** | DonDominio (verificado 26/08/2026) |
| **Framework** | Ninguno. Home de ~211 KB + ~35 landings de SEO local + versión `/en/` incompleta. |
| **Estado** | En producción. **El formulario de contacto no envía nada** (§14). |

## 2.5 Cómo recuperar el código de las webs del Sistema B

Mientras no exista repositorio, esta es la vía. El resultado es editable y
desplegable tal cual, porque **el HTML se sirve sin minificar y con
comentarios**:

```bash
# quierorenting.es — el sitemap lista las 86 URLs
mkdir -p quierorenting && cd quierorenting
curl -s https://quierorenting.es/sitemap.xml \
  | grep -oE '<loc>[^<#]+</loc>' | sed 's|</\?loc>||g' | sort -u > urls.txt
while read -r u; do
  slug=$(echo "$u" | sed 's|https://quierorenting.es/||; s|/$||')
  [ -z "$slug" ] && slug=index
  mkdir -p "$(dirname "$slug")"
  curl -s "$u" -o "$slug.html"
done < urls.txt
curl -s -O https://quierorenting.es/robots.txt
curl -s -O https://quierorenting.es/sitemap.xml

# adridaganzo.com — mismo procedimiento con su sitemap
# laponce.es — una sola página + su carpeta fotos/
mkdir -p ../laponce/fotos && cd ../laponce
curl -s https://laponce.es/ -o index.html
grep -oE 'fotos/[a-z0-9._-]+\.(jpg|jpeg|png|webp)' index.html | sort -u \
  | while read -r f; do curl -s "https://laponce.es/$f" -o "$f"; done
```

Faltará lo que no esté enlazado en el HTML (iconos sueltos, imágenes de Open
Graph). Compruébalo con la pestaña *Network* del navegador antes de dar el
volcado por bueno.

**Despliegue del Sistema B en Vercel:** un proyecto de HTML estático no necesita
configuración. Se conecta el repo y se sirve la raíz. Sin `package.json`, sin
comando de build. El nombre de la carpeta es la URL:
`renting-seat-ibiza/index.html` → `/renting-seat-ibiza/`.

## 2.6 El control real de las webs

Son tres piezas independientes y se pueden tener unas sin otras:

| Pieza | Sistema A | Sistema B |
|---|---|---|
| **Dominio** | movilease.es | quierorenting.es, laponce.es, adridaganzo.com |
| **Despliegue** | Vercel | Vercel |
| **Código** | Este repositorio | **Sin repositorio conocido** |

**El dominio es la palanca definitiva:** quien controla el DNS decide a dónde
apunta la web, pase lo que pase con lo demás. Para el Sistema B conviene
comprobar en vercel.com si los proyectos están en cuenta propia o de un tercero,
y en *Project → Settings → Git* si hay repositorio conectado:

- **Hay repo** → pasarlo a la organización propia y autorizarlo para Claude.
- **No hay repo** → crearlo con el volcado de §2.5 y conectar el proyecto.
- **Cuenta ajena sin colaboración** → con el dominio en la mano, se crean
  proyectos nuevos y se repunta el DNS.

**Orden correcto: primero la cuenta, después el código.** Mientras otra persona
conserve acceso al proyecto de Vercel puede volver a desplegar desde su copia y
pisar los cambios.

---

# 3. STACK TECNOLÓGICO

Todo lo siguiente es del **Sistema A** (este repositorio). El Sistema B no tiene
stack: es HTML a pelo.

## 3.1 Dependencias de producción (`package.json`)

| Paquete | Versión declarada | Para qué |
|---|---|---|
| `next` | `^15.5.22` | Framework (App Router). Instalado y verificado: **15.5.22** |
| `react` / `react-dom` | `^19.2.4` | React 19 |
| `@supabase/ssr` | `^0.12.3` | Clientes Supabase para servidor/navegador con cookies |
| `@supabase/supabase-js` | `^2.110.9` | SDK de Supabase (usado con la service role) |
| `framer-motion` | `^12.42.2` | Animaciones de header, menú móvil, pop-up, contadores |
| `zod` | `^4.4.3` | Validación del formulario de leads y del body de `/api/favorites/resolve` |
| `server-only` | `^0.0.1` | Hace fallar el build si un componente cliente importa un módulo de servidor |

## 3.2 Dependencias de desarrollo

`typescript ^5`, `tailwindcss ^4`, `@tailwindcss/postcss ^4`, `eslint ^9`,
`eslint-config-next ^15.5.22`, `@types/node ^20`, `@types/react ^19`,
`@types/react-dom ^19`.

**No hay framework de tests.** No existe `jest`, `vitest`, `playwright` ni
carpeta `__tests__`. La verificación es `npm run lint` + `npm run build` +
mirarlo en el navegador.

## 3.3 Lenguajes y herramientas auxiliares

- **TypeScript** en modo `strict` (`tsconfig.json`), alias `@/*` → `./src/*`.
- **Tailwind CSS v4**: `@import "tailwindcss"` + bloque `@theme inline` dentro de
  `src/app/globals.css`. **No existe `tailwind.config.js` y no debe crearse.**
- **Python 3** (`requests`) para los scripts de catálogo — `scripts/*.py`.
- **Node + `sharp`** para los scripts de imagen — `scripts/*.mjs`.
- **ffmpeg** (fuera del repo) lo usa `scripts/build-section-video.mjs`.

## 3.4 Comandos

```bash
npm install        # obligatorio en una sesión nueva: node_modules NO está en el repo
npm run dev        # servidor de desarrollo en http://localhost:3000
npm run build      # build de producción — verificación obligatoria antes de commitear
npm run start      # sirve el build
npm run lint       # eslint — verificación obligatoria antes de commitear
```

**Estado verificado 31/08/2026:** `npm run lint` termina **sin ningún aviso** y
`npm run build` **compila correctamente** (32 páginas generadas, 26,1 s,
First Load JS compartido 102 kB). No hay deuda de lint ni de tipos pendiente.

## 3.5 Base de datos y backend

- **Supabase (PostgreSQL)**: 12 tablas, enums en SQL, RLS activo en todas.
- **Auth**: Supabase Auth con email + contraseña, solo para `/admin`.
- **Storage**: bucket `vehicle-images` (usado por `scripts/upload_images.py`).
- **Backend propio**: no hay servidor aparte. Todo son Server Components,
  Server Actions y tres Route Handlers de Next.js.

---

# 4. ESTRUCTURA DEL PROYECTO

## 4.1 Árbol real (sin `node_modules`)

```
movilease/
├── AGENTS.md                    # aviso obligatorio sobre esta versión de Next.js
├── CLAUDE.md                    # una línea: @AGENTS.md
├── README.md                    # el de create-next-app, SIN personalizar (§14)
├── .env.example                 # plantilla de variables (sin valores)
├── next.config.ts               # redirección www + política de imágenes
├── eslint.config.mjs            # next/core-web-vitals + next/typescript
├── postcss.config.mjs           # @tailwindcss/postcss
├── tsconfig.json                # strict, alias @/*
├── package.json / package-lock.json
├── .claude/
│   └── launch.json              # config de depuración (rutas de Windows)
├── docs/
│   ├── HANDOFF-MAESTRO.md       # ESTE documento
│   └── PROMPT-WEBS.md           # traspaso anterior (26/08/2026)
├── public/                      # ~7,5 MB de estáticos
│   ├── logo.svg  logo.png       # logo real de MoviLease
│   ├── brand/movilease-logo.png
│   ├── brands/                  # 28 logos de marca (SVG y PNG)
│   ├── coches-nuevos/           # 139 fotos .webp de 20 coches
│   ├── img/                     # 3 fotos de sección
│   ├── videos/                  # 4 vídeos + pósters (2,9 MB)
│   └── *-bg.webp                # fondos de sección (hero, ficha, contacto…)
├── scripts/                     # gestión del catálogo (Python + Node)
│   ├── _env.py                  # carga .env.local sin dependencias
│   ├── add_vehicle.py           # ALTA/ACTUALIZACIÓN de un coche ← el principal
│   ├── ficha_a_sql.py           # misma alta pero como SQL, sin credenciales
│   ├── fichas/*.json            # 20 fichas de coche en formato propio
│   ├── build-galleries.mjs      # genera el bloque "images" de una ficha
│   ├── slice-photo-sheet.mjs    # trocea hojas de contacto del Drive
│   ├── galerias_quecoche.py     # rellena galerías desde quecochemecompro.com
│   ├── build-section-video.mjs  # clip de stock → fondo de sección + póster
│   ├── optimize-brand-logos.mjs # reescala logos de marca a 240 px
│   ├── _fichas_drive.py         # genera los JSON desde las láminas del Drive
│   ├── _posts_iniciales.py      # siembra de los 4 primeros artículos
│   ├── _posts_tanda2.py         # siembra de los 5 artículos siguientes
│   ├── seed_db.py               # siembra inicial del catálogo
│   ├── generate-catalog-seed.mjs# convierte el array CARS de QR a SQL
│   ├── upload_images.py         # sube fotos a Supabase Storage
│   └── mark_all_featured.py     # marca todos los activos como destacados
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init.sql        # esquema completo, enums, RLS, triggers
│   │   ├── 0002_grants.sql      # GRANTs de tabla (imprescindibles con RLS)
│   │   ├── 0003_lead_fields.sql # campos extra del lead
│   │   └── 0004_vehicle_detail_fields.sql  # ficha completa + vehicle_pricing
│   ├── seed.sql                 # siembra mínima
│   ├── seed_catalog_real.sql    # catálogo real de quierorenting.es (80 coches)
│   └── alta_seat_leon.sql       # ⚠ PENDIENTE DE EJECUTAR (§14)
└── src/
    ├── middleware.ts            # protege SOLO /admin/:path*
    ├── app/
    │   ├── layout.tsx           # raíz: fuentes, metadatos por marca, <html lang="es">
    │   ├── globals.css          # ⭐ 911 líneas: TODO el sistema de diseño
    │   ├── error.tsx  not-found.tsx
    │   ├── opengraph-image.tsx  # imagen 1200×630 generada en build
    │   ├── robots.ts  sitemap.ts
    │   ├── (public)/
    │   │   ├── layout.tsx       # Header + Footer + WhatsApp + pop-up + cookies
    │   │   ├── page.tsx         # ⭐ HOME, 910 líneas, ~11 secciones
    │   │   ├── [slug]/page.tsx  # ⭐ FICHA DE MODELO o landing SEO, 813 líneas
    │   │   ├── catalogo/page.tsx# ⭐ CATÁLOGO con filtros, 508 líneas
    │   │   ├── blog/page.tsx  blog/[slug]/page.tsx
    │   │   ├── calculadora/  comparador/  favoritos/
    │   │   ├── contacto/  sobre-nosotros/
    │   │   ├── renting-empresas/  renting-autonomos/
    │   │   └── aviso-legal/  politica-privacidad/  politica-cookies/
    │   ├── admin/
    │   │   ├── layout.tsx  login/page.tsx
    │   │   └── (dashboard)/     # 8 páginas, TODAS son stubs de "Fase 4"
    │   └── api/
    │       ├── leads/route.ts
    │       ├── revalidate/route.ts
    │       └── favorites/resolve/route.ts
    ├── components/
    │   ├── layout/    Header, Footer, WhatsAppButton
    │   ├── home/      HeroVideo, HeroImage, HeroContent, HeroCanvas,
    │   │              FAQAccordion, LeadPopup, CookieBanner
    │   ├── vehicles/  VehicleCard, VehicleGallery, VehiclePricingTable,
    │   │              FavoriteButton, CompareButton, ComparisonBar,
    │   │              FavoritosClient
    │   ├── catalog/   BrandCard
    │   ├── forms/     LeadForm
    │   ├── calculator/RentingCalculator
    │   ├── blog/      Markdown
    │   ├── seo/       JsonLd
    │   ├── admin/     Sidebar
    │   └── ui/        Button, Container, Logo, Reveal, Parallax, VideoBackdrop
    ├── hooks/         useLocalStorageIds, useFavorites, useComparison
    ├── lib/
    │   ├── brand.ts          # multimarca por host
    │   ├── constants.ts      # contacto, etiquetas de enums, defaults
    │   ├── metadata.ts       # pageMetadata() ← usar en TODA página nueva
    │   ├── utils.ts          # formatPriceFromCents
    │   ├── brand-logos.ts    # nombre de marca → /brands/<slug>.<ext>
    │   ├── auth.ts           # getCurrentProfile, requireRole
    │   ├── supabase/         # server.ts, client.ts, admin.ts, middleware.ts
    │   ├── data/             # vehicles.ts, blog.ts, landing.ts  ← capa de datos
    │   ├── actions/leads.ts  # Server Action createLead
    │   ├── notifications/    # web3forms.ts, telegram.ts, types.ts
    │   └── validations/lead.ts
    ├── scripts/        # ⚠ scripts Python HEREDADOS, duplican scripts/ (§14)
    └── types/database.types.ts  # tipos de la BD escritos A MANO
```

Total: **94 archivos** en `src/`, **11.020 líneas** de TS/TSX/CSS.

## 4.2 Los archivos que más importan

| Archivo | Líneas | Por qué es crítico |
|---|---|---|
| `src/app/globals.css` | 911 | **Todo el sistema de diseño.** Antes de inventar un estilo, búscalo aquí: casi siempre ya existe la clase. |
| `src/app/(public)/page.tsx` | 910 | La home entera. Contiene además los datos de stats, testimonios, FAQ y tabla comparativa, escritos en constantes al principio del archivo. |
| `src/app/(public)/[slug]/page.tsx` | 813 | Ficha de modelo **y** landing SEO en el mismo archivo, resueltas por slug. |
| `src/lib/data/vehicles.ts` | 509 | Toda la lectura del catálogo. Cambiar una consulta aquí afecta a home, catálogo, ficha, comparador, sitemap y footer a la vez. |
| `src/app/(public)/catalogo/page.tsx` | 508 | Filtros por marca, categoría, combustible y presupuesto. |
| `src/components/layout/Header.tsx` | 364 | Menú, mega-menú de marcas, menú móvil con trampa de foco. |
| `src/types/database.types.ts` | 267 | Tipos de la BD **escritos a mano**. Ver la advertencia de §5.5. |

---

# 5. ARQUITECTURA Y FUNCIONAMIENTO

## 5.1 Antes de escribir una sola línea

`AGENTS.md` (cargado automáticamente vía `CLAUDE.md`) avisa:

> **This is NOT the Next.js you know.** Esta versión trae cambios que rompen
> compatibilidad con lo que recuerdas. Lee la guía correspondiente en
> `node_modules/next/dist/docs/` antes de escribir código.

Lo que más muerde en la práctica:

- **`cookies()`, `headers()` y `params` son asíncronos.** Siempre `await`.
- `searchParams` en una página también llega como `Promise`.
- Usar un cliente Supabase **con cookies** en una página que tiene
  `generateStaticParams` revienta en producción con
  *"Page changed from static to dynamic at runtime, reason: headers"*.
  Ya pasó una vez y costó un 500 en los artículos del blog (commit `b5d660c`).

Y en una sesión nueva **`node_modules` no existe**: `npm install` es el primer
comando, siempre.

## 5.2 Multimarca por dominio (`src/lib/brand.ts`)

```ts
BRANDS = {
  "movilease.es":     { name: "MoviLease",     domain, description },
  "quierorenting.es": { name: "QuieroRenting", domain, description },
}
resolveBrand(host)   // normaliza, quita www y puerto, cae en el default
getCurrentBrand()    // server-only, lee headers().get("host")
```

Las dos marcas compartirían catálogo, base de datos y lógica; **solo cambian
nombre y descripción** según el host. Una marca nueva se añade ahí y hereda todo
lo demás.

⚠️ **Hoy esto es una capacidad latente, no una realidad**: `quierorenting.es`
apunta a otro proyecto de Vercel con HTML estático, así que la rama
`"quierorenting.es"` de `BRANDS` **no se ejecuta nunca en producción**. Si algún
día se repunta el DNS de quierorenting.es a esta aplicación, funcionaría sola.

Donde no hay request de la que leer el host (sitemap, robots, panel) se usa
`DEFAULT_BRAND_NAME` / `SITE_URL` de `src/lib/constants.ts`.

`next.config.ts` redirige `www.movilease.es/*` → `movilease.es/*` con
redirección permanente en el edge: había 200 en las dos direcciones y eso partía
la señal de SEO.

## 5.3 Rutas

**Públicas** — `src/app/(public)/`:

| Ruta | Archivo | `revalidate` declarado |
|---|---|---|
| `/` | `page.tsx` | 3600 s |
| `/catalogo` | `catalogo/page.tsx` | 900 s |
| `/[slug]` | `[slug]/page.tsx` — ficha de modelo **o** landing SEO; `notFound()` si no hay ninguna | 1800 s |
| `/blog` | `blog/page.tsx` | 1800 s |
| `/blog/[slug]` | `blog/[slug]/page.tsx` — con `generateStaticParams` | 3600 s |
| `/calculadora`, `/comparador`, `/favoritos` | herramientas de cliente (localStorage) | — |
| `/contacto`, `/sobre-nosotros`, `/renting-empresas`, `/renting-autonomos` | landings estáticas | — |
| `/aviso-legal`, `/politica-privacidad`, `/politica-cookies` | legales (hoy **placeholders**, §14) | — |

**`/[slug]` es un catch-all deliberado**, y este es su orden de resolución:

1. ¿Hay un modelo con ese slug **y con vehículos activos**? → ficha de modelo.
2. ¿Hay una `landing_page` activa con ese slug? → landing SEO.
3. Si no → `notFound()` (404).

**Un modelo sin vehículos activos devuelve 404, no una página vacía.** Se
decidió al retirar el SEAT Arona y el Opel Combo por falta de stock: sus URLs
seguían devolviendo 200 con una ficha sin precio ni fotos, que es justo lo que
no puede encontrarse alguien que llega desde Google. Si vuelve el stock, basta
con reactivar el vehículo: la URL es la misma.

**Panel** — `src/app/admin/`: login con Supabase Auth y un dashboard cuyas ocho
páginas (`vehiculos`, `modelos`, `marcas`, `leads`, `blog`, `seo`, `usuarios` y
el panel) **son stubs a la espera de la "Fase 4"**. Cada una ya llama a
`requireRole([...])` con los roles correctos, así que la seguridad está puesta y
solo falta el contenido. Hoy el catálogo se gestiona con los scripts de §8.

**API** (`src/app/api/`):

| Endpoint | Qué hace |
|---|---|
| `POST /api/leads` | Envoltorio JSON sobre la Server Action `createLead`. Lo usa el pop-up. |
| `POST /api/revalidate` | Invalidación ISR bajo demanda. Protegida por la cabecera `x-revalidate-secret`, no por sesión. |
| `POST /api/favorites/resolve` | Recibe hasta 50 UUIDs (validados con zod) y devuelve las tarjetas actualizadas. Los favoritos viven en el navegador; esto les pone precio actual. |

`src/middleware.ts` cubre **solo `/admin/:path*`**, a propósito: la web pública
no debe depender de que exista un Supabase configurado para renderizar.

## 5.4 Los tres clientes de Supabase — elegir mal rompe producción

`src/lib/supabase/`:

| Función | Cookies | Cuándo usarla |
|---|---|---|
| `createClient()` (`server.ts`) | **Sí** | Solo donde hace falta la sesión del usuario (panel, auth). |
| `createPublicClient()` (`server.ts`) | **No** | Contenido público idéntico para todos: blog, catálogo, fichas. |
| `createAdminClient()` (`admin.ts`) | service role, **se salta RLS** | Solo servidor. Hoy solo para insertar leads. |
| `createClient()` (`client.ts`) | navegador | Solo el login del panel. |

`createPublicClient()` existe porque `cookies()` es una API dinámica: en cuanto
se usa, Next marca la página como dinámica, y si esa página se generaba en el
build con `generateStaticParams`, producción responde 500. Es exactamente el
error que tumbó los artículos del blog (commit `b5d660c`).

⚠️ **Incoherencia real detectada:** `src/lib/data/blog.ts` usa
`createPublicClient()` (correcto), pero **`src/lib/data/vehicles.ts` y
`src/lib/data/landing.ts` siguen usando `createClient()` con cookies**. Es una de
las dos causas de que hoy no haya ISR (§5.7). No es un fallo funcional —el
catálogo es público y la RLS anónima ya devuelve lo que debe— pero sí es lo que
impide cachear.

## 5.5 Capa de datos (`src/lib/data/`)

Todos los módulos llevan `import "server-only"`.

**Regla firme: la capa de datos nunca lanza.** Si Supabase no responde, devuelve
`[]` o `null` y la página se degrada; no se cae. Todas las funciones envuelven
la consulta en `try/catch`.

Funciones de `vehicles.ts`:

| Función | Devuelve | Usada en |
|---|---|---|
| `getOfferVehicles(limit)` | tarjetas con `is_offer = true`, más baratas primero | home (sección Ofertas, `limit = 6`) |
| `getFeaturedVehicles(limit)` | tarjetas con `is_featured = true` | home (`limit = 200`, luego deduplica por modelo y corta a 8) |
| `getCatalogVehicles(filtros)` | hasta 300 tarjetas activas, filtradas por categoría / combustible / precio máximo | catálogo, landings, sitemap |
| `getVehiclesByBrand()` | `{ brands[], vehiclesByBrand{} }` agrupado y ordenado alfabéticamente | catálogo, home, Header, Footer, sitemap |
| `getModelBySlugWithVehicles(slug)` | modelo + marca + versiones + fotos + cuotas | ficha `/[slug]` |
| `getSameBrandModels(marca, excluir, limit)` | hasta 4 modelos hermanos | ficha (enlazado interno) |
| `getComparisonVehicles(ids)` | filas del comparador | `/comparador` |
| `getVehiclesByIds(ids)` | tarjetas por id | `/api/favorites/resolve` |
| `getBrandDisplayName(slug)` | nombre real de la marca (`SEAT`, no `Seat`) | metadatos del catálogo |

**Detalle heredado que hay que respetar:** no se usan los *embeds* de PostgREST
(`select("*, models(...)")`) porque `src/types/database.types.ts` está escrito a
mano y no tiene metadatos de `Relationships`. Marca y modelo se resuelven con
**dos consultas planas y un join en memoria** (`attachModelsAndBrands`). Si
algún día se sustituye ese archivo por la salida de
`supabase gen types typescript`, se podrán usar embeds.

**Advertencia dentro de `database.types.ts` que no se puede ignorar:** los
modelos de fila deben declararse siempre como `type X = {...}`, **nunca**
`interface X {...}`. Una `interface` no satisface `Record<string, unknown>` en el
chequeo de `@supabase/postgrest-js`, y eso vuelve `never` los tipos de
`.insert()` / `.update()` en compilación, sin avisar hasta que se usan.

## 5.6 Esquema de la base de datos

Doce tablas en `supabase/migrations/`:

`profiles` · `brands` · `models` · `vehicles` · `vehicle_images` ·
`vehicle_pricing` · `leads` · `blog_posts` · `seo_metadata` · `landing_pages` ·
`redirects`

Enums definidos en SQL: `user_role`, `fuel_type`, `transmission_type`,
`vehicle_category`, `lead_status`, `lead_source`, `content_status`,
`landing_page_type`, `client_type`, `environmental_label`.

Reglas que hay que conocer antes de tocar el esquema:

1. **Los enums viven en SQL y sus etiquetas en `src/lib/constants.ts`.** Añadir
   un valor obliga a tocar **los dos sitios** (y también
   `src/types/database.types.ts`).
2. **RLS activo en todas las tablas**, con el helper `current_role_is(roles)`.
3. **RLS no sustituye al `GRANT` de tabla.** Postgres deniega antes de evaluar
   ninguna política si falta el grant. Por eso existe `0002_grants.sql`. **Toda
   tabla nueva necesita las dos cosas** (mira cómo lo hace `0004` con
   `vehicle_pricing`).
4. **Triggers**: `prevent_role_self_escalation` (nadie se sube el rol a sí
   mismo) y `handle_new_auth_user` (crea el perfil con el rol más restrictivo).
5. `leads` permite `insert` a `anon`; el `select` está restringido a staff.

## 5.7 ⚠️ Hallazgo importante: hoy NO hay ISR en producción

Los archivos declaran `export const revalidate = 3600 / 1800 / 900`, pero
**ninguna página se está cacheando**. Verificado el 31/08/2026 pidiendo varias
URLs de producción dos veces seguidas:

```
GET https://movilease.es/                      → x-vercel-cache: MISS
GET https://movilease.es/renting-seat-ibiza    → x-vercel-cache: MISS
GET https://movilease.es/blog/renting-sin-entrada → x-vercel-cache: MISS
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
```

Todas las respuestas llegan `no-store` y siempre `MISS`: **cada visita ejecuta el
render completo y sus consultas a Supabase**.

**Causa, comprobada experimentalmente** (dos builds de prueba, revertidos):

1. `src/app/layout.tsx` → `generateMetadata()` llama a `getCurrentBrand()`, que
   lee `headers()`. Eso es una API dinámica en el layout raíz, así que **arrastra
   a todas las rutas**. Quitándola, `/_not-found` y `/admin/login` pasan a
   estáticas.
2. `src/app/(public)/layout.tsx` y `src/components/layout/Footer.tsx` llaman a
   `getVehiclesByBrand()`, que va por `createClient()` **con cookies**. Eso
   dinamiza por su cuenta **todas las rutas públicas**. Cambiándolo a
   `createPublicClient()`, `/sitemap.xml` pasa a estático.

**Las dos causas son suficientes por separado**, así que arreglar solo una no
cambia nada. Para recuperar el ISR habría que:

- pasar `vehicles.ts` y `landing.ts` a `createPublicClient()` (fácil y seguro), **y**
- sacar `getCurrentBrand()` del layout raíz — por ejemplo resolviendo la marca en
  el middleware, o aceptando `MoviLease` como marca fija mientras
  quierorenting.es no apunte aquí (que es la situación real hoy).

**Es una mejora de rendimiento grande y de riesgo medio.** No la hagas por tu
cuenta: propónsela a Adrián primero, porque toca el mecanismo multimarca.

## 5.8 Flujo de una visita típica

1. `layout.tsx` (raíz) — carga Space Grotesk e Inter con `next/font`, resuelve la
   marca por host y monta los metadatos base + verificación de Search Console.
2. `(public)/layout.tsx` — pide las marcas del catálogo a Supabase para el
   mega-menú y pinta `Header`, el `<main>`, `Footer`, botón flotante de WhatsApp,
   `ComparisonBar`, `LeadPopup` y `CookieBanner`.
3. La página pide sus datos a `src/lib/data/*` y renderiza secciones envueltas en
   `Reveal` / `RevealGroup`.
4. El visitante navega, guarda favoritos y comparaciones en `localStorage`, y
   acaba en uno de los tres caminos de contacto: **formulario**, **WhatsApp** o
   **llamada** (§10).

---

# 6. MOVILEASE — CONTEXTO FUNCIONAL Y DE NEGOCIO

## 6.1 Qué es y a quién se dirige

**MoviLease** es un intermediario de renting de vehículos que opera en toda
España. Vende la **simplicidad**: el cliente elige coche, escribe por WhatsApp y
MoviLease se encarga del resto.

- **Público principal:** particulares.
- **Públicos secundarios con landing propia:** **autónomos**
  (`/renting-autonomos`) y **empresas** (`/renting-empresas`).
- **Promesa central:** *sin entrada, todo incluido, respuesta en 48 h*.
- **Slogan:** **"Hazlo fácil. Hazlo MoviLease."** (aparece en grande en el
  footer y en los metadatos de `/sobre-nosotros`).
- **Reclamo del hero (eyebrow):** *"Smart Mobility Platform"* — es también el
  `alt` del logo.

## 6.2 Datos de contacto (`src/lib/constants.ts` — fuente única)

| Dato | Valor |
|---|---|
| WhatsApp / teléfono | `34644156797` → mostrado como `+34 644 15 67 97` |
| Email | `contacto@movilease.es` |
| Instagram | `https://www.instagram.com/quierorenting` (heredado de la marca anterior) |

**No escribas nunca el teléfono a mano en un componente.** Usa `CONTACT` y
`buildWhatsAppLink(mensaje)`, que genera `https://wa.me/<numero>?text=<mensaje>`
con el texto ya codificado.

## 6.3 Branding y diseño

**Colores** (definidos en `:root` de `src/app/globals.css`):

| Token | Valor | Uso |
|---|---|---|
| `--blue` | `#0068FF` | Azul de marca. Botones, acentos, badges. |
| `--blue-light` | `#5AA0FF` | **Azul para TEXTO sobre fondo oscuro.** `#0068FF` sobre `#071A3D` solo llega a 3,1:1 y no pasa AA; este llega a 5,6:1. |
| `--dark` | `#0B2A5E` | Azul marino base (también `themeColor` y fondo del `<body>`) |
| `--dark-2/3/4` | `#10306B` / `#16407F` / `#2358B4` | Escala de superficies oscuras |
| `--ink` | `#0A0A0A` | Texto principal sobre fondo claro |
| `--whatsapp` | `#25D366` | Verde de WhatsApp (y `#1DA851` al pasar el ratón) |

**Texto sobre oscuro:** `--on-dark-1` (`#FFF`), `--on-dark-2` (86 %),
`--on-dark-3` (72 %), `--on-dark-ornament` (30 %). La jerarquía se hace **por
tamaño y peso, no bajando opacidades hasta lo ilegible**. Las opacidades subieron
a 86/72 porque sobre el azul más claro (`#2358B4` de `surface-graphite`) los
valores anteriores se quedaban en 4,5:1 y 3,3:1.

> **Las decisiones de color llevan la ratio de contraste medida en el
> comentario. Mantén esa costumbre: esta web se ha ido midiendo, no estimando.**

**Superficies:** `.surface-black` (`#0B2A5E`), `.surface-dark` (`#10306B`),
`.surface-graphite` (degradado `#2358B4` → `#133A78`), `.surface-carbon`
(degradado de tres paradas), `.card-dark`, `.glass`, `.glass-dark`,
`.bg-texture-light`, `.bg-texture-dark`, `.ambient-blue`, `.ambient-blue-top`.

**Tipografía** (cargada con `next/font` en `layout.tsx`):

- **Space Grotesk** → titulares y cifras (`--font-space-grotesk`)
- **Inter** → texto corrido (`--font-inter`)
- Pesos 400/500/600/700. **El peso 300 se eliminó** porque no se usaba en ningún
  sitio: dos archivos de fuente menos en la primera visita.

Escala tipográfica: `.display-xl`, `.display-lg`, `.display-md`, `.display-sm`,
`.body-lg`, `.body-md`, `.body-sm`, `.section-label`, `.eyebrow`.

**Ritmo vertical:** `.section-y` (`clamp(4.5rem, 9vw, 10rem)`), `.section-y-sm`,
`.section-head`.

**Botones:** `.btn-primary`, `.btn-ghost`, `.btn-white`, `.btn-whatsapp`, con
modificadores `.btn-lg`, `.btn-sm`, `.btn-block`.

**Formularios:** `.input-glass` (sobre fondo oscuro), `.input-light` (sobre
claro), `.form-label`.

**Movimiento:** todo comparte `--easing-premium: cubic-bezier(.16, 1, .3, 1)` —
la curva de salida larga y sin rebote tipo Apple/Polestar— y **anima solo
`transform` y `opacity`**. Componentes: `Reveal`, `RevealGroup` / `RevealItem`,
`AnimatedCounter`, `Parallax`, `VideoBackdrop`. Animaciones CSS con nombre:
`cinematic-zoom` (zoom de 20 s imperceptible en los vídeos), `veil-breathe`,
`fab-in`, `marquee`.

> **`prefers-reduced-motion` está respetado en TODAS las animaciones. Si añades
> una, añade su excepción.** Hay un bloque global en `globals.css` y excepciones
> específicas en `VideoBackdrop`, `Parallax` y `HeroVideo`.

**Logo:** `public/logo.svg` (vectorial). Se sirve con `<img>` normal, no con
`next/image`, porque `next/image` bloquea SVG salvo activando
`dangerouslyAllowSVG`, innecesario aquí. El componente `Logo` tiene
`variant="white"` (filtro CSS `brightness(0) invert(1)`, para fondos oscuros) y
`variant="color"` (el header, que tiene banda blanca).

## 6.4 Estructura de la home (`src/app/(public)/page.tsx`)

Once secciones, en este orden:

1. **Hero** — vídeo propio a pantalla completa (`HeroVideo`) + `HeroContent` con
   entrada por peldaños. Cuatro señales de confianza: *0 € de entrada · Seguro a
   todo riesgo incluido · Mantenimiento e ITV incluidos · 48 h y tienes
   respuesta*.
2. **Stats** (`surface-graphite`) — contadores animados: **+10.000 clientes
   satisfechos · 4,9 valoración Google · +30 marcas · 48 h de gestión**.
3. **Marquesina de marcas** — 18 nombres en bucle horizontal (constante
   `MARQUEE_BRANDS`, texto, no logos).
4. **`#ofertas`** — hasta 6 coches con `is_offer = true`. Fondo claro
   (`#F4F6FA`) con foto de fondo. La bandera `OFERTAS_VIDEO = false` decide si el
   fondo es vídeo o la foto del BMW: es una **decisión de contenido**, no un
   problema técnico; el vídeo y su script siguen ahí por si se retoma.
5. **`#marcas`** — rejilla de `BrandCard` con logo, nombre y número de coches.
6. **`#catalogo`** — "Selección de la semana": hasta 8 destacados, deduplicados
   por modelo.
7. **`#por-que`** — el proceso en 4 pasos (`HOW_STEPS`).
8. **`#incluido`** — 8 tarjetas de lo que entra en la cuota (`INCLUDED`), con
   iconos SVG decorativos.
9. **Comparativa** (`surface-carbon`) — tabla MoviLease vs. concesionario
   (`COMPARISON`, 7 filas).
10. **Testimonios** — 6 reseñas reales con nombre, inicial de apellido y coche
    (`TESTIMONIALS`).
11. **`#faq`** — 6 preguntas (`FAQ_ITEMS`) + JSON-LD `FAQPage`.
12. **Cierre** — `LeadForm` sobre foto de carretera al atardecer.

**Todos estos textos son constantes al principio del archivo.** Para cambiar un
testimonio o una pregunta frecuente no hay que tocar JSX: se edita la constante.

## 6.5 La ficha de vehículo (`/[slug]`)

Secciones, todas condicionales (**si no hay dato, la sección no se pinta**):

1. **Hero de producto** — migas de pan visibles, `VehicleGallery`, título en dos
   niveles (`Renting <Marca>` pequeño + `<Modelo>` grande), chips de specs,
   colores disponibles, **bloque de precio "Desde X €/mes · IVA incluido"** y
   cuatro CTAs: *Solicitar oferta*, *Solicitar información*, *WhatsApp*,
   *Llamar*.
2. **Rejilla de specs** — combustible, cambio, potencia, etiqueta, carrocería,
   plazas, puertas, consumo.
3. **Cuotas por plazo y kilometraje** — `VehiclePricingTable`, solo si el
   vehículo tiene filas en `vehicle_pricing`.
4. **Equipamiento** de serie.
5. **Descripción comercial** (fondo blanco).
6. **Otras versiones** del mismo modelo, con su cuota y su enlace de WhatsApp.
7. **Servicios incluidos**.
8. **FAQ del modelo** — 6 preguntas **generadas con los datos reales del coche**
   (cuota, plazo, kilometraje, servicios, número de versiones), no texto
   genérico. Alimentan `FAQPage`.
9. **Otros modelos de la misma marca** (`getSameBrandModels`).
10. **`#solicitar`** — `LeadForm` con `vehicleId` y `modelId` prerrellenados.

**Detalle sutil que ya se corrigió una vez y no debe romperse:** el precio "desde"
y las condiciones (plazo, km) de la FAQ tienen que salir **del mismo vehículo**.
Si se coge el mínimo por un lado y el plazo de `primary` por otro, la FAQ acaba
diciendo *"263 € para un contrato de 60 meses"* cuando esos 263 € son de otra
versión.

Otro: la versión que encabeza la ficha **no es la más barata, sino la que tiene
galería real**; entre versiones igualmente completas, gana la más barata
(`getModelBySlugWithVehicles`).

## 6.6 IVA — dónde está y dónde NO está

**No hay ningún cálculo de IVA en el código.** Ni multiplicaciones, ni tipos, ni
constante de porcentaje. Buscado en todo `src/`, `scripts/` y `supabase/`.

Cómo funciona realmente:

- Los precios se guardan en `vehicles.monthly_price_cents` y
  `vehicle_pricing.monthly_price_cents` **en céntimos y ya con el IVA incluido**,
  tal como vienen en las láminas del proveedor.
- `formatPriceFromCents()` (`src/lib/utils.ts`) solo formatea a euros con
  `Intl.NumberFormat("es-ES")`, sin decimales.
- La frase **"IVA incluido"** aparece como **texto literal en tres sitios** de
  `src/app/(public)/[slug]/page.tsx`: bajo el precio del hero (línea ~389), en la
  cabecera de la tabla de cuotas (~436) y en la primera FAQ generada (~207).
  Además hay una respuesta sobre deducción de IVA en `/renting-autonomos` y otra
  en la FAQ de la home.

**Consecuencia práctica:** si algún día hay que mostrar precios sin IVA (típico
en la vertical de empresas), es un **cambio de modelo de datos**, no un cambio de
formato: haría falta una columna nueva o un tipo de IVA por vehículo. No lo
improvises multiplicando por 1,21 en un componente.

## 6.7 CTAs y captación

El embudo tiene tres salidas, siempre las mismas:

1. **WhatsApp** con mensaje prerellenado y contextual (el del coche lleva marca,
   modelo, versión y cuota).
2. **Formulario** (`LeadForm`) → base de datos + email + Telegram.
3. **Llamada** (`tel:`), presente en la ficha y en `/contacto`.

Puntos de captación: botón flotante de WhatsApp (todas las páginas), botón del
header, pop-up automático, formulario del cierre de la home, formulario de la
ficha, `/contacto`, `/renting-empresas`, `/renting-autonomos`, y el botón
"Lo quiero" de cada `VehicleCard`.

---

# 7. QUIERO RENTING — CONTEXTO FUNCIONAL Y DE NEGOCIO

> **Lee esto antes de tocar nada de Quiero Renting.** No está en este
> repositorio y no es Next.js.

## 7.1 Qué es exactamente (verificado 31/08/2026)

| | quierorenting.es |
|---|---|
| Alojamiento | **Vercel**, ficheros estáticos (`x-vercel-cache: HIT`, `etag`, `last-modified`) |
| Tecnología | **HTML escrito a mano**, sin framework, sin build |
| Página principal | **1 archivo** de 133.382 bytes / 2.014 líneas |
| CSS y JS | **Todo inline**: 9 bloques `<script>`, ningún `.js` ni `.css` propio |
| Landings | **85** listadas en `sitemap.xml` (86 URLs con la home) |
| `robots.txt` | Sí — `Allow: /` + referencia al sitemap |
| `sitemap.xml` | Sí — `lastmod` de todas las URLs: **2026-06-18** |
| Fotos | `fotos.quecochemecompro.com` (CDN externo, enlazado en caliente) |

## 7.2 Branding (distinto del de MoviLease)

- **Color principal: verde** — `theme-color` `#18a05a`, botones `#16a34a`,
  acentos `#4ade80`. **No es la paleta azul de MoviLease.** No las mezcles.
- **Tipografía:** DM Sans.
- **Email de contacto propio:** `quierorenting@outlook.es` (distinto de
  `contacto@movilease.es`).
- **Twitter/X:** `@quierorenting`. **Instagram:** el mismo que usa MoviLease.
- **Reclamo:** *"Renting de coches para particulares desde 264 €/mes · Sin
  entrada"*.
- **JSON-LD:** `AutoDealer` con teléfono, email, `areaServed: España` y `sameAs`
  al Instagram.

## 7.3 Estructura de la home

Secciones con ancla: `#mas-vendidos` (coches más vendidos), `#ofertas` (ofertas
exclusivas), `#catalogo` (catálogo completo), más "¿Por qué elegir renting?",
testimonios, FAQ y cierre.

Al final del HTML hay un **bloque oculto** (`display:none`) con ~46 enlaces a las
landings de modelo: enlazado interno para el rastreador.

## 7.4 Landings (las 85 del sitemap)

Tres familias:

- **Por modelo** (~65): `/renting-seat-ibiza/`, `/renting-peugeot-208/`,
  `/renting-volkswagen-polo/`, `/renting-mercedes-glc/`,
  `/renting-audi-a3-sportback/`… Cada una ~19-20 KB.
- **Por categoría** (~5): `/renting-suv/`, `/renting-hibrido/`,
  `/renting-electrico/`, `/renting-furgoneta/`, `/renting-automatico/`,
  `/renting-barato/`.
- **Por ciudad** (11): `/renting-coches-madrid/`, `-barcelona`, `-valencia`,
  `-sevilla`, `-malaga`, `-zaragoza`, `-bilbao`, `-alicante`, `-murcia`,
  `-palma`, `-las-palmas`, `-valladolid`.

**Para crear una landing nueva: copia la más parecida, cambia el contenido, el
`h1`, el JSON-LD, y añádela a `sitemap.xml`.** No empieces de cero.

## 7.5 Captación de leads en Quiero Renting

Un **pop-up** (`#lp-overlay`) que se abre **a los 4 segundos**, una vez por
sesión (`sessionStorage`, clave `qr_popup_v2`). Pide nombre, teléfono, email y
consentimiento. Al enviar (`lpSubmit`):

1. `POST` a `https://api.web3forms.com/submit` → email.
2. Un `new Image().src` contra `https://api.telegram.org/bot<token>/sendMessage`
   → aviso instantáneo.
3. Muestra la confirmación.

También hay banner de cookies con modal de preferencias (esenciales +
analíticas), guardado en `localStorage`.

## 7.6 ⚠️ Problema crítico de Quiero Renting

**Las credenciales están escritas en claro en el JavaScript inline de la página,
y por tanto son públicas:**

- La **API key de Web3Forms**.
- El **token del bot de Telegram** y el **chat id** de destino.

Cualquiera que abra el código fuente puede enviarse correos desde ese formulario
o escribir/leer en ese bot. **Hay que rotarlas** (regenerar la key en Web3Forms y
el token con @BotFather) y mover el envío a algo que no exponga secretos: lo más
rápido y coherente con el resto del negocio es **mandar el lead a
`https://movilease.es/api/leads`**, que ya valida, guarda y notifica sin exponer
nada. Los valores concretos no se reproducen en este documento a propósito.

## 7.7 Relación entre las dos marcas

- El catálogo inicial de MoviLease **se sembró desde el de quierorenting.es**:
  `scripts/generate-catalog-seed.mjs` contiene el array `CARS` copiado de su
  `index.html` (80 coches, 28 marcas, 68 modelos) y lo traduce al esquema de
  Supabase → `supabase/seed_catalog_real.sql`.
- Muchas fotos del catálogo siguen viniendo de `fotos.quecochemecompro.com`, el
  CDN que usaba Quiero Renting. Por eso ese dominio está declarado en
  `remotePatterns` de `next.config.ts`.
- El Instagram sigue siendo `@quierorenting` en las dos.
- MoviLease es "la marca premium, bajo la futura S.L."; QuieroRenting, "la marca
  de captación ya existente" (comentario literal en `src/lib/brand.ts`).

**Decisión pendiente que alguien tendrá que tomar:** o se repunta el DNS de
quierorenting.es a esta aplicación (y entonces `BRANDS` empieza a servir para
algo), o se mantienen dos webs separadas (y entonces hay que decidir quién
mantiene la vieja). Hoy están las dos vivas, sin conexión técnica entre ellas.

---

# 8. CATÁLOGO Y GESTIÓN DE VEHÍCULOS

## 8.1 Dónde están los vehículos

**En Supabase, no en el código.** No hay ningún JSON ni array de coches que la
web lea en tiempo de ejecución. Las cuatro tablas implicadas:

```
brands  ──1:N──▶  models  ──1:N──▶  vehicles  ──1:N──▶  vehicle_images
                                          └───1:N──▶  vehicle_pricing
```

- `brands`: `name`, `slug`, `logo_url`, `is_active`
- `models`: `brand_id`, `name`, **`slug`** ← *es la URL pública*,
  `description`, `cover_image_url`, `is_active`
- `vehicles`: la versión concreta y su precio (campos completos abajo)
- `vehicle_images`: `storage_path` (URL), `alt_text`, `sort_order`, `is_primary`
- `vehicle_pricing`: `contract_months` × `annual_km` → `monthly_price_cents`

**El slug del modelo se genera como `renting-<marca>-<modelo>`**, así que
`SEAT` + `Ibiza` → `renting-seat-ibiza` → `https://movilease.es/renting-seat-ibiza`.

**Estado del catálogo en producción (31/08/2026, leído del sitemap):**
**74 fichas de modelo**, **30 vistas por marca** y **9 artículos** de blog.

## 8.2 Campos de un vehículo

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `model_id` | uuid | Sí | lo resuelve el script |
| `version` | text | Sí | p. ej. `1.5 TSI FR Special Edition` |
| `version_slug` | text | Sí | slug de `version`, lo genera el script |
| `category` | enum | Sí | `turismo` · `suv` · `hibrido` · `furgoneta` · `4x4` · `diesel` |
| `fuel_type` | enum | Sí | `gasolina` · `hibrido` · `electrico` · `diesel` · `phev` |
| `transmission` | enum | Sí | `manual` · `automatico` |
| `monthly_price_cents` | int | Sí | **céntimos, IVA incluido**. 358 €/mes → `35800` |
| `contract_months` | int | no (36) | plazo de la cuota de portada |
| `annual_km` | int | no (15000 en el script, 10000 en los textos) | ⚠ ver §14 |
| `horsepower` | int | no | CV |
| `consumption_value` / `consumption_unit` | numeric / text | no | p. ej. `5.5` + `L/100km` |
| `seats` / `doors` | int | no | |
| `environmental_label` | enum | no | `0` · `eco` · `c` · `b` |
| `colors` | text[] | no | nombres comerciales |
| `body_type` | text | no | `Hatchback`, `SUV`… |
| `equipment` | text[] | no | equipamiento de serie |
| `included_services` | text[] | no | lo que entra en la cuota |
| `short_description` | text | no | una línea, bajo el título de la ficha |
| `description` | text | no | párrafos (respeta los `\n`) |
| `main_image_url` | text | no | primera foto de `images` si no se indica |
| `is_featured` | bool | no | sale en "Selección de la semana" |
| `is_offer` | bool | no | sale en `#ofertas` |
| `badge_text` | text | no | etiqueta sobre la foto |
| `is_active` | bool | no (true) | **`false` ⇒ la ficha devuelve 404** |

## 8.3 El formato de ficha (`scripts/fichas/*.json`)

Hay **20 fichas** en el repositorio. Plantilla recomendada:
`scripts/fichas/seat-leon-15-tsi-fr-special-edition.json` (la más reciente y
completa) o `scripts/fichas/opel-corsa-gs.json`.

> El `EJEMPLO.json` que menciona el docstring de `add_vehicle.py` **no existe**.

Ejemplo real, íntegro y verificado:

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
  "colors": ["Gris Grafeno", "Gris Magnetic", "Negro Metalizado", "Rojo Metalizado"],
  "body_type": "Hatchback",
  "short_description": "Acabado FR Special Edition con motor 1.5 TSI de 150 CV",
  "description": "Acabado FR Special Edition: llantas de 18\", suspensión deportiva…\nMotor 1.5 TSI de 150 CV con cambio manual.\n…",
  "equipment": ["Llantas de 18\"", "Suspensión deportiva", "…"],
  "included_services": [
    "Seguro a todo riesgo", "Mantenimiento y revisiones", "Neumáticos incluidos",
    "Asistencia 24h", "Averías y reparaciones", "ITV e impuestos",
    "Gestión de multas", "Entrega a domicilio", "Cambio de neumáticos"
  ],
  "images": [
    { "url": "/coches-nuevos/seat-leon-fr-01.webp", "alt": "SEAT León FR en renting — vista exterior delantera" },
    { "url": "/coches-nuevos/seat-leon-fr-06.webp", "alt": "SEAT León FR en renting — interior y puesto de conducción" }
  ],
  "pricing": [
    { "contract_months": 36, "annual_km": 10000, "monthly_price_cents": 35900 },
    { "contract_months": 36, "annual_km": 15000, "monthly_price_cents": 38800 },
    { "contract_months": 36, "annual_km": 20000, "monthly_price_cents": 41300 },
    { "contract_months": 48, "annual_km": 10000, "monthly_price_cents": 35800 },
    { "contract_months": 48, "annual_km": 15000, "monthly_price_cents": 37700 },
    { "contract_months": 48, "annual_km": 20000, "monthly_price_cents": 40300 }
  ]
}
```

**Campo especial `"update_vehicle_id": "<uuid>"`** — si está presente,
`add_vehicle.py` **actualiza ese vehículo** (precio, specs, equipamiento) y
reemplaza sus cuotas y fotos, **sin tocar `version`, `version_slug` ni
`model_id`**, para no romper la URL ya publicada e indexada.

## 8.4 Las dos formas de publicar un coche

### A) Con credenciales — `add_vehicle.py` (la vía normal)

```bash
pip install requests            # una vez
python scripts/add_vehicle.py scripts/fichas/seat-leon-15-tsi-fr-special-edition.json
```

Necesita `.env.local` en la raíz con `NEXT_PUBLIC_SUPABASE_URL` y
`SUPABASE_SERVICE_ROLE_KEY` (los lee `scripts/_env.py`). El script:

1. Crea la marca si no existe (`brands`).
2. Crea el modelo si no existe, con slug `renting-<marca>-<modelo>` (`models`).
3. Inserta el vehículo (o hace `PATCH` si viene `update_vehicle_id`).
4. Borra e inserta las filas de `vehicle_pricing`.
5. Borra e inserta las filas de `vehicle_images` (la primera, `is_primary`).
6. Imprime la URL final: `https://movilease.es/<model_slug>`.

### B) Sin credenciales — `ficha_a_sql.py`

```bash
python scripts/ficha_a_sql.py scripts/fichas/<coche>.json > supabase/alta_<coche>.sql
# y se pega el resultado en el SQL Editor de Supabase
```

El SQL generado es **idempotente**: marca, modelo y vehículo llevan
`on conflict do nothing`; las cuotas actualizan el precio si cambia; las fotos
solo entran si el vehículo aún no tiene galería (porque `vehicle_images` no tiene
clave única que lo impida).

### Después, en los dos casos

**Revalidar** para que la web muestre el cambio:

```bash
curl -X POST https://movilease.es/api/revalidate \
  -H "x-revalidate-secret: <REVALIDATE_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"path": "/renting-seat-leon"}'
```

Hay que revalidar además `/catalogo` y `/` si el coche debe salir en ofertas o
destacados. *(Hoy, con todo renderizándose bajo demanda (§5.7), el cambio se ve
en la siguiente petición sin revalidar; en cuanto se arregle el ISR, este paso
volverá a ser obligatorio.)*

## 8.5 Regla innegociable sobre precios

> **Nunca se escribe una cuota de 0 €.** En las láminas del proveedor, un 0
> significa *"ese kilometraje no se ofrece"*, no *"gratis"*. Publicarlo sería
> anunciar un renting gratuito. Si una celda viene a 0, esa combinación
> plazo × km simplemente **no se incluye** en `pricing`.

Además: la restricción `check (monthly_price_cents > 0)` de `vehicle_pricing`
rechaza la fila en la base de datos, así que un 0 se convierte en un error de
inserción, no en un precio malo.

## 8.6 Fotos

**Dos orígenes:**

1. **`public/coches-nuevos/*.webp`** — fotos de estudio propias, salidas de las
   láminas del Drive de MoviLease. **139 imágenes de 20 coches**. Llevan el color
   real que se contrata y matrícula MoviLease: son mejores que cualquier foto de
   banco. Se referencian con ruta relativa (`/coches-nuevos/seat-leon-fr-01.webp`).
2. **`https://fotos.quecochemecompro.com/...`** — CDN heredado de Quiero
   Renting, declarado en `remotePatterns` de `next.config.ts`.

**Un origen nuevo de fotos hay que declararlo en `next.config.ts`** o
`next/image` lo rechazará.

**Scripts de imagen:**

| Script | Qué hace |
|---|---|
| `node scripts/slice-photo-sheet.mjs "<hoja.png>" <prefijo>` | Trocea una hoja de contacto del Drive (un PNG de 1536×1024 con 6-8 vistas montadas) detectando las "calles" entre viñetas — no con coordenadas fijas, porque el montaje cambia de una hoja a otra. Escribe en `public/coches-nuevos/`. |
| `node scripts/build-galleries.mjs` | Genera el bloque `images` de una ficha y **separa exterior de interior midiendo cuánto fondo de estudio se ve** (no por brillo medio: un CR-V negro de exterior es más oscuro que un interior claro). El corte es relativo dentro de cada coche, no un umbral fijo. |
| `python scripts/galerias_quecoche.py [--aplicar]` | Rellena galerías desde quecochemecompro.com. **Por debajo del listón de parecido no toca el coche**: mejor una foto sola que las de otro modelo. Sin `--aplicar` solo informa. |
| `node scripts/optimize-brand-logos.mjs` | Reescala los logos de `public/brands/` a 240 px. Los SVG que llevan un ráster dentro se rasterizan a PNG. |
| `node scripts/build-section-video.mjs` | Convierte un clip en fondo de sección (~1 MB) + póster. |

## 8.7 Marcas y logos

`public/brands/` tiene **28 logos**. El mapeo nombre → archivo está en
`src/lib/brand-logos.ts`, en el objeto `EXTENSION_BY_SLUG`, porque unas marcas
son `.svg` y otras `.png`.

**Para añadir el logo de una marca nueva:**
1. Deja el archivo en `public/brands/<slug>.<svg|png>` (slug = nombre en
   minúsculas, sin tildes, con guiones).
2. Añade la entrada a `EXTENSION_BY_SLUG` en `src/lib/brand-logos.ts`.
3. Pásalo por `node scripts/optimize-brand-logos.mjs`.

Sin entrada en ese objeto, `getBrandLogoUrl()` devuelve `null` y la tarjeta pinta
el nombre de la marca en texto (degradación correcta, no un hueco).

## 8.8 Blog

Los artículos viven en la tabla `blog_posts`. Se publican poniendo
`status = 'published'` y una fecha en `published_at`. El contenido es **Markdown**
renderizado por `src/components/blog/Markdown.tsx`, un renderizador propio
(sin dependencias, sin `dangerouslySetInnerHTML`) que cubre `h2`, `h3`, párrafos,
listas, citas, negrita, cursiva y enlaces.

Nueve artículos publicados hoy: `renting-sin-entrada`,
`que-incluye-la-cuota-de-un-renting`, `renting-o-comprar-coche`,
`requisitos-para-contratar-un-renting`, `renting-para-autonomos`,
`renting-leasing-o-prestamo`, `cuantos-kilometros-contratar-renting`,
`que-pasa-al-final-del-renting`, `renting-coche-electrico-hibrido`.

Los scripts `scripts/_posts_iniciales.py` y `scripts/_posts_tanda2.py` son las
siembras de las dos primeras tandas y sirven de plantilla.

---

# 9. COMPONENTES IMPORTANTES

## 9.1 Layout

### `Header` — `src/components/layout/Header.tsx` (364 líneas) · cliente
- **Función:** barra fija, menú de 7 enlaces, mega-menú de marcas en escritorio,
  menú a pantalla completa en móvil, botón de WhatsApp.
- **Dependencias:** `framer-motion`, `usePathname`, `Logo`, `buildWhatsAppLink`.
  Recibe `brands` desde `(public)/layout.tsx`.
- **Delicado:** la **trampa de foco** del menú móvil (Escape cierra, Tab no se
  escapa al fondo, el primer enlace recibe el foco al abrir); el **retardo de
  140 ms** al cerrar el mega-menú (sin él parpadea al mover el ratón del enlace
  al panel); `document.body.style.overflow` mientras el menú está abierto.
- **Seguro de tocar:** los textos y el orden de `NAV_LINKS`, los colores.
- **Revisar antes:** si añades un enlace, comprueba que cabe en escritorio a
  1280 px; el menú ya va justo.

### `Footer` — `src/components/layout/Footer.tsx` (238 líneas) · servidor `async`
- **Función:** cierre de marca ("Hazlo fácil. Hazlo MoviLease."), CTA de
  WhatsApp, cuatro columnas de enlaces, redes, legales, y **las 12 marcas con más
  stock**, para que las vistas por marca estén enlazadas desde cualquier página.
- **Delicado:** llama a `getVehiclesByBrand()` en cada render — es una de las dos
  causas de que no haya ISR (§5.7). El `try/catch` que lo envuelve es
  imprescindible.

### `WhatsAppButton` — `src/components/layout/WhatsAppButton.tsx` · servidor
- **Función:** botón flotante verde, esquina inferior derecha.
- **Delicado:** **no uses framer-motion aquí.** Se quitó a propósito: era un
  componente cliente entero para una aparición de medio segundo, y su
  `transition-all` impedía que el botón se apartara cuando el banner de cookies
  reserva sitio en `--bottom-inset`. Ahora entra con CSS (`.fab-enter`) y respeta
  `prefers-reduced-motion` sin código extra.

## 9.2 Vehículos

### `VehicleCard` — `src/components/vehicles/VehicleCard.tsx` · servidor
- **Función:** la tarjeta de coche que se repite en home, catálogo y ficha.
- **Delicado:** el levantamiento al pasar el ratón es **CSS (`.card-lift`)**, no
  framer-motion: en el catálogo eran ~70 componentes animados por JS para lo que
  hace una transición CSS. **No lo devuelvas a JS.**
- **Seguro:** textos, badges, tamaños.

### `VehicleGallery` — cliente
- Galería con miniaturas, flechas, contador `n / total` y teclado accesible.
- Si no hay imágenes, pinta la inicial de la marca (degradación correcta).

### `VehiclePricingTable` — servidor
- Tabla plazo × kilometraje. Destaca la columna del `contract_months` del
  vehículo. Celda sin dato → `—`. **Devuelve `null` si no hay `tiers`**: por eso
  la sección entera desaparece cuando un coche no tiene cuotas cargadas.

### `FavoriteButton` / `CompareButton` / `ComparisonBar` / `FavoritosClient` — cliente
- Todo sobre `localStorage`, sin cuenta de usuario, vía
  `useLocalStorageIds(clave, max)`.
- Claves: `movilease:favorites:v1` (sin límite) y `movilease:comparison:v1`
  (**máximo 3**, constante `MAX_COMPARISON_ITEMS`).
- `ComparisonBar` se detiene antes de la esquina inferior derecha para no tapar
  el botón de WhatsApp.

## 9.3 Formularios y captación

### `LeadForm` — `src/components/forms/LeadForm.tsx` (271 líneas) · cliente
- **Función:** el formulario de leads de toda la web. `useActionState` sobre
  `createLeadAction`.
- **Delicado:**
  - **Solo nombre y teléfono a la vista.** El resto de campos existen y se envían
    igual, pero se despliegan con un botón. Pedir ocho datos de golpe para un
    primer contacto espanta. **No los saques a la vista sin que te lo pidan.**
  - **Honeypot**: `<input name="website">` oculto. **No lo quites ni lo
    renombres**: el servidor descarta el envío si viene relleno.
  - El campo oculto `pageUrl` se rellena con `usePathname()`.
  - Estado de éxito con enlace de WhatsApp prerellenado.
- **Props:** `vehicleId`, `modelId`, `source`, `submitLabel`.

### `LeadPopup` — `src/components/home/LeadPopup.tsx` (312 líneas) · cliente
- **Función:** modal de captación, en todas las páginas públicas salvo
  `/contacto` y `/favoritos` (constante `SILENCED_PATHS`).
- **Disparo:** lo que ocurra antes de — **10 % de scroll**, **salida del puntero
  por el borde superior** (intención de abandono) o **5 segundos**. Una vez por
  sesión (`sessionStorage`, clave `qr_popup_v4`).
- **Delicado:** *"El plazo corto de 5 s lo pidió Adrián expresamente"* — está
  escrito en el código. Contrapartida conocida: a los 5 s mucha gente sigue
  leyendo el hero. **Si el ratio de cierres sin rellenar sube, subir ese número
  es lo primero que hay que tocar** — pero pregunta antes.
- Envía por `POST /api/leads`, no por Server Action.

### `CookieBanner` — cliente
- **Delicado:** mientras está visible **reserva su altura en la variable CSS
  `--bottom-inset`**, y las clases `.bottom-fab` / `.bottom-bar` / `.bottom-dock`
  hacen que el botón de WhatsApp y la barra de comparación se aparten hacia
  arriba en vez de quedar tapados. Si tocas el banner, comprueba que el botón de
  WhatsApp sigue apartándose.
- **Ojo:** hoy guarda la preferencia (`ml_cookie_pref`) pero **no hay ninguna
  cookie ni script que activar o bloquear** (§13). Es un banner sin
  consecuencias.

## 9.4 Movimiento y fondos

### `Reveal` / `RevealGroup` / `RevealItem` / `AnimatedCounter` — `src/components/ui/Reveal.tsx` · cliente
- Aparición al hacer scroll con `IntersectionObserver` + clases CSS
  (`.reveal` / `.reveal-in`), no con framer-motion.
- Respeta `prefers-reduced-motion` (bloque en `globals.css`).

### `Parallax` — cliente
- Desplaza el fondo una fracción del scroll (`speed = 0.18`). Solo toca
  `transform`, dentro de `requestAnimationFrame`, con listener pasivo. Se
  desactiva con `prefers-reduced-motion` y en pantallas pequeñas.

### `VideoBackdrop` — `src/components/ui/VideoBackdrop.tsx` · cliente
**El componente más afinado del proyecto. NO lo simplifiques.** Lo que hace y por
qué:
- `preload="none"` y las `<source>` **no se montan** hasta que la sección está a
  400 px del viewport: el vídeo no entra en la carga inicial ni afecta al LCP.
- El **póster se pinta como imagen de fondo desde el primer render**: la sección
  nunca aparece vacía ni da salto de layout.
- **No descarga vídeo** si el visitante pide menos movimiento
  (`prefers-reduced-motion`) o tiene el **ahorro de datos** activado
  (`navigator.connection.saveData`).
- **Pausa el vídeo** cuando la sección sale de pantalla.
- Si el archivo no existe o falla, se queda el póster: la sección sigue siendo
  correcta sin ningún asset.
- **Props que importan:** `veil` (el velo, sin él el texto encima no se lee),
  `base`, `filter` y `position` (`"center bottom"` para un coche recortado a ras
  de ruedas, que si no se corta).

### `HeroVideo` / `HeroImage` / `HeroContent` / `HeroCanvas` — cliente
- `HeroVideo` es el fondo actual: clip propio con `Parallax` y `cinematic-zoom`,
  con póster `webp` que es el primer fotograma del vídeo (así no hay salto de
  escena).
- `HeroContent` es la secuencia de entrada por peldaños: arranca a **0,45 s**
  (después del fade del vídeo y del header) y cada peldaño entra **200 ms**
  después del anterior.
- `HeroImage` y `HeroCanvas` son **alternativas no usadas hoy**, conservadas.

## 9.5 SEO y utilidades

### `JsonLd` — `src/components/seo/JsonLd.tsx` (270 líneas) · servidor
Ocho generadores: `OrganizationJsonLd` (tipo `AutoRental`), `WebSiteJsonLd`,
`FaqJsonLd`, `BreadcrumbJsonLd`, `ItemListJsonLd`, `VehicleModelJsonLd`,
`WebPageJsonLd`, `ArticleJsonLd`.

**Delicado:** `VehicleModelJsonLd` declara el precio como
`UnitPriceSpecification` con `unitCode: "MON"` **a propósito**: publicar la cuota
como precio a secas haría que Google mostrase *"264 €"* como si fuera el precio
del coche. Usa `AggregateOffer` porque un modelo tiene varias versiones.

### `Logo`, `Container`, `Button`
- `Button` / `ButtonLink` (`src/components/ui/Button.tsx`) existen pero **casi no
  se usan**: la web tira de las clases `.btn-*` de `globals.css`. Antes de usar
  `Button`, comprueba cómo lo hace la página de al lado.
- `Container` / `Section` (`src/components/ui/Container.tsx`) están **muy poco
  usados**: la mayoría de secciones escriben
  `mx-auto max-w-7xl px-6 sm:px-10` a mano. Es una incoherencia conocida
  (§14).

### `FAQAccordion` — cliente
**Delicado:** la respuesta **se monta siempre**, aunque el panel esté cerrado.
Antes iba dentro de `{isOpen && ...}` y el texto no llegaba al HTML, así que el
`FAQPage` declaraba respuestas que no existían en la página. Cada pregunta es un
`h3` real y los botones anuncian `aria-expanded` / `aria-controls`.

### `Markdown` — servidor
Renderizador propio, sin dependencias y **sin `dangerouslySetInnerHTML`**: un
artículo mal escrito no puede inyectar nada. Exporta también `extraerIndice`.

---

# 10. FORMULARIOS Y LEADS

## 10.1 Inventario de formularios (MoviLease)

| Dónde | Componente | `source` | Campos ocultos |
|---|---|---|---|
| Cierre de la home | `LeadForm` | `contact_form` | `pageUrl` |
| Ficha `/[slug]#solicitar` | `LeadForm` | `contact_form` | `vehicleId`, `modelId`, `pageUrl` |
| `/contacto` | `LeadForm` | `contact_form` | `pageUrl` |
| `/renting-empresas` | `LeadForm` | `contact_form` | `pageUrl` |
| `/renting-autonomos` | `LeadForm` | `contact_form` | `pageUrl` |
| Pop-up (todas las páginas) | `LeadPopup` → `POST /api/leads` | `contact_form` | — |

Valores admitidos de `source` (enum `lead_source` + `LEAD_SOURCES`):
`vehicle_page`, `catalog`, `contact_form`, `whatsapp_cta`, `calculator`,
`landing_page`. **Hoy todos los formularios mandan `contact_form`**, así que la
segmentación por origen no está aprovechada (§14).

## 10.2 Qué datos se recogen

Validados con zod en `src/lib/validations/lead.ts`:

| Campo | Obligatorio | Regla |
|---|---|---|
| `name` | **Sí** | 2-120 caracteres |
| `phone` | **Sí** | `/^[+\d][\d\s]{6,20}$/` |
| `rgpd` | **Sí** | tiene que venir aceptado |
| `lastName`, `email`, `company`, `province`, `message` | No | `email` validado si viene |
| `clientType` | No | `empresa` · `autonomo` · `particular` |
| `modelId`, `vehicleId` | No | UUID |
| `source`, `pageUrl` | No | |
| `website` | — | **honeypot**: tiene que venir vacío |

El servidor añade además `ip_address` (`x-forwarded-for`), `user_agent` y
`page_url`.

## 10.3 Qué pasa al enviar (`src/lib/actions/leads.ts` → `createLead`)

1. **Valida** con `leadFormSchema`.
2. **Honeypot**: si `website` viene relleno, se descarta en silencio devolviendo
   un éxito falso al bot.
3. **Inserta** en `leads` con el **cliente admin** (service role), guardando IP,
   user-agent y `page_url`.
4. **Notifica en paralelo** (`Promise.allSettled`) a **Web3Forms** y **Telegram**.
5. **Marca** `notified_web3forms` / `notified_telegram` en la fila del lead.
6. **Devuelve un enlace de WhatsApp prerellenado** con el nombre del cliente.

> **Regla de oro del formulario: cualquier fallo devuelve un mensaje controlado
> invitando a WhatsApp, nunca un 500.** Si Supabase no responde, si la red falla,
> si la RLS rechaza — el visitante ve *"No se ha podido registrar la solicitud.
> Escríbenos directamente por WhatsApp mientras tanto."* **No metas un `throw` en
> este camino.**

## 10.4 Notificaciones

### Email — `src/lib/notifications/web3forms.ts`
`POST https://api.web3forms.com/submit` con `WEB3FORMS_API_KEY`.
Asunto: `🚗 Nuevo Lead MOVILEASE`. Campos en español (`nombre`, `telefono`,
`email`, `empresa`, `provincia`, `tipo_cliente`, `vehiculo`, `mensaje`, `fecha`,
`hora`, `ip`, `user_agent`, `pagina`). Si falta la key, devuelve `false` sin
romper nada.

### Telegram — `src/lib/notifications/telegram.ts`
`POST https://api.telegram.org/bot<token>/sendMessage` con `parse_mode: HTML`.
Mensaje con emojis, encabezado `🚗 NUEVO LEAD MOVILEASE`, fechas en
`Europe/Madrid`. Necesita `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`.

**No hay CRM.** Los leads se consultan en la tabla `leads` de Supabase (o en los
avisos de Telegram/email). El panel de `/admin/leads` es todavía un stub.

## 10.5 Formularios de Quiero Renting

Ver §7.5 y §7.6: un solo pop-up, envío directo desde el navegador a Web3Forms y
Telegram, **con las credenciales expuestas en el HTML**. Es el problema más
urgente de todo el ecosistema.

---

# 11. VARIABLES DE ENTORNO Y CONFIGURACIÓN

Plantilla: **`.env.example`** (está en el repo, sin valores). Copiar a
`.env.local`, que está en `.gitignore` y **no se commitea jamás**.

> **Regla absoluta: si un valor no es público, NO lleva el prefijo
> `NEXT_PUBLIC_`. Nunca.** Todo lo que lleve ese prefijo acaba en el bundle que
> descarga el navegador.

### `NEXT_PUBLIC_SUPABASE_URL`
- **Propósito:** URL del proyecto Supabase.
- **Servicio:** Supabase.
- **Dónde se usa:** `src/lib/supabase/{server,client,admin,middleware}.ts`,
  `scripts/_env.py`, `src/scripts/_env.py`.
- **Obligatoria:** **Sí** (sin ella el catálogo sale vacío y el panel no entra).

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Propósito:** clave anónima, sujeta a RLS. Segura de exponer.
- **Servicio:** Supabase.
- **Dónde se usa:** los cuatro clientes Supabase, `src/scripts/_env.py`.
- **Obligatoria:** **Sí**.

### `NEXT_PUBLIC_SITE_URL`
- **Propósito:** URL canónica del sitio; base de `metadataBase`, canonicals,
  Open Graph, `sitemap.xml`, `robots.txt` y todos los JSON-LD.
- **Servicio:** ninguno (configuración propia).
- **Dónde se usa:** `src/lib/constants.ts` → `SITE_URL`.
- **Obligatoria:** No — hay respaldo `https://movilease.es`. **Pero si se
  despliega en otro dominio y no se define, todos los canonicals apuntarán a
  movilease.es.**

### `NEXT_PUBLIC_WHATSAPP_NUMBER`
- **Propósito:** número de WhatsApp de todos los enlaces y del `tel:`.
- **Servicio:** WhatsApp.
- **Dónde se usa:** `src/lib/constants.ts` → `CONTACT` y `buildWhatsAppLink()`.
- **Obligatoria:** No — respaldo `34644156797`.

### `SUPABASE_SERVICE_ROLE_KEY`
- **Propósito:** clave de servicio; **se salta la RLS por completo**.
- **Servicio:** Supabase.
- **Dónde se usa:** `src/lib/supabase/admin.ts` (solo servidor, protegido por
  `import "server-only"`) y todos los scripts de Python.
- **Obligatoria:** **Sí para que funcione el formulario de leads** y para los
  scripts de catálogo.
- ⚠️ **Nunca en el cliente, nunca en el repo, nunca en un log.**

### `WEB3FORMS_API_KEY`
- **Propósito:** enviar por email cada lead recibido.
- **Servicio:** Web3Forms (`web3forms.com`).
- **Dónde se usa:** `src/lib/notifications/web3forms.ts`.
- **Obligatoria:** No — sin ella el lead se guarda igual y `notified_web3forms`
  queda en `false`.

### `TELEGRAM_BOT_TOKEN`
- **Propósito:** aviso instantáneo de lead nuevo por Telegram.
- **Servicio:** Telegram Bot API (token de @BotFather).
- **Dónde se usa:** `src/lib/notifications/telegram.ts`.
- **Obligatoria:** No.

### `TELEGRAM_CHAT_ID`
- **Propósito:** chat de destino del aviso.
- **Servicio:** Telegram.
- **Dónde se usa:** `src/lib/notifications/telegram.ts`.
- **Obligatoria:** No (pero sin ella el token no sirve de nada).

### `REVALIDATE_SECRET`
- **Propósito:** secreto compartido que protege `POST /api/revalidate`.
- **Servicio:** ninguno (valor propio, inventado y guardado en Vercel).
- **Dónde se usa:** `src/app/api/revalidate/route.ts`, en la cabecera
  `x-revalidate-secret`.
- **Obligatoria:** No para que la web funcione; **sí para poder invalidar la
  caché** tras publicar un coche.

## 11.1 Otros archivos de configuración

| Archivo | Qué controla |
|---|---|
| `next.config.ts` | Redirección `www.movilease.es` → `movilease.es`; formatos de imagen (**AVIF primero**, luego WebP: en fotos de coche baja un 20-30 %); `qualities: [75, 92]` (el hero pide 92 y en Next 16 declararlo será obligatorio); `minimumCacheTTL` de **30 días**; `remotePatterns` para `*.supabase.co/storage/v1/object/public/**` y `fotos.quecochemecompro.com`. |
| `tsconfig.json` | `strict: true`, alias `@/*` → `./src/*`, `target ES2017`. |
| `eslint.config.mjs` | `next/core-web-vitals` + `next/typescript`. Ignora `.next`, `out`, `build`. |
| `postcss.config.mjs` | Solo `@tailwindcss/postcss`. |
| `.claude/launch.json` | Configuración de depuración con **rutas de Windows** (`C:\PROGRA~1\nodejs\node.exe`). Solo sirve en el equipo de Adrián. |
| `.gitignore` | Ignora `node_modules`, `.next`, `.env*` (salvo `.env.example`), `__pycache__`, `.vercel`. |

---

# 12. DESPLIEGUE

## 12.1 Arrancar el proyecto en local

```bash
git clone <repo> && cd movilease
npm install                       # OBLIGATORIO: node_modules no está en el repo
cp .env.example .env.local        # y rellenar con los valores reales
npm run dev                       # http://localhost:3000
```

**Sin `.env.local`, la web arranca igual**: la capa de datos nunca lanza, así que
el catálogo sale vacío pero el diseño, la navegación y las páginas estáticas se
ven perfectamente. Es suficiente para trabajar en maquetación.

## 12.2 Verificación antes de commitear

```bash
npm run lint      # tiene que salir limpio (hoy lo está)
npm run build     # tiene que compilar (hoy compila: 32 páginas, ~26 s)
```

**No commitees sin haber pasado las dos.** Y si el cambio es visual, míralo
además en el navegador a 375 px de ancho (§16).

## 12.3 Despliegue

- **Plataforma:** Vercel.
- **Flujo:** `git push` a `master` → Vercel construye y despliega en producción.
  Un push a cualquier otra rama genera un *preview deployment* con su propia URL.
- **Rama de producción:** `master`.
- **Variables en producción:** las nueve de §11 tienen que estar cargadas en
  *Vercel → Project → Settings → Environment Variables*, con las cinco no
  públicas marcadas para Production (y Preview si se quiere probar).
- **Dominios:** `movilease.es` (producción) y `www.movilease.es` (redirige con
  308 al anterior, resuelto en el edge por `next.config.ts`).

> **Nunca hagas push a `master` sin permiso explícito.** Trabaja en la rama que
> se te indique y espera confirmación para mezclar.

## 12.4 Publicar un cambio de catálogo (sin desplegar código)

Los coches viven en la base de datos, así que **no hace falta desplegar** para
añadir o cambiar un coche: se ejecuta el script (§8.4) y se revalida
(`POST /api/revalidate`). Solo se despliega si has tocado código.

## 12.5 Migraciones de base de datos

No hay CLI de Supabase configurada en el repo. Las migraciones de
`supabase/migrations/` se aplican **pegándolas en el SQL Editor** del proyecto
Supabase, en orden. Una migración nueva:

1. Se añade como `supabase/migrations/000N_<nombre>.sql`.
2. Si crea una tabla: **`enable row level security` + políticas + `GRANT`**
   (mira `0004_vehicle_detail_fields.sql` como modelo completo).
3. Se refleja en `src/types/database.types.ts` (a mano, con `type`, nunca
   `interface`).
4. Si añade un valor de enum, se añade también su etiqueta en
   `src/lib/constants.ts`.

---

# 13. SEO, ANALÍTICA Y TRACKING

## 13.1 Lo que sí hay (y está bien hecho)

**Metadatos** — `src/lib/metadata.ts` → `pageMetadata({ title, description, path, images, noIndex })`.
**Úsalo en toda página nueva.** Genera título, descripción, `alternates.canonical`,
Open Graph completo (`locale: es_ES`) y Twitter Card. La imagen se referencia
explícitamente porque **declarar `openGraph` a mano desactiva el descubrimiento
automático de `app/opengraph-image.tsx`**.

**Imagen para compartir** — `src/app/opengraph-image.tsx`: 1200×630 generada en
build con `ImageResponse`. Existe porque los enlaces en WhatsApp —canal principal
del negocio— salían como texto pelado.

**Datos estructurados** — `src/components/seo/JsonLd.tsx`, ocho tipos (§9.5).

**`sitemap.ts`** — rutas fijas + fichas de modelo + artículos + vistas por marca.
**Si Supabase falla, sirve igualmente las estáticas.** Las fichas de versión
(`/[modelo]/[version]`) quedan fuera a propósito: se añadirán cuando esa ruta
exista.

**`robots.ts`** — bloquea `/admin`, `/api/`, `/favoritos` y `/comparador` (estos
dos dependen del `localStorage` del visitante: no hay nada que indexar).

**Canonicals por marca** — `/catalogo?brand=seat` tiene canonical propio; las
combinaciones con filtro de categoría o combustible llevan `noIndex`. Sin esto,
las ~28 vistas de marca y todas sus combinaciones competían como duplicados.

**Descripciones con datos reales** — las de ficha se arman con la cuota, el número
de versiones y "sin entrada", y se recortan a ~158 caracteres.

**Google Search Console** — verificación por metaetiqueta en
`src/app/layout.tsx`, campo `verification.google`. **No la borres.**

**Rendimiento** — AVIF primero, caché de imágenes de 30 días, fuentes con
`display: swap` y sin el peso 300, framer-motion fuera de las rutas que no lo
necesitan, logos de marca de 7,6 MB reducidos a 292 KB.

## 13.2 Lo que NO hay — y es el hueco más grande

**No hay ninguna herramienta de analítica ni de tracking en movilease.es.**
Buscado en todo `src/` y `public/`: cero coincidencias de `gtag`, `dataLayer`,
`googletagmanager`, `fbq`, `Meta Pixel`, `hotjar`, `clarity`, `posthog`,
`plausible`, `@vercel/analytics`.

Consecuencias:

- **No se sabe cuántas visitas hay, ni de dónde vienen, ni qué páginas
  convierten.** El único dato de conversión es el volumen de leads que llegan por
  Telegram y email.
- El **banner de cookies no gobierna nada**: guarda `ml_cookie_pref` en
  `localStorage` pero no hay ningún script que activar o bloquear según la
  respuesta.
- Las páginas legales (`/politica-cookies`, `/politica-privacidad`,
  `/aviso-legal`) son **placeholders con el texto "PENDIENTE"** (§14).

**Recomendación (pendiente de decidir con Adrián):** lo más rentable y barato es
**Vercel Web Analytics** (`@vercel/analytics`, sin cookies, sin banner que
gestionar) o **GA4 con consentimiento**, y en cualquiera de los dos casos marcar
como conversión el envío del formulario y el clic en WhatsApp — que es lo único
que importa medir en este negocio.

## 13.3 SEO de las otras webs

- **quierorenting.es** — `robots.txt` y `sitemap.xml` presentes; JSON-LD
  `AutoDealer`; metaetiquetas completas incluida `keywords`; 85 landings de SEO.
  `lastmod` congelado en 2026-06-18.
- **laponce.es** — **no tiene `robots.txt` ni `sitemap.xml`**; sin analítica; el
  fondo del hero se carga en caliente desde Unsplash.
- **adridaganzo.com** — tiene `robots.txt` (permite explícitamente a GPTBot y
  ChatGPT-User) y `sitemap.xml`; GTM y Meta Pixel **inicializados con valores de
  ejemplo** (`G-XXXXXXXXXX`, `0000000000000000`), así que **no miden nada**.

---

# 14. ESTADO ACTUAL DEL PROYECTO

## ✅ TERMINADO Y FUNCIONANDO

**MoviLease (este repositorio):**

- Home completa de 11 secciones, con vídeos de fondo propios y capa de movimiento
  afinada.
- Catálogo con filtros por marca, categoría, combustible y presupuesto, y una
  tarjeta por modelo (sin versiones duplicadas).
- **74 fichas de modelo** publicadas, con galería, specs, equipamiento, tabla de
  cuotas plazo × km, FAQ generada con datos reales, modelos hermanos y
  formulario.
- Blog con **9 artículos**, renderizador de Markdown propio y `Article` JSON-LD.
- Calculadora de presupuesto, comparador (hasta 3 coches) y favoritos, sobre
  `localStorage`.
- Landings de empresas y autónomos, y "Quiénes somos".
- Captación de leads completa: formulario + pop-up + WhatsApp + llamada, con
  honeypot, guardado en base de datos y doble notificación.
- SEO técnico: canonicals, Open Graph, ocho tipos de JSON-LD, sitemap dinámico,
  robots, verificación de Search Console.
- Accesibilidad: enlace "saltar al contenido", trampa de foco en el menú móvil,
  `aria-*` en acordeones y botones, contrastes medidos, `prefers-reduced-motion`
  respetado en todo.
- Rendimiento: AVIF, logos optimizados, framer-motion acotado, vídeos que no se
  descargan hasta que hacen falta.
- **`npm run lint` limpio y `npm run build` correcto** (verificado 31/08/2026).
- Panel: login con Supabase Auth, roles y `requireRole` ya cableados en las 8
  páginas.

**Fuera del repo:** quierorenting.es, laponce.es y adridaganzo.com están en
producción y responden 200.

## 🔄 EN PROCESO / A MEDIO HACER

1. **El panel de administración es una fachada.** Las 8 páginas de
   `/admin/(dashboard)/` dicen literalmente *"— Fase 4"*. La seguridad por roles
   está puesta; el contenido no. **Cambiar un precio hoy es un script o SQL, no
   la web.**
2. **`landing_pages`, `seo_metadata` y `redirects`** existen en el esquema y hay
   código que las lee (`getLandingPageBySlug`), pero no hay forma de crearlas
   desde la web ni se sabe si hay filas cargadas.
   `NO CONFIRMADO — REQUIERE REVISIÓN`.
3. **La ruta de ficha por versión (`/[modelo]/[version]`) no existe.** El
   `sitemap.ts` lo dice explícitamente: *"se añadirán cuando esa ruta esté
   publicada"*.
4. **Multimarca a medio camino** (§5.2): el código lo soporta,
   quierorenting.es no lo usa.

## ⏳ PENDIENTE

1. **Publicar el SEAT León.** Ficha, 7 fotos y `supabase/alta_seat_leon.sql`
   están listos y commiteados, pero **el SQL no se ha ejecutado**:
   `https://movilease.es/renting-seat-leon` **devuelve 404** (verificado
   31/08/2026). Es el trabajo a medias más inmediato. Basta con pegar
   `supabase/alta_seat_leon.sql` en el SQL Editor de Supabase (es idempotente) y
   revalidar.
2. **Rotar las credenciales expuestas de quierorenting.es** (§7.6). **Urgente.**
3. **Redactar las páginas legales.** `/aviso-legal` y `/politica-privacidad`
   contienen el texto *"PENDIENTE: completar con los datos fiscales…"*. El
   formulario de leads **enlaza a esa política de privacidad vacía** mientras
   pide el consentimiento RGPD: es un problema de cumplimiento, no cosmético.
   Hace falta razón social, NIF y domicilio — `NO CONFIRMADO — REQUIERE REVISIÓN`.
4. **Instalar analítica** (§13.2).
5. **Arreglar la cuenta atrás de laponce.es** (abajo).
6. **Arreglar el formulario de contacto de adridaganzo.com** (abajo).
7. **Recuperar el código del Sistema B en repositorios propios** (§2.5).
8. Personalizar el `README.md`, que sigue siendo el de `create-next-app`.

## 🐛 BUGS Y PROBLEMAS CONOCIDOS

### MoviLease

| # | Problema | Gravedad | Detalle |
|---|---|---|---|
| 1 | **No hay ISR: todo se renderiza bajo demanda** | Alta (rendimiento y coste) | Verificado: todas las respuestas llegan `no-store` y `x-vercel-cache: MISS`. Dos causas independientes, ambas comprobadas experimentalmente. Ver §5.7. |
| 2 | **Páginas legales vacías** | Alta (cumplimiento) | Ver arriba. |
| 3 | **Cero analítica** | Alta (negocio) | Ver §13.2. |
| 4 | **SEAT León preparado pero no publicado** | Media | 404 en producción. |
| 5 | **Incoherencia en `annual_km` por defecto** | Media | `add_vehicle.py` y `ficha_a_sql.py` ponen **15.000** km si la ficha no lo dice; `RENTING_DEFAULTS` y todos los textos de la web dicen **10.000** km (se cambió a 10.000 en el commit `2d097e4`). Un coche dado de alta sin `annual_km` explícito quedará descuadrado respecto a lo que promete la web. **Pon siempre `annual_km` en la ficha.** |
| 6 | **`vehicles.ts` y `landing.ts` usan el cliente con cookies** | Media | Ver §5.4. Contribuye al problema 1. |
| 7 | **Todos los formularios mandan `source: contact_form`** | Baja | El enum tiene seis valores útiles (`vehicle_page`, `catalog`, `calculator`…) y no se aprovecha ninguno: no se puede saber desde qué punto de la web entra cada lead. |
| 8 | **`src/scripts/` duplica `scripts/`** | Baja | Cuatro archivos Python heredados dentro del árbol de código TypeScript (`_env.py`, `debug_patch.py`, `update_images.py`, `update_images_fast.py`), con su propio `_env.py` que además exige `ANON_KEY`. Confunde. Candidatos a borrar o mover, **preguntando antes**. |
| 9 | **`Container` / `Section` / `Button` apenas se usan** | Baja | La mayoría de secciones repiten `mx-auto max-w-7xl px-6 sm:px-10` y las clases `.btn-*`. No es un fallo, pero **sigue la convención mayoritaria** y no unifiques por tu cuenta. |
| 10 | **`.section-label` gana a las utilidades de Tailwind** | Baja (trampa) | Es CSS sin capa, así que un `text-[#0057D6]` de Tailwind **no le hace nada**. Por eso en la home hay un `style={{ color: "#0057D6" }}` inline. Si un color de etiqueta "no se aplica", es esto. |
| 11 | **El banner de cookies no gobierna nada** | Baja | Guarda la preferencia y no hay scripts que activar. |
| 12 | **`README.md` sin personalizar** | Cosmética | Sigue el de `create-next-app`. |

### Quiero Renting

| # | Problema | Gravedad |
|---|---|---|
| 13 | **Credenciales de Web3Forms y Telegram en claro en el HTML público** | **Crítica** — ver §7.6 |
| 14 | Contenido y `lastmod` del sitemap congelados en junio de 2026 | Media |

### La Ponce

| # | Problema | Gravedad |
|---|---|---|
| 15 | **La cuenta atrás lleva más de dos meses muerta.** El array `EVENTS` termina el 24/06/2026; sin fecha futura el código cae en el último elemento, el `diff` sale negativo y el contador muestra **00:00:00:00** de forma permanente. El `<title>` **sigue anunciando "Darell · 24 Jun"** (verificado 31/08/2026) y el JSON-LD publica `MusicEvent` ya celebrados. | **Alta** |
| 16 | Sin `robots.txt` ni `sitemap.xml`; fondo del hero cargado en caliente desde Unsplash | Media |

*Arreglo mínimo del 15:* actualizar `EVENTS`, título, meta y JSON-LD.
*Arreglo bueno:* que cuando no haya fecha futura la sección muestre "próximamente"
y el enlace a FourVenues, en vez de un contador a cero.
**Antes de tocarlo hay que preguntar las fechas reales: no te las inventes.**

### Adri Daganzo

| # | Problema | Gravedad |
|---|---|---|
| 17 | **El formulario de contacto no envía nada.** Su `onsubmit` es literalmente `event.preventDefault(); alert('¡Gracias!…')`. El visitante ve un mensaje de éxito y **el mensaje se pierde**. Fuga de clientes silenciosa. (El modal de captación sí funciona: abre WhatsApp.) | **Alta** |
| 18 | Analítica con valores de ejemplo: Pixel `0000000000000000`, GA `G-XXXXXXXXXX`. No se mide nada, y los eventos `Lead`, `Contact` e `InitiateCheckout` que dispara el código no llegan a ninguna parte. | Media |
| 19 | `/en/` es un *stub* de 9 KB, no una traducción. Si piden "traducir la web", ojo: hoy la versión inglesa es una fachada. | Media |

---

# 15. HISTORIAL DE DECISIONES IMPORTANTES

Reconstruido de los 53 commits y de los comentarios del propio código. **Ninguna
de estas decisiones debe revertirse sin hablarlo.**

## Arquitectura

1. **Next.js 15 App Router + Supabase, no un CMS.** El catálogo es un modelo de
   datos con relaciones (marca → modelo → versión → cuotas × km), no páginas
   sueltas. Un CMS de bloques no habría dado la tabla de cuotas ni el JSON-LD con
   `AggregateOffer`.
2. **Una sola aplicación para dos marcas** (`src/lib/brand.ts`), resuelta por
   host. Se descartó duplicar el proyecto.
3. **Tres clientes Supabase separados** en vez de uno configurable: el error de
   usar cookies donde no tocaba costó un 500 en producción (commit `b5d660c`), y
   la separación explícita hace difícil repetirlo.
4. **La capa de datos nunca lanza.** Se prefiere una web degradada a una web
   caída.
5. **Tipos de la base de datos escritos a mano** (`database.types.ts`), con la
   nota de sustituirlos por `supabase gen types typescript` cuando se pueda. De
   ahí viene la ausencia de embeds de PostgREST.
6. **Middleware solo en `/admin`**: la web pública no debe depender de que exista
   Supabase configurado para renderizar.
7. **El catálogo se gestiona con scripts, no con el panel** (de momento). Era la
   vía más rápida para tener 74 fichas publicadas sin construir un CRUD entero.
8. **Un modelo sin stock devuelve 404**, no una ficha vacía (SEAT Arona, Opel
   Combo).
9. **La verificación es lint + build + navegador**, no tests automáticos. Se
   asumió a propósito: es una web de marketing, no una aplicación con lógica de
   negocio compleja.

## Diseño

10. **Sistema de diseño centralizado en `globals.css`**, con clases semánticas
    (`.display-md`, `.section-y`, `.surface-graphite`) en vez de repetir cadenas
    de utilidades. **Antes de inventar un estilo, busca la clase.**
11. **Contraste medido, no estimado.** De ahí `--blue-light: #5AA0FF` para texto
    sobre oscuro y la subida de `--on-dark-2/3` a 86 %/72 %. Los comentarios del
    CSS llevan las ratios.
12. **Movimiento premium unificado** (commit `6e36aa8`): una sola curva
    (`--easing-premium`), animación solo de `transform`/`opacity`, entrada del
    hero por peldaños de 200 ms, parallax contenido, navbar de cristal.
13. **`prefers-reduced-motion` respetado en todo**, sin excepciones.
14. **Vídeos de fondo propios, no de banco**, con velo denso: en la ficha *"el
    fondo tiene que sugerir, no disputar la atención al coche"*. Y con el recorte
    de la banda de texto que traía el creativo original, porque **texto dentro de
    una foto no lo lee Google ni un lector de pantalla**.
15. **framer-motion fuera de donde no aporta** (commit `aa20d74`): el hover de
    las tarjetas es CSS (`.card-lift`), el botón de WhatsApp es CSS
    (`.fab-enter`), las apariciones son `IntersectionObserver` + clases.
16. **Header con banda blanca y logo a color**; el slogan pasó del header al
    titular del hero, en grande (commits `9c1d665`, `e46545d`).
17. **El logo se sirve como `<img>`, no `next/image`**, para no activar
    `dangerouslyAllowSVG`.
18. **Fondo de sección con punto de anclaje** (`position`, commit `76d6b60`): un
    coche recortado a ras de ruedas necesita `center bottom` o se corta.

## Contenido y CRO

19. **Formulario corto por defecto** (nombre + teléfono), con el resto plegado.
20. **Pop-up a los 5 segundos** — *petición expresa de Adrián*, con la
    contrapartida anotada en el código.
21. **Kilometraje de referencia 10.000 km/año** (antes 15.000) y **correo propio
    `contacto@movilease.es`** (commit `2d097e4`).
22. **Ofertas: seis coches, no cuatro** — *"las que marca Adrián: Ibiza, Polo,
    Taigo, Ebro S400, GLC Coupé y CR-V"*. Con el tope en cuatro no llegaban a
    verse el GLC ni el CR-V, porque la consulta ordena por cuota ascendente.
23. **El catálogo muestra todos los modelos**, no doce. Ya se corrigió una vez.
24. **Una tarjeta por modelo en la vista de marca**: SEAT enseñaba dos Ibiza y
    Volkswagen dos Polo y dos Taigo, que es justo lo que hace dudar a quien está
    comparando.
25. **Sección "Qué incluye tu cuota" con entidad propia** (commit `a798191`): era
    el argumento de venta principal y solo se contaba de pasada.
26. **Testimonios reales**, con nombre, inicial y coche.
27. **FAQ de ficha generada con los datos del propio coche**, no texto genérico
    (commit `073f14b`).
28. **Llegando desde la calculadora con presupuesto, el resultado va antes de las
    marcas** (commit `b6161a1`).

## SEO

29. **Cinco bloques de mejora ejecutados en julio** (commits `434ef1c` a
    `e7a3a94`): diseño premium, CRO, SEO técnico, rendimiento y accesibilidad.
30. **`pageMetadata()` como única vía** de declarar metadatos.
31. **Canonical por marca en el catálogo**, con `noIndex` en las combinaciones
    filtradas.
32. **Cuota como `UnitPriceSpecification` con `unitCode: MON`**, para que Google
    no muestre la cuota como precio del coche.
33. **Migas de pan visibles** en ficha y catálogo: no había ninguna ruta de vuelta
    ni para el visitante ni para el rastreador.
34. **Enlazado interno entre modelos de la misma marca** y **desde el pie a las 12
    marcas con más stock**.
35. **Las respuestas del acordeón se montan siempre**, aunque el panel esté
    cerrado, para que el `FAQPage` no declare texto inexistente.
36. **Redirección `www` → sin `www` con 301/308 en el edge**, en vez de middleware
    en todas las rutas públicas.

## Cosas que se descartaron

- Duplicar el proyecto para la segunda marca.
- Añadir un parser de Markdown como dependencia (se escribió uno mínimo).
- Usar embeds de PostgREST (bloqueado por los tipos escritos a mano).
- Animar las tarjetas del catálogo con JavaScript.
- El peso 300 de las fuentes.
- Convertir las webs del Sistema B a Next.js: *"son webs de una tarde;
  convertirlas es un proyecto, no un arreglo"*.

## Errores que no hay que repetir

- Usar el cliente Supabase **con cookies** en una página con
  `generateStaticParams` → 500 en producción.
- Publicar una ficha **sin stock** → URL viva y vacía en Google.
- Meter **texto dentro de una imagen** de fondo.
- Duplicar **versiones del mismo modelo** en un listado.
- Envolver la respuesta de un acordeón en `{isOpen && ...}`.
- Escribir una **cuota de 0 €** desde una lámina.
- Poner un secreto en una variable `NEXT_PUBLIC_*` **o en JavaScript de cliente**
  (es exactamente lo que le pasa hoy a quierorenting.es).

---

# 16. REGLAS QUE DEBES RESPETAR SIEMPRE

## Proceso

1. **Analiza antes de modificar.** Lee el archivo entero y sus dependencias antes
   de tocar una línea. Los comentarios explican decisiones que costaron dinero.
2. **Lee `AGENTS.md` y la guía de `node_modules/next/dist/docs/`** antes de
   escribir código de Next. **Esta no es la versión de Next.js que recuerdas.**
3. **`npm install` es el primer comando de toda sesión nueva.**
4. **Verifica con `npm run lint` y `npm run build` antes de commitear.** Las dos.
   Sin excepciones.
5. **Comprueba el móvil.** El grueso del tráfico es móvil. Mira el cambio a
   375 px de ancho antes de darlo por bueno.
6. **No rompas lo que funciona.** Antes de cambiar algo compartido
   (`globals.css`, `lib/data/vehicles.ts`, `VehicleCard`, `LeadForm`), busca
   quién lo usa (`grep`) y comprueba el impacto en todas las páginas.
7. **No modifiques nada que no haga falta para el encargo.** Nada de refactores
   de paso, reformateos ni "de camino lo he unificado".
8. **Explica claramente qué has cambiado** y por qué, en español.

## Código

9. **Comentarios en español, explicando el porqué, nunca el qué.** Todo el
   proyecto lo hace. Imítalo.
10. **Mensajes de commit en español**, sin prefijos tipo `feat:`, con cuerpo que
    explique el problema, la decisión y **cómo se verificó**. Mira `git log -5`.
11. **Antes de inventar un estilo, busca la clase en `globals.css`.** Casi
    siempre ya existe.
12. **No crees `tailwind.config.js`.** Tailwind v4 se configura en el bloque
    `@theme inline` del CSS.
13. **Los tipos de fila de la BD se declaran con `type`, nunca `interface`.**
14. **Elige el cliente Supabase correcto** (§5.4). Con cookies solo donde hace
    falta sesión.
15. **La capa de datos nunca lanza**: devuelve `[]` o `null`.
16. **Toda página nueva usa `pageMetadata()`**, entra en `sitemap.ts` y se enlaza
    desde `Header` o `Footer`.
17. **Anima solo `transform` y `opacity`**, con `--easing-premium`, y añade la
    excepción de `prefers-reduced-motion`.
18. **Toda tabla nueva necesita RLS *y* `GRANT`.**
19. **Un valor de enum nuevo se toca en tres sitios:** el SQL,
    `src/lib/constants.ts` y `src/types/database.types.ts`.
20. **Un origen nuevo de imágenes se declara en `next.config.ts`.**

## Datos y negocio

21. **No inventes datos de negocio.** Precios, kilometrajes, plazos, fechas,
    nombres de clientes, datos fiscales: si no puedes comprobarlo, **pregunta**.
22. **Nunca escribas una cuota de 0 €.** En las láminas el 0 significa "ese
    kilometraje no se ofrece".
23. **La lámina del Drive manda** sobre lo que diga cualquier web.
24. **Mejor una foto que las de otro modelo.** Si el emparejado no es seguro, no
    se toca la galería.
25. **Mantén la coherencia entre catálogo y ficha**: una tarjeta por modelo con la
    versión más barata; la ficha lista todas las versiones.
26. **Los precios se guardan en céntimos con el IVA incluido.** No multipliques
    por 1,21 en ningún componente.

## Seguridad

27. **Nunca expongas secretos.** Ni en el repo, ni en un log, ni en una variable
    `NEXT_PUBLIC_*`, ni en JavaScript de cliente.
28. **`.env.local` no se commitea jamás.**
29. **La service role key solo en servidor**, protegida por `import "server-only"`.
30. **No quites el honeypot** (`<input name="website">`) del formulario.

## Marca y despliegue

31. **No cambies el branding si no te lo piden.** Azul `#0068FF` para MoviLease,
    verde `#18a05a` para QuieroRenting. **No los mezcles.**
32. **No metas un framework en las webs del Sistema B** para un cambio pequeño.
33. **En el Sistema B no hay build que te avise.** Abre el HTML en el navegador y
    mira la consola.
34. **En el Sistema B, un dato que cambia hay que cambiarlo en todos los sitios
    donde aparece, incluido el JSON-LD.** Si el texto dice una fecha y el JSON-LD
    dice otra, Google se queda con la discrepancia.
35. **Un cambio de estilo global en el Sistema B se hace con un script sobre los
    ~37 archivos, nunca a mano** (cada página lleva su propia copia del CSS).
36. **Nunca hagas push a `master` sin permiso explícito.** Trabaja en la rama
    indicada.

---

# 17. PROTOCOLO DE TRABAJO

Sigue estos diez pasos **cada vez** que Adrián pida una modificación:

### 1. Entender la petición
Si hay dos lecturas razonables que llevan a trabajos distintos, **pregunta antes
de empezar**. Si la duda solo afecta a un detalle, elige lo más conservador,
sigue adelante y dilo al terminar.

### 2. Localizar los archivos afectados
```bash
grep -rn "<texto que se ve en la web>" src/
grep -rn "NombreDelComponente" src/
```
Recuerda: los textos de la home están en **constantes al principio de
`page.tsx`**, no en el JSX. Los precios están **en la base de datos**, no en el
código.

### 3. Analizar dependencias
¿Quién más usa este componente, esta función, esta clase CSS?
```bash
grep -rn "getVehiclesByBrand\|VehicleCard\|\.section-label" src/ | wc -l
```
Un cambio en `lib/data/vehicles.ts` toca **home, catálogo, ficha, comparador,
footer, header y sitemap** a la vez.

### 4. Revisar impactos
- ¿Afecta al SEO (canonical, JSON-LD, sitemap)?
- ¿Afecta al contraste o a la accesibilidad?
- ¿Afecta al rendimiento (más JS de cliente, más peticiones)?
- ¿Rompe alguna de las decisiones de §15?

### 5. Implementar
Mínimo cambio necesario. Reutiliza las clases y los componentes que ya existen.
Comenta **el porqué** en español si la decisión no es obvia.

### 6. Revisar errores
```bash
npm run lint
npm run build
```
Las dos limpias. Si el build falla, arréglalo antes de seguir.

### 7. Comprobar responsive
`npm run dev` y mirarlo a **375 px** (móvil), **768 px** (tablet) y **1440 px**
(escritorio). Revisa que no aparezca scroll horizontal — ya hubo un commit
específico para eso (`d99150c`).

### 8. Comprobar en el navegador
Consola sin errores, y prueba de verdad lo que has tocado: si es el formulario,
envíalo; si es la galería, pásala; si es el menú, ábrelo con el teclado.

### 9. No modificar de más
Revisa tu propio `git diff` antes de commitear. Si hay líneas que no tienen que
ver con el encargo, quítalas.

### 10. Explicar el cambio
En español y sin florituras: qué se ha cambiado, en qué archivos, por qué, y qué
falta o qué habría que vigilar.

**Y si el cambio es de catálogo (coche, precio, foto):** después de ejecutar el
script, **revalida** las rutas afectadas (§8.4) y comprueba la URL en producción.

---

# 18. GUÍA RÁPIDA PARA MODIFICACIONES HABITUALES

## 18.1 Añadir un coche nuevo

1. **Prepara las fotos.** Si viene una lámina del Drive:
   ```bash
   node scripts/slice-photo-sheet.mjs "FOTOS SEAT LEON.png" seat-leon-fr
   ```
   Deja los `.webp` en `public/coches-nuevos/`.
2. **Crea la ficha** en `scripts/fichas/<marca>-<modelo>-<version>.json`, copiando
   `scripts/fichas/seat-leon-15-tsi-fr-special-edition.json`. **Rellena siempre
   `annual_km`** (bug #5 de §14).
3. **Publica:**
   ```bash
   python scripts/add_vehicle.py scripts/fichas/<coche>.json
   # o, sin credenciales:
   python scripts/ficha_a_sql.py scripts/fichas/<coche>.json > supabase/alta_<coche>.sql
   ```
4. **Revalida** `/`, `/catalogo` y `/<model_slug>` (§8.4).
5. **Comprueba** `https://movilease.es/renting-<marca>-<modelo>` y que la marca
   aparece en el mega-menú.
6. **Commitea** la ficha JSON y las fotos (el repo guarda las dos cosas).

## 18.2 Modificar el precio de un coche

**No está en el código.** Dos vías:

**A) Rápida, un solo precio** — SQL Editor de Supabase:
```sql
update vehicles v
set monthly_price_cents = 36500          -- 365 € en céntimos, IVA incluido
from models m
where m.id = v.model_id
  and m.slug = 'renting-seat-leon'
  and v.version_slug = '1-5-tsi-fr-special-edition';
```

**B) Completa, precio + tabla de cuotas** — edita el JSON de la ficha, añádele
`"update_vehicle_id": "<uuid del vehículo>"` y ejecuta `add_vehicle.py`. Así se
reemplazan también las filas de `vehicle_pricing` **sin cambiar la URL
publicada**.

Después: **revalidar** `/`, `/catalogo` y la ficha.

## 18.3 Añadir una oferta

Poner `is_offer = true` en el vehículo:
```sql
update vehicles set is_offer = true where id = '<uuid>';
```
La home muestra **6 ofertas**, ordenadas por cuota ascendente y deduplicadas por
modelo (`getOfferVehicles(6)` en `src/app/(public)/page.tsx`). Si quieres que
salga un coche caro, **quita otro** o sube el límite — pero ese número lo eligió
Adrián a propósito.

Para "Selección de la semana": `is_featured = true` (se muestran hasta 8).

## 18.4 Crear una ficha nueva

No hay que crear ninguna página: **la ruta `/[slug]` genera la ficha sola** a
partir de los datos del modelo. Basta con dar de alta el coche (§18.1). La URL es
el `slug` del modelo.

## 18.5 Cambiar las imágenes de un coche

- **Sustituir el archivo** en `public/coches-nuevos/` manteniendo el nombre: no
  hace falta tocar la base de datos.
- **Cambiar la galería entera:** edita el bloque `images` del JSON, añade
  `"update_vehicle_id"` y ejecuta `add_vehicle.py` (borra y reinserta
  `vehicle_images`).
- **Cambiar solo la foto principal:**
  ```sql
  update vehicles set main_image_url = '/coches-nuevos/seat-leon-fr-01.webp'
  where id = '<uuid>';
  ```
- **Fotos de un dominio nuevo:** hay que declararlo en `remotePatterns` de
  `next.config.ts` **antes**, o `next/image` las rechaza.

## 18.6 Crear una página nueva

1. `src/app/(public)/<ruta>/page.tsx`.
2. Metadatos con `pageMetadata({ title, description, path })`.
3. JSON-LD si aplica: `WebPageJsonLd` + `BreadcrumbJsonLd`.
4. Estructura de sección estándar:
   ```tsx
   <section className="surface-graphite relative overflow-hidden bg-texture-dark section-y">
     <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
       <Reveal className="section-head">
         <p className="section-label">Etiqueta</p>
         <h2 className="display-md mt-4 text-white">Titular</h2>
       </Reveal>
       {/* … */}
     </div>
   </section>
   ```
5. **Añádela a `src/app/sitemap.ts`** (array `staticEntries`).
6. **Enlázala** desde `NAV_LINKS` en `Header.tsx` o desde una columna del
   `Footer`.
7. `npm run build`.

Copia `src/app/(public)/renting-autonomos/page.tsx` como plantilla: es la landing
más completa y reciente.

## 18.7 Modificar el menú

**Escritorio y móvil comparten la misma lista**, `NAV_LINKS` en
`src/components/layout/Header.tsx` (línea ~19):
```ts
const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/#ofertas", label: "Ofertas" },
  // …
];
```
El mega-menú de marcas **se genera solo** a partir de `getVehiclesByBrand()`: no
hay lista que mantener. Si añades un enlace, **comprueba que el menú sigue
cabiendo a 1280 px** — va justo.

El pie tiene sus propias listas, escritas en `src/components/layout/Footer.tsx`
("Plataforma", "Empresa", "Contacto").

## 18.8 Modificar un formulario

- **Añadir un campo visible:** `src/components/forms/LeadForm.tsx` (dentro de
  `#lead-detalles` si es secundario) + `src/lib/validations/lead.ts` +
  `src/lib/actions/leads.ts` (lectura del `FormData` e `insert`) + columna nueva
  en `leads` (migración) + `src/types/database.types.ts`. Si quieres que salga en
  los avisos: `src/lib/notifications/{web3forms,telegram}.ts` y
  `notifications/types.ts`.
- **Cambiar textos o el orden:** solo `LeadForm.tsx`.
- **No toques** el honeypot ni la lógica de `showDetails`.

## 18.9 Cambiar un CTA

- **Texto del botón del formulario:** prop `submitLabel` de `<LeadForm />`.
- **Mensaje de WhatsApp:** el argumento de `buildWhatsAppLink("…")` allí donde
  esté. Hazlo específico: el de la ficha lleva marca, modelo, versión y cuota.
- **Estilo:** clases `.btn-primary` / `.btn-ghost` / `.btn-white` /
  `.btn-whatsapp` + `.btn-lg` / `.btn-sm` / `.btn-block`. **No escribas un botón
  desde cero.**

## 18.10 Cambiar el diseño de una sección

1. Localiza la `<section>` en su `page.tsx` (todas van comentadas con
   `{/* ══ NOMBRE ══ */}` en la home).
2. Cambia la clase de superficie: `surface-black`, `surface-dark`,
   `surface-graphite`, `surface-carbon`, `bg-white`, `bg-[#F4F6FA]`,
   `bg-[#FAFAFA]`.
3. Textura opcional: `bg-texture-light` / `bg-texture-dark` (la sección necesita
   `relative overflow-hidden` y su contenido `relative z-10`).
4. Fondo de vídeo o foto:
   ```tsx
   <VideoBackdrop
     mp4="/videos/porque-renting.mp4"
     poster="/videos/porque-renting-poster.webp"
     base="#071A3D"
     veil="linear-gradient(180deg, rgba(7,26,61,0.84) 0%, rgba(7,26,61,0.9) 100%)"
     position="center bottom"
   />
   ```
5. **Comprueba el contraste** del texto sobre el fondo nuevo. Sobre oscuro, el
   azul de texto es `--blue-light` (`#5AA0FF`), **no** `#0068FF`.

## 18.11 Añadir una integración externa

1. La clave va en `.env.local` **sin** prefijo `NEXT_PUBLIC_` si es secreta, y en
   *Vercel → Settings → Environment Variables* para producción.
2. Documéntala en `.env.example` (solo el nombre) y en §11 de este documento.
3. El módulo va en `src/lib/<servicio>/`, con `import "server-only"` si toca
   claves.
4. **Sigue el patrón de `notifications/`:** función que devuelve `boolean`,
   `try/catch` que devuelve `false`, y **que la falta de la clave no rompa
   nada** (`if (!apiKey) return false;`).
5. Si es analítica, además: script en `layout.tsx`, conectarlo al banner de
   cookies y actualizar `/politica-cookies`.

## 18.12 Publicar un artículo de blog

```sql
insert into blog_posts (title, slug, excerpt, content, cover_image_url, status, published_at)
values ('Título', 'slug-del-articulo', 'Resumen…', '## Contenido en Markdown…',
        '/img/portada.webp', 'published', now());
```
El contenido admite `h2`, `h3`, párrafos, listas, citas, negrita, cursiva y
enlaces (§8.8). Entra solo en `/blog`, en el sitemap y en los relacionados.

## 18.13 Publicar un evento nuevo en La Ponce (Sistema B)

**Hay que tocar cinco sitios del mismo archivo `index.html`**, y es el cambio más
fácil de dejar a medias:

1. El array `EVENTS` del JavaScript inline.
2. El `<title>`.
3. La `<meta name="description">`.
4. El bloque JSON-LD `MusicEvent`.
5. El flyer en `fotos/` y el enlace de FourVenues.

**Pregunta las fechas reales antes. No te las inventes.**

## 18.14 Crear una landing de SEO en adridaganzo.com o quierorenting.es

Copia la más parecida, cambia el contenido, el `h1` y el JSON-LD, y **añádela a
`sitemap.xml`**. No empieces de cero.

---

# 19. PROMPT DE INICIO PARA EL NUEVO CLAUDE CODE

> Copia desde aquí hasta el final y pégalo en la sesión nueva.

---

**Estás tomando el control de los proyectos MoviLease y Quiero Renting (y, de
paso, de laponce.es y adridaganzo.com). A continuación tienes toda la
documentación necesaria sobre su arquitectura, código, diseño, negocio,
funcionalidades y reglas de desarrollo. Léela entera antes de tocar nada.**

## Lo mínimo que tienes que tener claro

**Hay dos sistemas técnicos distintos y no se mezclan:**

- **Sistema A — movilease.es.** Aplicación **Next.js 15 (App Router) + React 19 +
  TypeScript + Tailwind v4 + Supabase**, desplegada en **Vercel**. Es el
  repositorio `quierorenting-collab/movilease`, rama principal `master`. Aquí está
  el 95 % del trabajo.
- **Sistema B — quierorenting.es, laponce.es, adridaganzo.com.** **HTML estático
  escrito a mano**, servido tal cual desde Vercel. Sin framework, sin build, con
  **todo el CSS y el JS inline dentro de cada `.html`**. **No hay repositorio
  conocido** de ninguna de las tres.

**Corrección importante respecto a documentos anteriores:** MoviLease y
QuieroRenting **no son la misma web con otra marca**. El código soporta
multimarca por dominio (`src/lib/brand.ts`), pero **quierorenting.es apunta hoy a
otro proyecto de Vercel con HTML estático**. Si te piden tocar Quiero Renting,
probablemente **no se toque este repositorio**.

Renting (movilease.es y quierorenting.es) → **34644156797**.
La Ponce y adridaganzo.com → **34613267375**. Son dos líneas distintas a
propósito; no unificarlas (criterio de Adrián, 04/09/2026).

## Antes de escribir una línea de código

1. **`npm install`** — `node_modules` no está en el repo.
2. **Lee `AGENTS.md`**: *"This is NOT the Next.js you know"*. Consulta la guía
   correspondiente en `node_modules/next/dist/docs/`. **`cookies()`, `headers()`,
   `params` y `searchParams` son asíncronos.**
3. **Lee `src/app/globals.css`** (911 líneas). Es todo el sistema de diseño.
   Antes de inventar un estilo, busca la clase: casi siempre ya existe.

## Verificación obligatoria antes de cada commit

```bash
npm run lint      # hoy sale limpio
npm run build     # hoy compila: 32 páginas
```
Y si el cambio es visual, míralo a **375 px** de ancho.

## Dónde está cada cosa

| Quiero… | Voy a… |
|---|---|
| cambiar un texto de la home | las **constantes** al principio de `src/app/(public)/page.tsx` |
| cambiar el precio de un coche | **Supabase**, no el código (§8.4, §18.2) |
| añadir un coche | ficha JSON en `scripts/fichas/` + `python scripts/add_vehicle.py` |
| tocar la ficha de vehículo | `src/app/(public)/[slug]/page.tsx` |
| tocar el catálogo o los filtros | `src/app/(public)/catalogo/page.tsx` |
| tocar cómo se leen los coches | `src/lib/data/vehicles.ts` (afecta a **7 sitios**) |
| tocar el menú | `NAV_LINKS` en `src/components/layout/Header.tsx` |
| tocar el formulario | `src/components/forms/LeadForm.tsx` + `src/lib/validations/lead.ts` + `src/lib/actions/leads.ts` |
| tocar estilos | `src/app/globals.css` |
| crear una página | `src/app/(public)/<ruta>/page.tsx` + `pageMetadata()` + `sitemap.ts` + enlace |

## Reglas innegociables

1. **Comentarios y commits en español**, explicando **el porqué**, no el qué. Sin
   prefijos tipo `feat:`. Mira `git log -5`.
2. **Analiza antes de modificar**; no toques nada que no haga falta para el
   encargo.
3. **`npm run lint` + `npm run build` limpios antes de commitear.**
4. **Móvil primero:** comprueba a 375 px.
5. **No inventes datos de negocio.** Precios, kilometrajes, fechas, datos
   fiscales: si no puedes comprobarlo, **pregunta**.
6. **Nunca una cuota de 0 €** (en las láminas el 0 significa "ese kilometraje no
   se ofrece").
7. **Los precios se guardan en céntimos con el IVA incluido.** No hay ningún
   cálculo de IVA en el código y no debes añadirlo por tu cuenta.
8. **Elige bien el cliente Supabase**: `createPublicClient()` (sin cookies) para
   contenido público; `createClient()` (con cookies) solo donde hace falta
   sesión. Mezclarlos ya costó un 500 en producción.
9. **La capa de datos nunca lanza**: devuelve `[]` o `null`.
10. **Anima solo `transform` y `opacity`**, con `--easing-premium`, y respeta
    `prefers-reduced-motion`.
11. **Toda página nueva usa `pageMetadata()`**, entra en `sitemap.ts` y se enlaza.
12. **Nunca expongas secretos**: ni en el repo, ni en un log, ni en una variable
    `NEXT_PUBLIC_*`, ni en JavaScript de cliente.
13. **No cambies el branding si no te lo piden.** MoviLease es azul `#0068FF`;
    QuieroRenting es verde `#18a05a`. No los mezcles.
14. **No hagas push a `master` sin permiso explícito.**

## Lo que está a medias ahora mismo

1. **El SEAT León está preparado pero no publicado**:
   `supabase/alta_seat_leon.sql` no se ha ejecutado y
   `movilease.es/renting-seat-leon` devuelve **404**. Es lo más inmediato.
2. **Las credenciales de quierorenting.es (Web3Forms y bot de Telegram) están en
   claro en su HTML público.** Hay que rotarlas. **Urgente.**
3. **No hay ISR en producción**: todo se renderiza bajo demanda con `no-store`.
   Dos causas comprobadas, en `src/app/layout.tsx` y en
   `src/app/(public)/layout.tsx`.
4. **No hay analítica de ningún tipo** en movilease.es.
5. **Las páginas legales están vacías** ("PENDIENTE"), y el formulario enlaza a
   ellas al pedir el consentimiento RGPD.
6. **El panel `/admin` es una fachada**: las 8 páginas son stubs de "Fase 4".
7. **La cuenta atrás de laponce.es lleva muerta desde el 24/06/2026** y el
   `<title>` sigue anunciando ese evento.
8. **El formulario de contacto de adridaganzo.com no envía nada**: solo hace
   `alert()`.

## Tu protocolo, cada vez que te pidan algo

1. Entender la petición (preguntar si hay dos lecturas que llevan a trabajos
   distintos).
2. Localizar los archivos (`grep`).
3. Analizar dependencias (¿quién más usa esto?).
4. Revisar impactos (SEO, accesibilidad, rendimiento, otras páginas).
5. Implementar el mínimo cambio necesario.
6. `npm run lint` + `npm run build`.
7. Comprobar responsive a 375 / 768 / 1440 px.
8. Probarlo de verdad en el navegador.
9. Revisar tu propio `git diff` y quitar lo que sobre.
10. Explicar en español qué has cambiado, dónde y por qué.

**Referencia completa:** `docs/HANDOFF-MAESTRO.md` en el repositorio
`quierorenting-collab/movilease`. Si algo de este resumen se te queda corto, está
desarrollado allí.

**Mi encargo es:** _<describe aquí lo que quieres>_
