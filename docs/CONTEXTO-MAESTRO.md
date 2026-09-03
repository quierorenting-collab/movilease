# CONTEXTO MAESTRO — MOVILEASE Y QUIERO RENTING

> **INSTRUCCIONES DE USO:** copia este documento **entero** y pégalo en la
> primera conversación de tu nuevo Claude Code. Si el repositorio ya está
> conectado, basta con decir: *"lee `docs/CONTEXTO-MAESTRO.md` entero antes de
> tocar nada"*.
>
> **Verificado el 01/09/2026** contra el código del repositorio y contra las
> webs en producción (cabeceras HTTP, DNS, HTML servido, `npm run lint` y
> `npm run build`). Lo que no se ha podido comprobar está marcado como
> **⚠️ NO CONFIRMADO**. Aquí no hay nada inventado.
>
> **Documentación complementaria en el repositorio:**
> - `docs/HANDOFF-MAESTRO.md` — la versión larga y exhaustiva (2.336 líneas):
>   historial de decisiones, inventario de componentes uno a uno, lista completa
>   de bugs. **Léelo cuando necesites profundidad.**
> - `docs/MIGRACION-NUEVO-CLAUDE.md` — guía de accesos para el propietario.
> - `docs/PROMPT-WEBS.md` — documento antiguo, **superado**. No lo uses como
>   referencia.

---

# INSTRUCCIONES PERMANENTES PARA CLAUDE CODE

Estás trabajando en los proyectos **MoviLease** y **Quiero Renting**, propiedad
de Adrián Daganzo. Tienes acceso autorizado a los repositorios y servicios
indicados en este documento.

**Antes de realizar cualquier modificación:**

1. **Analiza los archivos afectados** antes de escribir una línea.
2. **No rompas funcionalidades existentes.**
3. **Localiza primero la arquitectura actual**: casi todo lo que necesitas ya
   existe.
4. **Reutiliza componentes y clases CSS existentes.** No inventes estilos: mira
   `src/app/globals.css` antes, la clase suele existir ya.
5. **Mantén el diseño y la identidad de marca** (§9).
6. **Comprueba el responsive**, especialmente a 375 px de ancho.
7. **Ejecuta las comprobaciones disponibles**: `npm run lint` y `npm run build`.
8. **Verifica que el proyecto compila** antes de commitear. Siempre.
9. **Realiza únicamente los cambios necesarios.** No refactorices de paso.
10. **Después explica qué has cambiado** y cómo lo has verificado.

**Reglas específicas de estos proyectos:**

11. **Comentarios en español, explicando el PORQUÉ, nunca el qué.** Todo el
    código sigue esa norma; imítala. Un comentario que dice *"itera el array"*
    sobra; uno que dice *"dos consultas planas porque los embeds de PostgREST
    necesitan metadatos que nuestro Database escrito a mano no tiene"* es el
    estándar de la casa.
12. **Mensajes de commit en español**, sin prefijos tipo `feat:` o `fix:`, con
    cuerpo que explica el problema, la decisión tomada y **cómo se verificó**.
    Mira `git log -5` antes del primero.
13. **Nunca hagas push a `master` sin permiso explícito.** Trabaja en la rama
    que se te indique.
14. **Nunca metas secretos en el repositorio.** `.env.local` está en
    `.gitignore` y debe seguir estándolo.
15. **No inventes datos de negocio.** Si no puedes comprobar un precio, una
    fecha, un dato fiscal o una cuenta, **pregunta**. Es preferible una pregunta
    a un dato falso publicado.
16. **Lee `AGENTS.md`**: este no es el Next.js que recuerdas de tu
    entrenamiento. `cookies()`, `headers()` y `params` son **asíncronos**.
    Consulta `node_modules/next/dist/docs/` cuando dudes.
17. En una sesión nueva **`node_modules` no existe**: ejecuta `npm install`
    primero.

---

# 1. LO PRIMERO QUE TIENES QUE ENTENDER

## MoviLease y QuieroRenting NO son la misma web

Es el error de partida más caro y hay que quitárselo de encima antes de nada:

| | **movilease.es** | **quierorenting.es** |
|---|---|---|
| Qué es | Aplicación **Next.js 15 + Supabase** | **HTML estático escrito a mano** |
| Código | **Este repositorio** | Fuera del repositorio ⚠️ |
| Framework | Next.js App Router | **Ninguno** |
| Build | `npm run build` | **No hay build** |
| Catálogo | 74 fichas en base de datos | ~85 páginas escritas a mano |
| CSS / JS | Tailwind v4 + `globals.css` | **Todo inline dentro del `.html`** |
| Se cambia | Editando el repo y haciendo push | Editando ficheros `.html` sueltos |

El código de este repositorio **soporta** servir dos marcas por dominio
(`src/lib/brand.ts` define `BRANDS` con `movilease.es` y `quierorenting.es`),
pero **hoy quierorenting.es NO apunta a esta aplicación**.

Verificado el 01/09/2026:

```
GET https://quierorenting.es/          → 200, x-vercel-cache: HIT, sin x-powered-by
GET https://quierorenting.es/catalogo  → 404
GET https://movilease.es/catalogo      → 200, x-powered-by: Next.js
```

**Si te piden "cambia algo en Quiero Renting", lo más probable es que NO se
toque este repositorio.** Ver §6.

## El ecosistema completo

Hay **cuatro webs** en producción, todas alojadas en Vercel. **Son DOS
teléfonos distintos, y es a propósito** (criterio de Adrián, 04/09/2026):

| Teléfono | Marcas |
|---|---|
| **+34 644 15 67 97** (`34644156797`) | movilease.es · quierorenting.es |
| **+34 613 26 73 75** (`34613267375`) | laponce.es · adridaganzo.com |

**Ninguno de los dos es "el antiguo".** Son las dos líneas del negocio: el 644
es el de renting y el 613 el del resto. Unificarlos sería un error.

⚠️ **adridaganzo.com devolvía 404 el 04/09/2026** (Vercel, NOT_FOUND en la
raíz, con el dominio correctamente apuntado a un despliegue Ready de
producción: el build no genera nada en `/`). No se pudo comprobar qué teléfono
muestra.

| Web | Qué es | Sistema |
|---|---|---|
| **movilease.es** | Renting de coches. La marca principal y la web nueva. | **A** — Next.js + Supabase |
| **quierorenting.es** | La marca de captación anterior. Sigue viva y captando leads. | **B** — HTML estático |
| laponce.es | Conciertos de música urbana en Oh My Club, Madrid | **B** — HTML estático |
| adridaganzo.com | Portfolio que agrupa las marcas del propietario | **B** — HTML estático |

**Objetivo de negocio de las cuatro:** generar contactos que acaben en una
conversación de WhatsApp.

---

# 2. STACK Y COMANDOS (MoviLease)

- **Next.js 15.5** (App Router) + **React 19** + **TypeScript** (`strict: true`)
- **Tailwind CSS v4** — con `@import "tailwindcss"` y `@theme inline`. **No hay
  `tailwind.config.js`**, no lo busques.
