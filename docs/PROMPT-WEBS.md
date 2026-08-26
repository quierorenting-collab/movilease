# Prompt de continuidad — las cuatro webs

> **Cómo se usa:** abre una sesión nueva de Claude Code y di *"lee
> `docs/PROMPT-WEBS.md` entero antes de tocar nada"*, o pega el bloque de la
> web que vayas a modificar. Está escrito para que un Claude que no ha visto
> nunca estos proyectos pueda trabajar en cualquiera de los cuatro sin romper
> nada ni reinventar decisiones ya tomadas.
>
> Todo lo que hay aquí está verificado leyendo el código y las webs en
> producción (26/08/2026). Lo que no se ha podido comprobar se dice.

---

## 0. Mapa: cuatro webs, dos sistemas técnicos

No son cuatro proyectos parecidos. Son **dos mundos distintos** y conviene no
mezclarlos mentalmente:

| Web | Qué es | Sistema | Código |
|---|---|---|---|
| **movilease.es** | Renting de coches para particulares | **A** — Next.js + Supabase | Este repositorio |
| **quierorenting.es** | La misma aplicación con otra marca | **A** — se sirve por dominio | Este repositorio |
| **laponce.es** | Conciertos de música urbana en Oh My Club, Madrid | **B** — HTML estático | Fuera (§3) |
| **adridaganzo.com** | Portfolio que agrupa La Ponce, Hypeland, Quiero Renting, First Class Booking y VIP Concierge | **B** — HTML estático | Fuera (§3) |

**Sistema A** (§2): aplicación Next.js 15 con base de datos, panel, ISR y
build. Dos dominios sobre el mismo código.

**Sistema B** (§3): HTML escrito a mano, servido tal cual desde Vercel. Sin
framework, sin bundler, sin `npm install`, sin build. Todo el CSS y el JS van
**inline dentro de cada `.html`**.

Las cuatro comparten el mismo WhatsApp de contacto: **34613267375**.

---

## 1. Reglas de trabajo (para las cuatro)

1. **Comentarios en español y explicando el porqué**, nunca el qué. Todo el
   código del sistema A sigue esa norma. Imítala.
2. **Mensajes de commit en español**, sin prefijos tipo `feat:`, con cuerpo que
   explica el problema, la decisión y **cómo se verificó**. Mira `git log -5`.
3. **Verifica antes de commitear.** En el sistema A, `npm run lint` y
   `npm run build`. En el sistema B, abre el HTML en el navegador y comprueba
   la consola: no hay build que te avise de nada.
4. **Nada de secretos en el repo.** `.env.local` está en `.gitignore`.
5. **Rama de trabajo**: desarrolla y empuja sólo a la rama indicada. Nunca a
   `master` sin permiso explícito.
6. **No inventes**. Si no puedes comprobar algo (una cuenta, un dato de
   negocio, una fecha de evento), pregúntalo en vez de rellenarlo a ojo.

---

# SISTEMA A — movilease.es + quierorenting.es

## 2.1 Stack