- **Supabase** — `@supabase/ssr` + `@supabase/supabase-js`: base de datos, auth
  del panel y almacenamiento
- **framer-motion 12**, **zod 4**, **`server-only`**
- Scripts auxiliares en **Python** (`requests`) y **Node** (`sharp`, `ffmpeg`)

```bash
npm install      # obligatorio en sesión nueva
npm run dev      # http://localhost:3000
npm run lint     # tiene que salir limpio (hoy lo está)
npm run build    # tiene que compilar (hoy compila)
```

**Sin `.env.local` la web arranca igual**: la capa de datos nunca lanza, así que
el catálogo sale vacío pero el diseño y la navegación se ven perfectamente. Es
suficiente para trabajar en maquetación.

**Despliegue:** push a `master` → Vercel construye y publica en movilease.es.
Push a cualquier otra rama → *preview* con URL propia.

---

# 3. MAPA REAL DEL CÓDIGO

## 3.1 Árbol del proyecto

```
/
├── AGENTS.md                      ← "este no es el Next.js que recuerdas". LÉELO
├── CLAUDE.md                      ← importa AGENTS.md
├── next.config.ts                 ← redirección www, imágenes, dominios de fotos
├── package.json                   ← dependencias y los 4 comandos
├── tsconfig.json                  ← alias @/* → ./src/*
├── eslint.config.mjs
├── postcss.config.mjs             ← solo @tailwindcss/postcss
├── .env.example                   ← PLANTILLA de las 9 variables (sin valores)
├── .gitignore                     ← ignora .env*, node_modules, .next, .vercel
│
├── docs/
│   ├── CONTEXTO-MAESTRO.md        ← este documento
│   ├── MIGRACION-NUEVO-CLAUDE.md  ← guía de accesos para el propietario
│   ├── HANDOFF-MAESTRO.md         ← la versión larga y exhaustiva
│   └── PROMPT-WEBS.md             ← ANTIGUO, superado
│
├── public/                        ← TODO lo estático se sirve desde la raíz "/"
│   ├── coches-nuevos/             ← 139 fotos .webp de coches ★
│   ├── brands/                    ← 28 logos de marca (svg/png)
│   ├── brand/movilease-logo.png
│   ├── videos/                    ← 5 vídeos de fondo + sus pósters .webp
│   ├── img/                       ← fondos sueltos (pop-up, quiénes somos)
│   ├── logo.svg · logo.png
│   └── *-bg.webp                  ← fondos de sección (hero, contacto, ficha…)
│
├── src/
│   ├── middleware.ts              ← SOLO cubre /admin/:path*
│   │
│   ├── app/
│   │   ├── layout.tsx             ← raíz: fuentes, metadatos base, Search Console
│   │   ├── globals.css            ← ★ TODO EL DISEÑO (911 líneas)
│   │   ├── sitemap.ts             ← sitemap dinámico
│   │   ├── robots.ts
│   │   ├── opengraph-image.tsx    ← imagen para compartir en WhatsApp/redes
│   │   ├── not-found.tsx · error.tsx · favicon.ico
│   │   │
│   │   ├── (public)/              ← ★ LA WEB PÚBLICA
│   │   │   ├── layout.tsx         ← Header + main + Footer + WhatsApp + pop-up
│   │   │   ├── page.tsx           ← ★ LA HOME (910 líneas, 11 secciones)
│   │   │   ├── catalogo/page.tsx  ← ★ EL CATÁLOGO, con filtros
│   │   │   ├── [slug]/page.tsx    ← ★ LAS FICHAS DE COCHE (813 líneas)
│   │   │   ├── blog/page.tsx · blog/[slug]/page.tsx
│   │   │   ├── calculadora/page.tsx
│   │   │   ├── comparador/page.tsx
│   │   │   ├── favoritos/page.tsx
│   │   │   ├── contacto/page.tsx
│   │   │   ├── renting-empresas/page.tsx
│   │   │   ├── renting-autonomos/page.tsx
│   │   │   ├── sobre-nosotros/page.tsx
│   │   │   ├── aviso-legal/page.tsx          ← ⚠️ TEXTO PENDIENTE
│   │   │   ├── politica-privacidad/page.tsx  ← ⚠️ TEXTO PENDIENTE
│   │   │   └── politica-cookies/page.tsx
│   │   │
│   │   ├── admin/                 ← PANEL: login funciona, el resto son stubs
│   │   │   ├── login/page.tsx
│   │   │   └── (dashboard)/       ← vehiculos, modelos, marcas, leads,
│   │   │                             blog, seo, usuarios → todos "Fase 4"
│   │   └── api/
│   │       ├── leads/route.ts             ← recepción de formularios (JSON)
│   │       ├── revalidate/route.ts        ← refrescar la web tras cambiar catálogo
│   │       └── favorites/resolve/route.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         ← ★ EL MENÚ (mega-menú de marcas)
│   │   │   ├── Footer.tsx
│   │   │   └── WhatsAppButton.tsx ← ★ botón flotante de WhatsApp
│   │   ├── forms/LeadForm.tsx     ← ★ EL FORMULARIO
│   │   ├── vehicles/
│   │   │   ├── VehicleCard.tsx           ← tarjeta de coche
│   │   │   ├── VehicleGallery.tsx        ← galería de la ficha
│   │   │   ├── VehiclePricingTable.tsx   ← ★ tabla de cuotas plazo × km
│   │   │   ├── FavoriteButton.tsx · CompareButton.tsx
│   │   │   ├── ComparisonBar.tsx · FavoritosClient.tsx
│   │   ├── home/
│   │   │   ├── HeroVideo/Image/Content/Canvas.tsx
│   │   │   ├── LeadPopup.tsx      ← pop-up de captación
│   │   │   ├── FAQAccordion.tsx
│   │   │   └── CookieBanner.tsx
│   │   ├── ui/
│   │   │   ├── Reveal.tsx         ← animaciones de entrada al hacer scroll
│   │   │   ├── Parallax.tsx · VideoBackdrop.tsx
│   │   │   └── Button.tsx · Container.tsx · Logo.tsx
│   │   ├── seo/JsonLd.tsx         ← 8 tipos de datos estructurados
│   │   ├── catalog/BrandCard.tsx
│   │   ├── calculator/RentingCalculator.tsx
│   │   └── blog/Markdown.tsx      ← renderizador de Markdown propio
│   │
│   ├── lib/
│   │   ├── constants.ts           ← ★ CONTACTO, WhatsApp, etiquetas de enums
│   │   ├── brand.ts               ← ★ marca según el dominio
│   │   ├── metadata.ts            ← ★ pageMetadata() — úsalo en TODA página nueva
│   │   ├── utils.ts               ← formatPriceFromCents()
│   │   ├── brand-logos.ts         ← logo de marca por nombre
│   │   ├── auth.ts                ← requireRole() del panel
│   │   ├── data/                  ← ★ CAPA DE DATOS (server-only)
│   │   │   ├── vehicles.ts        ← ★ todas las consultas de coches
│   │   │   ├── blog.ts
│   │   │   └── landing.ts
│   │   ├── supabase/              ← server.ts · client.ts · admin.ts · middleware.ts
│   │   ├── actions/leads.ts       ← ★ createLead(): qué pasa al enviar el formulario
│   │   ├── notifications/         ← web3forms.ts · telegram.ts · types.ts
│   │   └── validations/lead.ts    ← esquema zod del formulario
│   │
│   ├── hooks/                     ← useFavorites · useComparison · useLocalStorageIds
│   ├── types/database.types.ts    ← tipos de la BD, ESCRITOS A MANO
│   └── scripts/                   ← ⚠️ 4 scripts Python heredados. Duplican /scripts
│
├── scripts/                       ← ★ ASÍ SE GESTIONA EL CATÁLOGO HOY
│   ├── add_vehicle.py             ← ★ alta/actualización de un coche
│   ├── ficha_a_sql.py             ← ★ genera SQL si no tienes credenciales
│   ├── fichas/*.json              ← ★ 20 fichas de coche en JSON
│   ├── _fichas_drive.py           ← genera JSON desde las láminas del Drive
│   ├── build-galleries.mjs · slice-photo-sheet.mjs · galerias_quecoche.py
│   ├── build-section-video.mjs · optimize-brand-logos.mjs
│   └── seed_db.py · generate-catalog-seed.mjs · upload_images.py
│
└── supabase/
    ├── migrations/
    │   ├── 0001_init.sql          ← ★ TODO EL ESQUEMA: 11 tablas y 8 enums
    │   ├── 0002_grants.sql        ← permisos de tabla (RLS NO los sustituye)
    │   ├── 0003_lead_fields.sql
    │   └── 0004_vehicle_detail_fields.sql   ← modelo de migración completa
    ├── alta_seat_leon.sql         ← ⚠️ PREPARADO Y SIN EJECUTAR
    ├── seed.sql · seed_catalog_real.sql
```

## 3.2 Dónde está cada cosa — respuestas directas

| Pregunta | Respuesta |
|---|---|
| **¿Dónde está la Home?** | `src/app/(public)/page.tsx` |
| **¿Dónde está el catálogo?** | `src/app/(public)/catalogo/page.tsx` |
| **¿Dónde se guardan los vehículos?** | **En la base de datos Supabase**, tabla `vehicles`. **No en el código.** |
| **¿Dónde se crean las fichas?** | La plantilla es `src/app/(public)/[slug]/page.tsx`. Los datos vienen de la BD. **No hay un archivo por coche.** |
| **¿Dónde se guardan las imágenes?** | `public/coches-nuevos/` (139 `.webp`). Se referencian como `/coches-nuevos/nombre.webp` |
| **¿Dónde se gestionan los precios?** | BD: `vehicles.monthly_price_cents` (precio principal) y `vehicle_pricing` (tabla plazo × km). **En céntimos.** |
| **¿Dónde se calcula el IVA?** | **En ningún sitio. No existe cálculo de IVA.** Ver §5.3 — es importante. |
| **¿Dónde están los componentes?** | `src/components/` |
| **¿Dónde está el menú?** | `src/components/layout/Header.tsx`, constante `NAV_LINKS` (líneas 17-25) |
| **¿Dónde están los formularios?** | `src/components/forms/LeadForm.tsx`; la lógica en `src/lib/actions/leads.ts` |
| **¿Dónde está WhatsApp?** | Botón: `src/components/layout/WhatsAppButton.tsx`. Enlaces: `buildWhatsAppLink()` en `src/lib/constants.ts` |
| **¿Dónde están los estilos?** | `src/app/globals.css` — **911 líneas, todo el sistema de diseño** |
| **¿Dónde está la configuración?** | `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs` |
| **¿Dónde están las variables de entorno?** | Plantilla en `.env.example`. Valores reales en `.env.local` (nunca se sube) y en Vercel |

---

# 4. ARQUITECTURA — LO QUE ROMPE PRODUCCIÓN SI LO HACES MAL

## 4.1 Los tres clientes de Supabase

Elegir mal **rompe producción**:

| Cliente | Cuándo usarlo |
|---|---|
| `createClient()` | Con cookies. **Solo** donde hace falta sesión de usuario (panel). |
| `createPublicClient()` | **Sin cookies.** Para contenido público igual para todos. |
| `createAdminClient()` | Service role, se salta RLS. **Solo servidor.** Hoy solo para insertar leads. |

**La trampa:** si usas el cliente con cookies en una página que tiene
`generateStaticParams`, producción revienta con *"Page changed from static to
dynamic at runtime"*.

## 4.2 La capa de datos nunca lanza

`src/lib/data/` es `server-only` y tiene una regla firme: **nunca lanza una
excepción**. Si Supabase no responde, devuelve `[]` o `null` y la página se
degrada. **No la caes.** Mantén esa disciplina en cualquier función nueva.

## 4.3 Las rutas

| Ruta | Archivo | Qué hace |
|---|---|---|
| `/` | `(public)/page.tsx` | Home, 11 secciones |
| `/catalogo` | `(public)/catalogo/page.tsx` | Filtros: `?brand=`, `?category=`, `?fuel=`, `?maxPrice=` |
| `/[slug]` | `(public)/[slug]/page.tsx` | **Catch-all**: ficha de modelo → si no, landing SEO → si no, 404 |
| `/blog`, `/blog/[slug]` | | Blog desde Supabase |
| `/calculadora`, `/comparador`, `/favoritos` | | Herramientas de cliente (`localStorage`) |
| `/admin/*` | | Panel. Login funciona; el resto son stubs |

**`[slug]` es un catch-all deliberado.** Un modelo **sin vehículos activos
devuelve 404**, no una página vacía. Se decidió así con el SEAT Arona y el Opel
Combo. No lo "arregles".

`src/middleware.ts` **solo cubre `/admin/:path*`** a propósito: la web pública no
debe depender de que exista un Supabase configurado para renderizar.

## 4.4 El esquema de la base de datos

Tablas: `profiles` · `brands` · `models` · `vehicles` · `vehicle_images` ·
`vehicle_pricing` · `leads` · `blog_posts` · `seo_metadata` · `landing_pages` ·
`redirects`.

Reglas que se han pagado caras y no se deben repetir:

- Los **enums viven en SQL** y sus etiquetas en `src/lib/constants.ts`: añadir un
  valor **obliga a tocar los dos sitios**.
- **RLS no sustituye al `GRANT`** de tabla (por eso existe `0002_grants.sql`).
  Toda tabla nueva necesita **las dos cosas**.
- `src/types/database.types.ts` está **escrito a mano** y no tiene
  `Relationships`. Por eso **no se usan los embeds de PostgREST**: marca y modelo
  se resuelven con dos consultas planas y un join en memoria
  (`attachModelsAndBrands`). No lo "modernices" sin regenerar los tipos.
- **No hay CLI de Supabase.** Las migraciones se aplican **pegándolas en el SQL
  Editor** del proyecto, en orden.

## 4.5 ⚠️ Hoy NO hay ISR en producción