- **Next.js 15.5 (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (`@import "tailwindcss"` + `@theme inline`, sin
  `tailwind.config.js`)
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`): base de datos, auth
  del panel y fotos
- **framer-motion 12**, **zod 4**, **`server-only`**
- Scripts auxiliares en **Python** (`requests`) y **Node** (`sharp`, `ffmpeg`)

Comandos: `npm run dev` · `npm run build` · `npm run start` · `npm run lint`

**Antes de escribir código**, dos cosas obligatorias:

- `AGENTS.md` avisa de que **este no es el Next.js que recuerdas**: lee la guía
  correspondiente en `node_modules/next/dist/docs/`. `cookies()`, `headers()` y
  `params` son **asíncronos**.
- En una sesión nueva **`node_modules` no existe**: `npm install` primero.

## 2.2 Dos dominios, una aplicación

`src/lib/brand.ts`:

```ts
BRANDS = { "movilease.es": {...}, "quierorenting.es": {...} }
resolveBrand(host)   // normaliza, quita www y puerto, cae en el default
getCurrentBrand()    // server-only, lee headers().get("host")
```

Comparten catálogo, base de datos y lógica; **sólo cambian nombre y
descripción** según el host. Una marca nueva se añade ahí y hereda el resto.
Donde no hay request de la que leer el host (sitemap, robots, panel) se usa
`DEFAULT_BRAND_NAME` / `SITE_URL` de `src/lib/constants.ts`.

`next.config.ts` redirige `www.movilease.es/*` → `movilease.es/*` con 301 en el
edge: había 200 en ambas y eso partía la señal de SEO.

## 2.3 Rutas

**Públicas** — `src/app/(public)/`:

| Ruta | Archivo | ISR |
|---|---|---|
| `/` | `page.tsx` (910 líneas, ~10 secciones) | 3600 s |
| `/catalogo` | filtros por marca, categoría y presupuesto | 900 s |
| `/[slug]` | ficha de modelo **o** landing SEO; 404 si no hay nada | 1800 s |
| `/blog`, `/blog/[slug]` | blog desde Supabase, con `generateStaticParams` | 1800 / 3600 s |
| `/calculadora`, `/comparador`, `/favoritos` | herramientas de cliente (localStorage) | — |
| `/renting-empresas`, `/renting-autonomos`, `/sobre-nosotros`, `/contacto` | landings | — |
| `/aviso-legal`, `/politica-privacidad`, `/politica-cookies` | legales | — |

`[slug]` es un catch-all deliberado: busca modelo con vehículos activos, si no
landing page, si no `notFound()`. Un modelo **sin vehículos activos devuelve
404**, no una página vacía (se decidió con el SEAT Arona y el Opel Combo).

**Panel** — `src/app/admin/`: login con Supabase Auth y un dashboard cuyas
páginas (`vehiculos`, `modelos`, `marcas`, `leads`, `blog`, `seo`, `usuarios`)
**son stubs a la espera de la "Fase 4"**. Cada una ya llama a `requireRole(...)`
con los roles correctos. Hoy el catálogo se gestiona con los scripts de §2.8.

**API**: `POST /api/leads` (envoltorio JSON de la server action),
`POST /api/revalidate` (protegida por `x-revalidate-secret`),
`/api/favorites/resolve`.

`src/middleware.ts` **sólo cubre `/admin/:path*`** a propósito: la web pública
no debe depender de que exista un Supabase configurado para renderizar.

## 2.4 Datos

Tres clientes Supabase, y elegir mal rompe producción:

- `createClient()` — con cookies. Sólo donde hace falta sesión.
- `createPublicClient()` — **sin cookies**, para contenido público idéntico
  para todos. Si usas el de cookies en una página con `generateStaticParams`,
  producción revienta con *"Page changed from static to dynamic at runtime"*.
- `createAdminClient()` — service role, se salta RLS. Sólo servidor, y hoy sólo
  para insertar leads.

Capa de datos en `src/lib/data/` (`vehicles.ts`, `blog.ts`, `landing.ts`), toda
`server-only`. Regla firme: **nunca lanza**. Si Supabase no responde devuelve
`[]` o `null` y la página se degrada, no se cae.

Detalle heredado: no se usan los embeds de PostgREST porque
`src/types/database.types.ts` está escrito a mano y no tiene `Relationships`.
Marca y modelo se resuelven con dos consultas planas y un join en memoria
(`attachModelsAndBrands`).

**Esquema** (`supabase/migrations/`): `profiles` · `brands` · `models` ·
`vehicles` · `vehicle_images` · `vehicle_pricing` · `leads` · `blog_posts` ·
`seo_metadata` · `landing_pages` · `redirects`.

- Los enums viven en SQL y sus etiquetas en `lib/constants.ts`: **añadir un
  valor obliga a tocar los dos sitios**.
- RLS activo en todas las tablas, con el helper `current_role_is(roles)`.
- **RLS no sustituye al `GRANT`** de tabla (por eso existe `0002_grants.sql`).
  Toda tabla nueva necesita las dos cosas.
- Triggers: `prevent_role_self_escalation` y `handle_new_auth_user` (crea el
  perfil con el rol más restrictivo).
- `vehicle_pricing` son las cuotas por plazo × kilometraje. Sin filas, la ficha
  cae al precio único de `vehicles.monthly_price_cents`. **Nunca se escribe una
  cuota de 0 €**: en las láminas el 0 significa "ese kilometraje no se ofrece",
  y publicarlo sería anunciar un renting gratis.

## 2.5 Diseño

Todo en **`src/app/globals.css`** (~900 líneas). No inventes estilos: casi
siempre ya existe la clase.

- **Color**: azul `#0068FF`, azul oscuro `#0B2A5E`. Para *texto* sobre fondo
  oscuro se usa `--blue-light: #5AA0FF`, porque el `#0068FF` sólo llega a 3,1:1
  y no pasa AA.
- **Texto sobre oscuro**: `--on-dark-1/2/3`. Jerarquía por tamaño y peso, **no
  bajando opacidades hasta lo ilegible**.
- **Superficies**: `.surface-black/dark/graphite/carbon`, `.card-dark`,
  `.glass`, `.glass-dark`, `.bg-texture-light/dark`.
- **Tipografía**: `.display-xl/lg/md/sm`, `.body-lg/md/sm`, `.section-label`,
  `.eyebrow`. **Space Grotesk** (display) e **Inter** (texto) por `next/font`,
  sin el peso 300 (no se usa).
- **Ritmo**: `.section-y`, `.section-y-sm`, `.section-head`.
- **Botones**: `.btn-primary/ghost/white/whatsapp` + `.btn-lg/sm/block`.
- **Movimiento**: todo comparte `--easing-premium: cubic-bezier(.16,1,.3,1)` y
  anima **sólo `transform` y `opacity`**. Componentes: `Reveal`,
  `RevealGroup`/`RevealItem`, `AnimatedCounter`, `Parallax`, `VideoBackdrop`.
- **`prefers-reduced-motion` está respetado en todas las animaciones.** Si
  añades una, añade su excepción.
- Las decisiones de color llevan la ratio de contraste medida en el comentario.
  Mantén esa costumbre: la web se ha ido midiendo, no estimando.

`VideoBackdrop`: `preload="none"`, las `<source>` no se montan hasta acercarse
al viewport, el póster se pinta desde el primer render, y no se descarga vídeo
con *reduced motion* ni con ahorro de datos. No lo simplifiques.

## 2.6 SEO

- `src/lib/metadata.ts` → `pageMetadata({ title, description, path, images })`.
  **Úsalo en toda página nueva.** Declarar `openGraph` a mano desactiva el
  descubrimiento de `app/opengraph-image.tsx`, por eso la imagen va explícita.
- `src/components/seo/JsonLd.tsx`: `Organization`, `WebSite`, `Faq`,
  `Breadcrumb`, `ItemList`, `VehicleModel`, `WebPage`, `Article`.
- `sitemap.ts`: rutas fijas + fichas + posts + vistas por marca; si Supabase
  falla, sirve igualmente las estáticas.
- `robots.ts` bloquea `/admin`, `/api/`, `/favoritos` y `/comparador` (los dos
  últimos dependen del localStorage: no hay nada que indexar).
- Las descripciones de ficha se arman con datos reales (cuota, nº de versiones)
  y se recortan a ~158 caracteres.
- Imágenes: AVIF primero, `qualities: [75, 92]`, caché de 30 días. Un origen
  nuevo de fotos hay que declararlo en `next.config.ts`.

## 2.7 Leads

`src/lib/actions/leads.ts` → `createLead(formData)`:

1. Valida con zod (`leadFormSchema`).
2. **Honeypot**: si `website` viene relleno, se descarta en silencio
   devolviendo éxito falso al bot.
3. Inserta con el cliente admin, guardando IP, user-agent y `page_url`.
4. Notifica en paralelo a **Web3Forms** y **Telegram**, y marca
   `notified_web3forms` / `notified_telegram`.
5. Devuelve un enlace de WhatsApp prerellenado.

**Cualquier fallo devuelve un mensaje controlado invitando a WhatsApp, nunca un
500.** Contacto: `contacto@movilease.es`, Instagram `@quierorenting`.

## 2.8 Scripts (así se gestiona hoy el catálogo)

Los de Python necesitan `scripts/_env.py` con `SUPABASE_URL` y `SERVICE_KEY`.

| Script | Para qué |
|---|---|
| `add_vehicle.py fichas/<coche>.json` | Alta o actualización completa de un coche. Con `"update_vehicle_id"` actualiza sin tocar la URL publicada. |
| `_fichas_drive.py` | Genera los JSON desde las láminas del Drive. **La lámina manda sobre lo que diga cualquier web.** |
| `slice-photo-sheet.mjs` | Trocea las hojas de contacto detectando las calles entre viñetas. |
| `build-galleries.mjs` | Escribe el bloque `images` y separa exterior de interior midiendo el fondo de estudio. |
| `galerias_quecoche.py [--aplicar]` | Rellena galerías desde quecochemecompro.com. **Por debajo del listón de parecido no toca el coche**: mejor una foto que las de otro modelo. |
| `build-section-video.mjs` | Convierte un clip de stock en fondo de sección (~1 MB) + póster. |
| `optimize-brand-logos.mjs` | Reescala los logos de marca a 240 px. |
| `seed_db.py`, `generate-catalog-seed.mjs`, `upload_images.py` | Siembra inicial desde el catálogo de quierorenting.es. |

El formato de ficha está en `scripts/fichas/*.json` (`opel-corsa-gs.json` sirve
de plantilla). El `EJEMPLO.json` que menciona el docstring no existe.

## 2.9 Entorno

Copia `.env.example` a `.env.local`. Públicas:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`. Sólo servidor:
`SUPABASE_SERVICE_ROLE_KEY`, `WEB3FORMS_API_KEY`, `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHAT_ID`, `REVALIDATE_SECRET`. Nada que no sea público lleva el
prefijo `NEXT_PUBLIC_`. Jamás.

## 2.10 Trampas conocidas

- `cookies()`, `headers()` y `params` son **asíncronos**.
- Cliente con cookies + `generateStaticParams` = 500 en producción.
- `.section-label` es CSS sin capa y **gana a las utilidades de Tailwind**: en
  la home hay un `style={{color}}` inline justo por eso.
- El panel no gestiona todavía el catálogo: "cambiar un precio" hoy es
  `add_vehicle.py` o SQL, no la web.
- El catálogo muestra **todos** los modelos, no doce: ya se corrigió una vez.
- Llegando desde la calculadora con presupuesto, el resultado va **antes** de
  las marcas.

---

# SISTEMA B — laponce.es + adridaganzo.com

## 3.1 Qué son exactamente

Comprobado el 26/08/2026 con cabeceras HTTP, DNS y el HTML servido:

| | laponce.es | adridaganzo.com |
|---|---|---|
| Alojamiento | **Vercel** (A → 76.76.21.21) | **Vercel** (igual) |
| Dominio | **DonDominio** | **DonDominio** |
| Tecnología | HTML estático a mano | HTML estático a mano |
| Páginas | **1** (105 KB, 1.334 líneas) | **~37** + versión inglesa |
| CSS y JS | Todo inline: 2 `<style>`, 3 `<script>` | Todo inline: home con 116 KB de CSS y 13 `<script>` |
| Ficheros `.js`/`.css` propios | **Ninguno** | **Ninguno** |
| `robots.txt` / `sitemap.xml` | No tiene ninguno | Tiene los dos |
| Analítica | **Ninguna** | GTM + Pixel, **sin configurar** (§3.6) |

**No son Next.js ni React.** No hay `/_next/`, ni bundle, ni compilación. El
HTML llega **sin minificar y con comentarios**, así que **lo que sirve el
dominio es el código fuente**.

## 3.2 Cómo recuperar el código (5 minutos)

Mientras no haya repositorio, esta es la vía. El resultado es editable y
desplegable tal cual:

```bash
# adridaganzo.com — el sitemap lista todas las páginas
mkdir -p adridaganzo && cd adridaganzo
curl -s https://adridaganzo.com/sitemap.xml \
  | grep -oE '<loc>[^<#]+</loc>' | sed 's|</\?loc>||g' | sort -u > urls.txt
while read -r u; do
  slug=$(echo "$u" | sed 's|https://adridaganzo.com/||; s|/$||')
  [ -z "$slug" ] && slug=index
  mkdir -p "$(dirname "$slug")"
  curl -s "$u" -o "$slug.html"
done < urls.txt
curl -s -O https://adridaganzo.com/robots.txt
curl -s -O https://adridaganzo.com/sitemap.xml
curl -s -O https://adridaganzo.com/manifest.json

# laponce.es — una sola página, más su carpeta de fotos
mkdir -p ../laponce/fotos && cd ../laponce
curl -s https://laponce.es/ -o index.html
grep -oE 'fotos/[a-z0-9._-]+\.(jpg|jpeg|png|webp)' index.html | sort -u \
  | while read -r f; do curl -s "https://laponce.es/$f" -o "$f"; done
```

Faltará por descargar lo que no esté enlazado en el HTML (iconos sueltos,
imágenes de OG). Compruébalo con la pestaña *Network* del navegador antes de
dar el volcado por bueno.

**Despliegue**: en Vercel, un proyecto de HTML estático no necesita
configuración: se conecta el repo y se sirve la raíz. Sin `package.json`, sin
comando de build.

## 3.3 laponce.es — anatomía

Página única con cuatro secciones: `#evento`, `#artistas`, `#galeria`,
`#nosotros`.

- **Paleta** (variables CSS al principio del `<style>`): `--dk #010C18`,
  `--teal #00E5B5`, `--ocean #0055BB`, `--sunset #FF6B35`, `--gold #FFBB3D`,
  más los cristales `--glass` / `--glass2`. Estética caribeña sobre fondo casi
  negro.
- **Tipografía**: Space Grotesk — la misma que MoviLease.
- **JavaScript** (todo a mano, sin librerías):
  - Fondo de partículas en `<canvas>` con `requestAnimationFrame`.
  - **Cuenta atrás** al próximo evento, sobre un array `EVENTS` **escrito a
    mano en el código**.
  - Lightbox de galería (`openLb` / `lbNav`).
  - Menú móvil (`openNav`).
  - Widget de chat **simulado** (`toggleChat`, `showTyping`, `sendQuick`,
    `sendMsg`): no habla con ningún servidor, escribe respuestas guionizadas.
- **Imágenes**: rutas relativas en `fotos/` — flyers por artista
  (`flyer-darell.jpg`, `flyer-brray.jpg`…) y `galeria-1..6.jpg`. El fondo del
  hero es una foto de **Unsplash enlazada en caliente**; conviene descargarla y
  servirla desde el dominio.
- **JSON-LD**: `MusicEvent`, `MusicGroup`, `MusicVenue`, `Offer`,
  `Organization`.
- **Salidas**: entradas por `fourvenues.com/adridaganzo`, la sala en
  `ohmyclub.es`, WhatsApp, Instagram y TikTok `@laponce.official`.

**Para publicar un evento nuevo hay que tocar cinco sitios del mismo archivo**:
el array `EVENTS`, el `<title>` y la meta description, el bloque JSON-LD
`MusicEvent`, el flyer en `fotos/` y el enlace de FourVenues. Es el cambio más
frecuente de esta web y el más fácil de dejar a medias.

## 3.4 adridaganzo.com — anatomía

Portfolio con **una home enorme** (211 KB, 2.973 líneas) y unas 35 landings de
SEO local.

- **Home**, secciones: `#quien`, `#proyectos`, `#ponce`, `#hypeland`,
  `#renting`, `#firstclass`, `#vip`, `#info`, `#contacto`.
- **Un color por marca**, en variables CSS: `--ponce #ff2d75`,
  `--hype #00d4ff`, `--renting #22ff88`, `--vip #a01838`, `--fc/--gold
  #c8a96e`, sobre `--black #080808` y `--white #f2ede4`. Hay además un juego
  `--lux-*` para las zonas premium. **Respeta el color de cada marca**: es lo
  que hace legible la página.
- **Tipografía**: Bebas Neue (titulares), Barlow y Barlow Condensed (texto),
  DM Mono (detalles), Playfair Display en cursiva (acentos).
- **Landings de SEO** (`/discotecas-madrid/`, `/despedida-soltero-madrid/`,
  `/fiesta-perreo-madrid/`, `/reggaeton-madrid/`, `/entradas/`,
  `/reservados/`…): todas siguen el mismo patrón — `hero` + secciones con
  `h2.section-head` + `cta-bottom`, y JSON-LD de `Article`,
  `BreadcrumbList`, `FAQPage` e `ItemList`. Para crear una nueva, **copia la
  más parecida y cambia el contenido**; no empieces de cero.
- **JSON-LD de la home**, muy completo: `LocalBusiness`, `EventSeries`,
  `FAQPage`, cinco `Service` (uno por marca), `Person`, `MusicGroup`,
  `Organization`, `WebSite`, `OpeningHoursSpecification`.
- **`/en/`** es un *stub* de 9 KB con una sola sección, no una traducción de la
  home. Hay además landings inglesas sueltas (`/en/tickets/`,
  `/en/madrid-nightlife/`, `/en/luxury-car-rental-madrid/`…). Si te piden
  "traducir la web", ojo: hoy la versión inglesa es una fachada.
- **`robots.txt`** permite explícitamente a GPTBot y ChatGPT-User.
- **Captación**: un modal que aparece al 40 % de scroll o a los 25 s (`showLead`
  / `submitLead`, con `localStorage` para no repetirse) que **abre WhatsApp
  prerellenado** con nombre, email e interés.

## 3.5 Trampas del sistema B

1. **Cada página lleva su propia copia del CSS.** No hay hoja compartida. Un
   cambio de estilo global es un cambio en ~37 archivos: hazlo con un script,
   no a mano, y verifica un par de páginas después.
2. **No hay build que te avise.** Un `</div>` de más no rompe nada en tu
   pantalla y sí en móvil. Abre la consola del navegador.
3. **Los datos están escritos a mano dentro del HTML.** Eventos, artistas,
   precios y FAQ no salen de ninguna base de datos. Un dato que cambia hay que
   cambiarlo en todos los sitios donde aparezca, incluido el JSON-LD.
4. **El JSON-LD tiene que coincidir con lo visible.** Si el texto dice una
   fecha y el JSON-LD dice otra, Google se queda con la discrepancia.
5. **No metas un framework para un cambio pequeño.** Son webs de una tarde;
   convertirlas a Next.js es un proyecto, no un arreglo. Si algún día se hace,
   que sea una decisión tomada a propósito.
6. **Vercel sirve la raíz tal cual**: el nombre de la carpeta es la URL.
   `discotecas-madrid/index.html` → `/discotecas-madrid/`.

## 3.6 Problemas abiertos detectados (26/08/2026)

Encontrados al analizar el HTML en producción. No están arreglados:

1. **La cuenta atrás de laponce.es lleva dos meses muerta.** El array `EVENTS`
   termina el **24/06/2026**. Como no queda ninguna fecha futura, el código cae
   en `EVENTS[EVENTS.length-1]`, el `diff` sale negativo y el contador muestra
   **00:00:00:00** de forma permanente. Además el `<title>` sigue anunciando
   *"Darell · 24 Jun"* y el JSON-LD publica `MusicEvent` ya celebrados.
   *Arreglo mínimo*: actualizar `EVENTS`, título, meta y JSON-LD. *Arreglo
   bueno*: que cuando no haya fecha futura la sección muestre "próximamente" y
   el enlace a FourVenues, en vez de un contador a cero.
2. **El formulario de contacto de adridaganzo.com no envía nada.** Su
   `onsubmit` es literalmente `event.preventDefault(); alert('¡Gracias! Te
   respondo personalmente en menos de 24h.')`. El visitante ve un mensaje de
   éxito y **el mensaje se pierde**. El modal de captación sí funciona (abre
   WhatsApp), pero el formulario de la sección de contacto no. Es una fuga de
   clientes silenciosa.
3. **La analítica está sin configurar.** El píxel de Facebook se inicializa con
   `'0000000000000000'` y la etiqueta de Google con `G-XXXXXXXXXX`: los dos son
   marcadores de posición. No se está midiendo nada, y los eventos `Lead`,
   `Contact` e `InitiateCheckout` que el código dispara no llegan a ninguna
   parte.
4. **laponce.es no tiene `robots.txt` ni `sitemap.xml`**, y carga el fondo del
   hero desde Unsplash en caliente.

Antes de arreglar el punto 1 hay que preguntar las fechas reales: **no te las
inventes.**

---

## 4. El control de las cuatro webs

Son tres piezas independientes. Se pueden tener unas sin otras:

| Pieza | Sistema A | Sistema B |
|---|---|---|
| **Dominio** | movilease.es, quierorenting.es | laponce.es, adridaganzo.com — **DonDominio** |
| **Despliegue** | Vercel | Vercel |
| **Código** | Este repositorio | **Sin repositorio conocido** |

**El dominio es la palanca definitiva**: quien controla el DNS decide a dónde
apunta la web, pase lo que pase con lo demás.

Para el sistema B, comprobar en vercel.com si los proyectos están en una cuenta
propia o de un tercero, y en *Project → Settings → Git* si hay repositorio
conectado:

- **Hay repo** → pasarlo a la organización propia y autorizarlo para Claude.
- **No hay repo** → crearlo con el volcado de §3.2 y conectar el proyecto.
- **Cuenta ajena sin colaboración** → con el dominio en la mano, se crean
  proyectos nuevos y se repunta el DNS.

**Orden correcto: primero la cuenta, después el código.** Mientras otra persona
conserve acceso al proyecto de Vercel, puede volver a desplegar desde su copia
y pisar los cambios.

---

## 5. Encargos típicos, por sistema

**Sistema A**

- *Texto de la home* → `src/app/(public)/page.tsx`. Los precios salen de la
  base de datos, no del JSX.
- *Sección nueva* → `<section>` con clase de superficie + `.section-y` +
  `Container` + `Reveal` + `.section-head` + `.section-label` + `.display-md`.
- *Página nueva* → `src/app/(public)/<ruta>/page.tsx` con `pageMetadata`,
  entrada en `sitemap.ts` y enlace en `Header`/`Footer`.
- *Coche nuevo* → ficha JSON + `add_vehicle.py`, fotos, y revalidar.
- *Artículo* → tabla `blog_posts` (`status='published'` y `published_at`).
- *Marca o dominio nuevo* → `BRANDS` en `src/lib/brand.ts` + DNS.

**Sistema B**

- *Evento nuevo en La Ponce* → los cinco sitios del §3.3, en un solo archivo.
- *Landing de SEO nueva en adridaganzo* → copiar la más parecida, cambiar
  contenido, `h1`, JSON-LD, y **añadirla a `sitemap.xml`**.
- *Cambio de estilo global* → script sobre los ~37 archivos, nunca a mano.
- *Arreglar el formulario* → §3.6, punto 2. La forma más rápida y coherente con
  el resto del negocio es mandarlo a WhatsApp como hace el modal; la buena, un
  endpoint que además lo guarde.

---

## 6. Frase corta para arrancar una sesión

> Trabajas en el ecosistema de cuatro webs de Adri Daganzo. Lee
> `docs/PROMPT-WEBS.md` entero antes de tocar nada: hay **dos sistemas
> distintos** y conviene no mezclarlos. MoviLease y QuieroRenting son una app
> Next.js 15 con Supabase (lee también `AGENTS.md`, ejecuta `npm install`, y
> verifica con `npm run lint` y `npm run build`). La Ponce y adridaganzo.com
> son HTML estático servido desde Vercel, sin build, con todo el CSS y el JS
> inline. Sigue las convenciones del documento: comentarios en español
> explicando el porqué, y no inventes datos de negocio que no puedas
> comprobar. Mi encargo es: <describe aquí lo que quieres>.