Los archivos declaran `export const revalidate = 3600 / 1800 / 900`, pero
**ninguna página se cachea**. Verificado el 01/09/2026, dos peticiones seguidas:

```
GET https://movilease.es/renting-seat-ibiza
  → x-vercel-cache: MISS  (las dos veces)
  → cache-control: private, no-cache, no-store, max-age=0, must-revalidate
```

**Cada visita ejecuta el render completo y sus consultas a Supabase.**

Dos causas independientes, ambas comprobadas experimentalmente:

1. `src/app/layout.tsx` → `generateMetadata()` llama a `getCurrentBrand()`, que
   lee `headers()`. Es una API dinámica en el layout raíz: **arrastra a todas
   las rutas**.
2. `src/app/(public)/layout.tsx` y `Footer.tsx` llaman a `getVehiclesByBrand()`,
   que va por `createClient()` **con cookies**. Dinamiza **todas las rutas
   públicas** por su cuenta.

**Las dos causas son suficientes por separado**, así que arreglar solo una no
cambia nada.

> **No lo arregles por tu cuenta.** Es una mejora grande de rendimiento pero de
> riesgo medio, y toca el mecanismo multimarca. **Propónselo a Adrián primero.**

---

# 5. MOVILEASE — CÓMO FUNCIONA

## 5.1 Qué es

Renting de coches para **particulares, autónomos y empresas**. Sin entrada, con
seguro a todo riesgo, mantenimiento e impuestos incluidos. Gestión en 48 h.

**Contacto — fuente única de verdad, `src/lib/constants.ts`:**

- WhatsApp / teléfono: **+34 644 15 67 97** (`34644156797`)
- Email: **contacto@movilease.es**
- Instagram: **@quierorenting**

**Nunca escribas un teléfono o un email a mano en un componente.** Importa
`CONTACT` y `buildWhatsAppLink()` de `constants.ts`.

## 5.2 Las secciones de la Home

`src/app/(public)/page.tsx` — 910 líneas, 11 secciones en este orden:

1. **Hero** a pantalla completa, con vídeo de fondo
2. Barra de **estadísticas** (`STATS`)
3. **Marquesina de marcas** (`MARQUEE_BRANDS`)
4. **`#ofertas`** — coches con `is_offer = true`
5. **`#marcas`** — rejilla de marcas del catálogo
6. **`#catalogo`** — destacados (`is_featured = true`)
7. **`#por-que`** — argumentos de venta
8. **`#incluido`** — qué incluye la cuota (`INCLUDED`)
9. **Comparativa** renting vs. compra (`COMPARISON`)
10. **Testimonios** (`TESTIMONIALS`)
11. **`#faq`** (`FAQ_ITEMS`) y **`#solicitar`** — formulario de cierre

Los textos fijos están en **constantes al principio del archivo**
(`STATS`, `HOW_STEPS`, `INCLUDED`, `COMPARISON`, `TESTIMONIALS`, `FAQ_ITEMS`).
**Los precios NO salen del JSX: salen de la base de datos.**

## 5.3 ⚠️ EL IVA — dónde está y dónde NO está

**No hay ningún cálculo de IVA en el código.** Ni multiplicaciones, ni tipos, ni
constante de porcentaje. Buscado en todo `src/`, `scripts/` y `supabase/`.

Cómo funciona realmente:

- Los precios se guardan en `vehicles.monthly_price_cents` y
  `vehicle_pricing.monthly_price_cents` **en céntimos y ya con el IVA
  incluido**, tal como vienen en las láminas del proveedor.
- `formatPriceFromCents()` (`src/lib/utils.ts`) **solo formatea**, no calcula.
- La frase **"IVA incluido"** es **texto literal** en tres puntos de
  `src/app/(public)/[slug]/page.tsx`: bajo el precio del hero (~línea 389), en la
  cabecera de la tabla de cuotas (~436) y en la primera FAQ generada (~207).

**Consecuencia:** si algún día hay que mostrar precios **sin** IVA (típico en la
vertical de empresas), es un **cambio de modelo de datos**, no de formato:
haría falta una columna nueva o un tipo de IVA por vehículo.
**No lo improvises multiplicando por 1,21 en un componente.**

## 5.4 La ficha de coche

`src/app/(public)/[slug]/page.tsx`. Una ficha por **modelo**, no por versión. Si
un modelo tiene varias versiones, se muestran todas y **encabeza la que tiene
galería real** (aunque no sea la más barata); entre versiones igual de
completas, gana la más barata.

Bloques: hero con foto y precio → galería → especificaciones → equipamiento →
**tabla de cuotas plazo × kilometraje** → qué incluye → FAQ generada con datos
reales → otros modelos de la misma marca → formulario.

**La URL de la ficha es el `slug` del modelo**, con el formato
`renting-<marca>-<modelo>` (ej.: `renting-seat-ibiza`). Lo genera
`add_vehicle.py` automáticamente.

## 5.5 Formularios y leads

**Todos los formularios pasan por `createLead()`** en `src/lib/actions/leads.ts`:

1. Valida con **zod** (`src/lib/validations/lead.ts`).
2. **Honeypot**: si el campo trampa `website` viene relleno, se descarta en
   silencio devolviendo éxito falso al bot.
3. Inserta en la tabla `leads` con el cliente admin, guardando IP, user-agent y
   `page_url`.
4. Notifica **en paralelo** a **Web3Forms** (email) y **Telegram** (push), y
   marca `notified_web3forms` / `notified_telegram`.
5. Devuelve un enlace de **WhatsApp prerellenado**.

**Cualquier fallo devuelve un mensaje controlado invitando a WhatsApp, nunca un
500.** Mantén ese comportamiento.

Campos del formulario: `name`, `lastName`, `phone`, `email`, `company`,
`province`, `clientType`, `message`, `modelId`, `vehicleId`, `source`,
`pageUrl`, `rgpd` (obligatorio), `website` (honeypot).

## 5.6 CTAs — el embudo tiene tres salidas

1. **WhatsApp** con mensaje prerellenado y contextual (el de la ficha lleva
   marca, modelo, versión y cuota).
2. **Formulario** → base de datos + email + Telegram.
3. **Llamada** (`tel:`), en la ficha y en `/contacto`.

Puntos de captación: botón flotante de WhatsApp (todas las páginas), botón del
header, pop-up automático, formulario del cierre de la home, formulario de la
ficha, `/contacto`, `/renting-empresas`, `/renting-autonomos`, y el botón
"Lo quiero" de cada `VehicleCard`.

## 5.7 SEO

- **`src/lib/metadata.ts` → `pageMetadata({ title, description, path, images })`.
  ÚSALO EN TODA PÁGINA NUEVA.** Declarar `openGraph` a mano desactiva el
  descubrimiento de `app/opengraph-image.tsx`; por eso la imagen va explícita.
- `src/components/seo/JsonLd.tsx`: `Organization`, `WebSite`, `Faq`,
  `Breadcrumb`, `ItemList`, `VehicleModel`, `WebPage`, `Article`.
- `sitemap.ts`: rutas fijas + fichas + posts + vistas por marca. Si Supabase
  falla, sirve igualmente las estáticas. **Hoy publica ~123 direcciones.**
- `robots.ts` bloquea `/admin`, `/api/`, `/favoritos` y `/comparador` (los dos
  últimos dependen de `localStorage`: no hay nada que indexar).
- **Un origen nuevo de fotos hay que declararlo en `next.config.ts`**
  (`remotePatterns`), o Next se niega a optimizarlas.

## 5.8 Responsive

Móvil primero, con Tailwind. **Comprueba siempre a 375 px.** Hay una rama sin
fusionar (`fix/mobile-horizontal-overflow`) precisamente por un desbordamiento
horizontal: es el fallo más habitual de este proyecto.

---

# 6. QUIERO RENTING — CÓMO FUNCIONA

> **Lee esto antes de tocar nada de Quiero Renting.** No está en este
> repositorio y no es Next.js.

## 6.1 Qué es exactamente (verificado 01/09/2026)

| | quierorenting.es |
|---|---|
| Alojamiento | **Vercel**, ficheros estáticos (`x-vercel-cache: HIT`, `etag`, `last-modified`) |
| Tecnología | **HTML escrito a mano**, sin framework, sin build |
| Página principal | **1 archivo** de 133.382 bytes / 2.014 líneas |
| CSS y JS | **Todo inline**: 9 bloques `<script>`, 1 `<style>`, **ningún `.js` ni `.css` propio** |
| Páginas | **85** listadas en `sitemap.xml` |
| Repositorio | ⚠️ **NO CONFIRMADO** — ninguno conocido |
| `lastmod` del sitemap | **18/06/2026** — el contenido lleva congelado desde entonces |

Las 85 páginas se reparten así: la home, **6 landings de categoría**
(`/renting-suv/`, `/renting-hibrido/`, `/renting-electrico/`,
`/renting-furgoneta/`, `/renting-barato/`, `/renting-automatico/`),
**~67 landings de modelo** (`/renting-seat-ibiza/`, `/renting-mercedes-glc/`…) y
**12 landings de ciudad** (`/renting-coches-madrid/`, `-barcelona`, `-valencia`,
`-sevilla`, `-bilbao`, `-zaragoza`, `-malaga`, `-alicante`, `-murcia`,
`-valladolid`, `-palma`, `-las-palmas`).

## 6.2 Identidad visual — es DISTINTA de la de MoviLease

**No apliques los colores de MoviLease a Quiero Renting.** Su paleta, leída de
las variables CSS del propio HTML, es **verde**:

```
--green:   #16a34a      --green-d:  #15803d
--green-l: #dcfce7      --green-xl: #f0fdf4
--black:   #0a0a0a      --dark:     #111827
--gray:    #6b7280      --gray-l:   #9ca3af
--border:  #e5e7eb      --soft:     #f9fafb      --bg: #fff
```

`theme-color` de la página: **`#18a05a`**. Fondo blanco, no oscuro.

**Reclamo comercial:** *"desde 264 €/mes"*, *"sin entrada"*, *"+10.000 clientes
en toda España"*, *"gestión en 48 h"*.

## 6.3 Captación de leads

Un único formulario (`id="lp-form"`, función `lpSubmit`) que pide **nombre,
teléfono, email opcional y aceptación de privacidad**. Al enviarlo:

1. Manda el lead a **Web3Forms** por `fetch`.
2. Manda un aviso a **Telegram** con `new Image().src`.
3. Enseña una confirmación.

Además hay **5 enlaces `wa.me/34644156797`** repartidos por la página.

Email de contacto que aparece en la web: **quierorenting@outlook.es**.

## 6.4 🔴 PROBLEMA CRÍTICO DE SEGURIDAD

**El JavaScript inline lleva escritas EN CLARO la clave de Web3Forms y el token
del bot de Telegram con su chat id** (líneas ~1849-1851 del HTML servido).
Cualquiera que abra el código fuente de la página los ve. Confirmado el
01/09/2026: los tres son valores reales, no marcadores de posición.

**Qué hay que hacer:**

1. **Rotar las credenciales** (Adrián: @BotFather → `/revoke`; y regenerar la
   clave en web3forms.com). *Es una acción del propietario, tú no puedes hacerla.*
2. **Sacar los secretos del cliente.** La solución correcta es que ese formulario
   envíe a un endpoint del servidor, no directamente a Telegram desde el
   navegador.

**Nunca reproduzcas esos valores en un documento, un commit o un mensaje.**

## 6.5 Cómo se trabaja en esta web

Como no hay repositorio, el código se recupera descargándolo del propio dominio
(el HTML se sirve **sin minificar y con comentarios**, así que lo servido *es*
el fuente). Procedimiento completo en `docs/HANDOFF-MAESTRO.md` §2.5.

**Trampas del sistema estático:**

1. **Cada página lleva su propia copia del CSS.** No hay hoja compartida. Un
   cambio de estilo global toca ~85 archivos: **hazlo con un script**, nunca a
   mano, y verifica un par de páginas después.
2. **No hay build que te avise.** Un `</div>` de más no rompe nada en tu pantalla
   y sí en móvil. Abre la consola del navegador.
3. **Los datos están escritos a mano dentro del HTML.** Precios, modelos y FAQ no
   salen de ninguna base de datos: un dato que cambia hay que cambiarlo en todos
   los sitios donde aparezca, **incluido el JSON-LD**.
4. **El JSON-LD tiene que coincidir con lo visible.** Si el texto dice un precio
   y el JSON-LD dice otro, Google se queda con la discrepancia.
5. **No metas un framework para un cambio pequeño.** Convertirla a Next.js es un
   proyecto, no un arreglo. Si algún día se hace, que sea una decisión tomada a
   propósito.
6. **Vercel sirve la raíz tal cual**: el nombre de la carpeta es la URL.
   `renting-seat-ibiza/index.html` → `/renting-seat-ibiza/`.

## 6.6 Relación entre las dos marcas

MoviLease es **la marca nueva y premium**; QuieroRenting es **la marca de
captación anterior**, que sigue viva y sigue trayendo clientes. Comparten
teléfono de WhatsApp, proveedor de email de leads y bot de Telegram.

Si algún día se decide que quierorenting.es pase a servirse desde esta
aplicación, **el código ya está preparado** (`BRANDS` en `src/lib/brand.ts`):
haría falta apuntar el dominio al proyecto de Vercel de MoviLease y añadirlo
como dominio del proyecto. **Es una decisión de negocio con impacto en SEO —
consúltala antes.**

---

# 7. MANUAL DE MODIFICACIONES RÁPIDAS

> Todas las rutas son reales. **Todo esto es para MoviLease**, salvo donde se
> diga lo contrario.

## 7.1 AÑADIR UN COCHE NUEVO

**Los coches viven en la base de datos, NO en el código. No hace falta desplegar.**

**1. Crea la ficha JSON.** Copia `scripts/fichas/opel-corsa-gs.json` como
plantilla y guárdala en `scripts/fichas/<marca>-<modelo>-<version>.json`:

```json
{
  "brand": "Opel",
  "model": "Corsa",
  "version": "GS 1.2 100 CV",
  "category": "turismo",          // turismo · suv · hibrido · furgoneta · 4x4 · diesel
  "fuel_type": "gasolina",        // gasolina · hibrido · electrico · diesel · phev
  "transmission": "manual",       // manual · automatico
  "monthly_price_cents": 30300,   // 303,00 € — EN CÉNTIMOS, CON IVA INCLUIDO
  "contract_months": 60,
  "annual_km": 10000,             // ⚠️ PONLO SIEMPRE. Ver aviso abajo
  "horsepower": 100,
  "seats": 5,
  "doors": 5,
  "environmental_label": "c",     // 0 · eco · c · b
  "colors": ["Karbon Black", "Grafik Grey"],
  "body_type": "Hatchback",
  "included_services": ["Seguro a todo riesgo", "Mantenimiento y revisiones", "..."],
  "images": [
    { "url": "/coches-nuevos/opel-corsa-01.webp", "alt": "Opel Corsa en renting — vista exterior" }
  ],
  "pricing": [
    { "contract_months": 48, "annual_km": 10000, "monthly_price_cents": 31100 },
    { "contract_months": 60, "annual_km": 10000, "monthly_price_cents": 30300 }
  ]
}
```

> **⚠️ Pon SIEMPRE `annual_km` explícito.** `add_vehicle.py` y `ficha_a_sql.py`
> ponen **15.000** km por defecto, pero `RENTING_DEFAULTS` y todos los textos de
> la web dicen **10.000**. Un coche dado de alta sin ese campo quedará
> descuadrado respecto a lo que promete la web.

**2. Añade las fotos** en `public/coches-nuevos/`, en formato **`.webp`**,
nombradas `<marca>-<modelo>-01.webp`, `-02`, `-03`… La **primera es la
principal** (`main_image_url`). Herramientas: `scripts/slice-photo-sheet.mjs`
(trocea hojas de contacto) y `scripts/build-galleries.mjs` (escribe el bloque
`images` y separa exterior de interior).

**3. Publica el coche.** Dos vías:

```bash
# A) Con credenciales (la vía normal)
python scripts/add_vehicle.py scripts/fichas/<coche>.json

# B) Sin credenciales: genera SQL para pegar en el SQL Editor de Supabase
python scripts/ficha_a_sql.py scripts/fichas/<coche>.json
```

El script **crea la marca y el modelo si no existen**, genera el `slug`
(`renting-<marca>-<modelo>`), inserta el vehículo, sus cuotas y sus fotos.

**4. Refresca la web:**

```bash
curl -X POST https://movilease.es/api/revalidate \
  -H "x-revalidate-secret: <REVALIDATE_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"path":"/catalogo"}'
```

**5. Comprueba** que `https://movilease.es/renting-<marca>-<modelo>` responde 200
y que el coche sale en `/catalogo`.

**6. Commitea** la ficha JSON y las fotos (el alta en BD no queda en git, pero la
ficha sí, y es el registro de lo publicado).

## 7.2 MODIFICAR UN PRECIO

- **Archivo:** `scripts/fichas/<coche>.json`
- **Campos:** `monthly_price_cents` (el precio destacado) y el array `pricing`
  (la tabla plazo × km). **Siempre en céntimos**: 303,00 € → `30300`.
- **IVA:** **no se aplica nada automáticamente.** El número que escribes es el
  que se muestra. Escríbelo **con el IVA ya incluido** (§5.3).
- **Publicar:** añade `"update_vehicle_id": "<uuid del vehículo>"` al principio
  del JSON y ejecuta `add_vehicle.py`. Así **actualiza sin tocar la URL ya
  publicada**.
- **Regla innegociable:** **nunca escribas una cuota de 0 €.** En las láminas del
  proveedor el 0 significa *"ese kilometraje no se ofrece"*; publicarlo sería
  anunciar un renting gratis.
- **Comprobar:** recarga la ficha y mira el precio del hero **y** la tabla de
  cuotas. Si no cambia, falta revalidar.

## 7.3 CREAR UNA FICHA NUEVA

No se crea un archivo: **se crea un coche** (§7.1). La plantilla
`src/app/(public)/[slug]/page.tsx` la genera sola.

- **Componentes que usa:** `VehicleGallery`, `VehiclePricingTable`, `LeadForm`,
  `FaqJsonLd`, `VehicleModelJsonLd`, `BreadcrumbJsonLd`.
- **URL:** el `slug` del modelo, `renting-<marca>-<modelo>`, generado por el
  script.
- **Imágenes:** array `images` de la ficha JSON → tabla `vehicle_images`.
- **Comprobar:** la URL debe responder 200. Si da **404**, el modelo no tiene
  vehículos con `is_active = true` — es el comportamiento correcto, no un bug.

## 7.4 AÑADIR UNA OFERTA

Pon `"is_offer": true` en la ficha JSON y actualiza el coche. Aparecerá en la
sección **`#ofertas`** de la home, ordenado por precio. Con `"badge_text"` le
pones la etiqueta ("Oferta del mes"). Para los destacados de `#catalogo`, usa
`"is_featured": true`.

## 7.5 MODIFICAR LA HOME

- **Archivo:** `src/app/(public)/page.tsx`
- **Textos fijos:** en las constantes del principio (`STATS`, `INCLUDED`,
  `COMPARISON`, `TESTIMONIALS`, `FAQ_ITEMS`, `HOW_STEPS`).
- **Riesgos:** los precios **no están en el JSX**, salen de la BD; cambiar el
  orden de las secciones cambia el ritmo de fondos claro/oscuro (§8.2); tocar el
  hero afecta al LCP, que es la métrica más visible de la web.
- **Probar:** `npm run dev`, mirar a **375 px** y a escritorio, y comprobar que
  las animaciones de entrada (`Reveal`) siguen disparando.

## 7.6 AÑADIR UNA SECCIÓN NUEVA

Sigue el patrón que ya usan todas:

```tsx
<section className="surface-graphite section-y relative overflow-hidden">
  <Container>
    <Reveal>
      <div className="section-head">
        <p className="section-label">Etiqueta</p>
        <h2 className="display-md">Titular</h2>
      </div>
    </Reveal>
    {/* contenido */}
  </Container>
</section>
```

**Alterna fondo claro y oscuro** respecto a las secciones vecinas. Clases de
superficie disponibles: `.surface-black`, `.surface-dark`, `.surface-graphite`,
`.surface-carbon`, `.card-dark`, `.glass`, `.bg-texture-light/dark`.

## 7.7 MODIFICAR EL MENÚ

- **Archivo:** `src/components/layout/Header.tsx`, constante **`NAV_LINKS`**
  (líneas 17-25).
- Añade `{ href: "/nueva-pagina", label: "Nueva" }`.
- El menú **móvil y el de escritorio salen del mismo array**: no hay que tocar
  dos sitios.
- El **mega-menú de marcas** cuelga de `/catalogo` y se rellena solo con las
  marcas del catálogo.
- Añade también el enlace en `src/components/layout/Footer.tsx` si procede.

## 7.8 CREAR UNA PÁGINA NUEVA

1. Crea `src/app/(public)/<ruta>/page.tsx`.
2. **Exporta metadatos con `pageMetadata()`** de `src/lib/metadata.ts`. No los
   escribas a mano.
3. Añádela a `src/app/sitemap.ts` (array `staticEntries`).
4. Enlázala desde `Header` (`NAV_LINKS`) y/o `Footer`.
5. Usa `Container`, `Reveal` y las clases de `globals.css`.

## 7.9 CAMBIAR IMÁGENES

- **Fotos de coche:** `public/coches-nuevos/`, formato **`.webp`**. Se
  referencian como `/coches-nuevos/nombre.webp` (ruta absoluta desde la raíz).
  Para cambiar la galería de un coche hay que actualizar el array `images` de su
  ficha JSON y volver a ejecutar el script.
- **Fondos de sección:** `public/*-bg.webp`.
- **Logos de marca:** `public/brands/`, a 240 px
  (`scripts/optimize-brand-logos.mjs`). La extensión de cada marca está mapeada
  en `src/lib/brand-logos.ts` — **si añades un logo, añade ahí su entrada**.
- **Formato recomendado:** **WebP**. Next sirve **AVIF primero** y WebP después
  (`next.config.ts`); en fotos de coche AVIF baja un 20-30 % respecto a WebP.
- Usa siempre `next/image`, nunca `<img>`.
- **Un origen externo nuevo hay que declararlo en `next.config.ts` →
  `remotePatterns`**, o Next se niega a optimizarlo. Hoy están autorizados
  `*.supabase.co/storage/v1/object/public/**` y `fotos.quecochemecompro.com`.

## 7.10 MODIFICAR FORMULARIOS

- **Componente:** `src/components/forms/LeadForm.tsx`
- **Lógica:** `src/lib/actions/leads.ts` → `createLead()`
- **Validación:** `src/lib/validations/lead.ts` (zod). **Un campo nuevo hay que
  añadirlo aquí, en el componente, en la acción y como columna en la tabla
  `leads`.** Los cuatro sitios.
- **Destino de los leads:** tabla `leads` de Supabase + email (Web3Forms) +
  Telegram.
- **No toques el campo `website`**: es el honeypot anti-spam.
- **No quites la casilla `rgpd`**: es obligatoria por ley.

## 7.11 CAMBIAR UN CTA

Los enlaces de WhatsApp se construyen **siempre** con
`buildWhatsAppLink("mensaje")` de `src/lib/constants.ts`, que se encarga de
codificar el texto. **Nunca escribas una URL `wa.me` a mano.** Para cambiar el
número, la variable es `NEXT_PUBLIC_WHATSAPP_NUMBER`, no el código.

## 7.12 PUBLICAR UN ARTÍCULO DE BLOG

Los artículos están en la tabla **`blog_posts`** de Supabase. Para que salga
publicado necesita `status = 'published'` **y** `published_at` con fecha. El
contenido es **Markdown**, renderizado por `src/components/blog/Markdown.tsx`
(renderizador propio: párrafos, encabezados, listas, citas, negrita, cursiva y
enlaces — **no interpreta HTML en bruto**).

---

# 8. REGLAS DE MOVILEASE — IDENTIDAD Y DISEÑO

## 8.1 Colores (definidos en `src/app/globals.css`)

| Token | Valor | Uso |
|---|---|---|
| `--blue` | **`#0068FF`** | Azul de marca. Botones, acentos |
| `--blue-light` | **`#5AA0FF`** | **Azul para TEXTO sobre fondo oscuro** |
| `--dark` | `#0B2A5E` | Azul oscuro base |
| `--dark-2/3/4` | `#10306B` · `#16407F` · `#2358B4` | Escala de superficies oscuras |
| `--ink` | `#0A0A0A` | Texto principal sobre claro |
| `--paper` | `#FFFFFF` | Fondo claro |
| `--whatsapp` | `#25D366` | Solo botones de WhatsApp |

> **Regla de contraste, no negociable:** para **texto** sobre fondo oscuro usa
> **`--blue-light` (#5AA0FF)**, nunca `#0068FF`. El azul de marca sobre el fondo
> oscuro se queda en **3,1:1** y no pasa AA; el claro llega a **5,6:1**.
>
> **Las decisiones de color llevan la ratio de contraste medida en el
> comentario. Mantén esa costumbre: esta web se ha ido midiendo, no estimando.**

**Texto sobre oscuro:** usa `--on-dark-1/2/3`. La jerarquía se hace **por tamaño
y peso, no bajando opacidades hasta lo ilegible.**

## 8.2 Tipografía y ritmo

- **Space Grotesk** para títulos, **Inter** para texto, cargadas con `next/font`.
  **Sin el peso 300** (no se usa).
- Clases: `.display-xl/lg/md/sm`, `.body-lg/md/sm`, `.section-label`, `.eyebrow`.
- Ritmo vertical: `.section-y`, `.section-y-sm`, `.section-head`.
- Botones: `.btn-primary/ghost/white/whatsapp` + `.btn-lg/sm/block`.

## 8.3 Movimiento

- Todo comparte `--easing-premium: cubic-bezier(.16, 1, .3, 1)` y anima **solo
  `transform` y `opacity`**.
- Componentes: `Reveal`, `RevealGroup`/`RevealItem`, `AnimatedCounter`,
  `Parallax`, `VideoBackdrop`.
- **`prefers-reduced-motion` está respetado en TODAS las animaciones. Si añades
  una, añade su excepción.**
- **`VideoBackdrop` no se simplifica.** Tiene `preload="none"`, las `<source>` no
  se montan hasta acercarse al viewport, el póster se pinta desde el primer
  render, y no descarga vídeo con *reduced motion* ni con ahorro de datos. Cada
  una de esas cosas está ahí por una razón.

## 8.4 Trampas conocidas del CSS

- **`.section-label` es CSS sin capa y GANA a las utilidades de Tailwind.** Un
  `text-[#0057D6]` **no le hace nada**. Por eso en la home hay un
  `style={{ color: "#0057D6" }}` inline. Si un color de etiqueta "no se aplica",
  es esto.
- `Container` / `Button` apenas se usan: la mayoría de secciones repiten
  `mx-auto max-w-7xl px-6 sm:px-10` y las clases `.btn-*`. **Sigue la convención
  mayoritaria del archivo que estés tocando; no unifiques por tu cuenta.**

## 8.5 Qué NO tocar sin autorización expresa

1. **El número de WhatsApp** y los datos de contacto de `constants.ts`.
2. **Los precios**, si no vienen de una lámina del proveedor. **La lámina manda
   sobre lo que diga cualquier web.**
3. **La frase "IVA incluido"** y el modelo de precios (§5.3).
4. **El honeypot `website`** y la casilla **`rgpd`** del formulario.
5. **El mecanismo multimarca** (`src/lib/brand.ts`) — toca los dos dominios.
6. **La redirección `www`** de `next.config.ts` — es SEO consolidado.
7. **Los `slug` de fichas ya publicadas** — son URLs indexadas por Google. Para
   actualizar un coche sin romper su URL existe `"update_vehicle_id"`.
8. **El comportamiento de 404** en modelos sin vehículos activos.
9. **`master`** — nunca push directo sin permiso.

---

# 9. REGLAS DE QUIERO RENTING

1. **NO está en este repositorio.** Antes de tocar nada, confirma en qué web
   estás trabajando.
2. **Su identidad es verde (`#16a34a`), no azul.** No le apliques los colores de
   MoviLease. Fondo blanco, no oscuro.
3. **Todo el CSS y el JS van inline en cada `.html`.** Un cambio global toca ~85
   archivos: **script, nunca a mano**.
4. **No hay build.** Nada te va a avisar de un error: abre el HTML en el
   navegador y mira la consola.
5. **Los datos están escritos a mano**, incluido el JSON-LD. Un precio que cambia
   hay que cambiarlo en todos los sitios donde aparezca, **y el JSON-LD tiene que
   coincidir con lo visible**.
6. **Landing nueva:** copia la más parecida, cambia el contenido, el `h1` y el
   JSON-LD, **y añádela a `sitemap.xml`**. No empieces de cero.
7. **No metas un framework para un cambio pequeño.**
8. 🔴 **Hay credenciales en claro en el HTML público** (§6.4). No las reproduzcas
   nunca, y si tocas ese formulario, aprovecha para sacarlas del cliente.
9. **Su contenido lleva congelado desde el 18/06/2026.** Si un dato parece
   desactualizado, probablemente lo esté: **pregunta antes de "corregirlo"**.
10. **El reclamo "desde 264 €/mes" y "+10.000 clientes"** son mensajes
    comerciales establecidos. No los cambies por tu cuenta.

---

# 10. ESTADO ACTUAL — QUÉ ESTÁ HECHO Y QUÉ NO

## ✅ Funcionando

- Home de 11 secciones con vídeos de fondo propios.
- Catálogo con filtros por marca, categoría, combustible y presupuesto.
- **74 fichas de modelo** publicadas, con galería, specs, tabla de cuotas, FAQ
  generada con datos reales y modelos hermanos.
- Blog con **9 artículos**.
- Calculadora, comparador (hasta 3 coches) y favoritos sobre `localStorage`.
- Captación completa: formulario + pop-up + WhatsApp + llamada, con honeypot y
  doble notificación.
- SEO técnico: canonicals, Open Graph, 8 tipos de JSON-LD, sitemap dinámico
  (~123 URLs), robots, verificación de Search Console.
- Accesibilidad: enlace "saltar al contenido", trampa de foco en el menú móvil,
  `aria-*`, contrastes medidos, `prefers-reduced-motion`.
- **`npm run lint` limpio y `npm run build` correcto** (verificado 01/09/2026).

## 🔄 A medio hacer

1. **El panel de administración es una fachada.** Las 8 páginas de
   `/admin/(dashboard)/` dicen literalmente *"— Fase 4"*. La seguridad por roles
   está cableada; el contenido no. **Cambiar un precio hoy es un script o SQL, no
   la web.**
2. **`landing_pages`, `seo_metadata` y `redirects`** existen y hay código que las
   lee, pero no hay forma de crearlas desde la web. ⚠️ NO CONFIRMADO si tienen
   filas.
3. **La ruta de ficha por versión (`/[modelo]/[version]`) no existe.**
4. **Multimarca a medio camino:** el código lo soporta, quierorenting.es no lo
   usa.

## ⏳ Pendiente (por orden de urgencia)

1. 🔴 **Rotar las credenciales expuestas de quierorenting.es** (§6.4).
2. 🔴 **Redactar las páginas legales.** `/aviso-legal` y `/politica-privacidad`
   siguen diciendo *"PENDIENTE: completar con los datos fiscales…"* (confirmado
   en producción el 01/09/2026). **El formulario pide consentimiento RGPD y
   enlaza a esa política vacía**: es cumplimiento, no cosmética. Hacen falta
   razón social, NIF y domicilio — ⚠️ NO CONFIRMADO, hay que pedírselos a Adrián.
3. 🟡 **Publicar el SEAT León.** Ficha, 7 fotos y `supabase/alta_seat_leon.sql`
   están listos y commiteados, pero **el SQL no se ha ejecutado**:
   `https://movilease.es/renting-seat-leon` devuelve **404** (confirmado
   01/09/2026). El SQL es idempotente: basta pegarlo en el SQL Editor y
   revalidar.
4. 🟡 **Instalar analítica.** Hoy **no hay ninguna** en movilease.es: ni GA4, ni
   GTM, ni Pixel (confirmado 01/09/2026). No se sabe cuántas visitas hay ni de
   dónde vienen.
5. 🟡 **Recuperar el ISR** (§4.5) — consultar antes.
6. ⚪ Personalizar el `README.md`, que sigue siendo el de `create-next-app`.

## 🐛 Bugs conocidos que conviene tener presentes

| # | Problema | Gravedad |
|---|---|---|
| 1 | **No hay ISR: todo se renderiza bajo demanda** (§4.5) | Alta |
| 2 | **Páginas legales vacías** con formulario que pide RGPD | Alta (cumplimiento) |
| 3 | **Cero analítica** | Alta (negocio) |
| 4 | **Credenciales en claro en quierorenting.es** | **Crítica** |
| 5 | `annual_km` por defecto: los scripts ponen **15.000**, la web promete **10.000**. **Pon siempre el campo.** | Media |
| 6 | Todos los formularios mandan `source: contact_form`, desaprovechando los 6 valores del enum: no se sabe de qué punto de la web entra cada lead | Baja |
| 7 | `src/scripts/` duplica `scripts/` — 4 archivos Python heredados dentro del árbol TypeScript. Candidatos a borrar, **preguntando antes** | Baja |
| 8 | El banner de cookies no gobierna ningún script (no hay ninguno que gobernar) | Baja |

La lista completa, con las de laponce.es y adridaganzo.com, está en
`docs/HANDOFF-MAESTRO.md` §14.

---

# 11. PROTOCOLO DE TRABAJO — CADA VEZ QUE TE PIDAN ALGO

1. **Entiende la petición.** ¿De qué web hablamos: MoviLease (este repo) o Quiero
   Renting (fuera)? ¿Es contenido (base de datos) o es código?
2. **Localiza los archivos afectados** antes de escribir nada. Usa §3.2.
3. **Analiza las dependencias**: quién más usa ese componente, esa clase CSS, esa
   columna.
4. **Revisa los impactos**: SEO, responsive, accesibilidad, rendimiento.
5. **Implementa el cambio mínimo necesario.** No refactorices de paso.
6. **Ejecuta `npm run lint` y `npm run build`.** Los dos, siempre.
7. **Comprueba el responsive a 375 px** si el cambio es visual.
8. **Míralo en el navegador** si puedes.
9. **No modifiques de más.**
10. **Explica qué has cambiado, por qué y cómo lo has verificado.**

**Y ante la duda sobre un dato de negocio — un precio, una fecha, un dato fiscal,
una cuenta — pregunta. No lo rellenes a ojo.**
