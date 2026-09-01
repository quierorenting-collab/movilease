# DOCUMENTO 1 — GUÍA DE MIGRACIÓN A UN NUEVO CLAUDE CODE

> **Para quién es esto:** para ti, Adrián, no para Claude. Está escrito para que
> puedas seguirlo sin saber programar.
>
> **Qué consigue:** que un Claude Code nuevo, con otra cuenta, pueda trabajar en
> movilease.es y quierorenting.es exactamente igual que el actual.
>
> **Todo lo que hay aquí está comprobado el 01/09/2026** contra el código, el
> repositorio de GitHub y las webs en producción. Lo que no se ha podido
> comprobar aparece marcado como **⚠️ NO CONFIRMADO — DEBO REVISARLO
> MANUALMENTE**, y no hay nada inventado.
>
> **Documento hermano:** `docs/CONTEXTO-MAESTRO.md` es el texto que hay que
> pegarle al Claude nuevo. Este de aquí son los accesos.

---

## LO PRIMERO: LAS TRES COSAS QUE DEBES ENTENDER ANTES DE EMPEZAR

### 1. Movilease y Quiero Renting NO son la misma web

Es el punto que más confusión causa y conviene tenerlo claro desde el principio:

| | movilease.es | quierorenting.es |
|---|---|---|
| **Qué es** | Aplicación Next.js con base de datos | **HTML estático escrito a mano** |
| **Código** | Repositorio `quierorenting-collab/movilease` | **No hay repositorio conocido** ⚠️ |
| **Cómo se cambia** | Editando el repositorio y haciendo push | Editando ficheros `.html` sueltos |
| **Catálogo** | 74 fichas en base de datos Supabase | ~85 páginas escritas a mano |

El código de Movilease **está preparado** para servir también la marca
QuieroRenting (`src/lib/brand.ts`), pero **hoy quierorenting.es no apunta a esa
aplicación**. Comprobado el 01/09/2026: `quierorenting.es/catalogo` devuelve
**404**, y sus cabeceras HTTP no llevan `x-powered-by: Next.js`.

**Consecuencia práctica:** si le dices al Claude nuevo *"cambia el precio en
Quiero Renting"*, no se toca el repositorio. Son dos trabajos distintos.

### 2. Lo que de verdad da el control son tres piezas separadas

Se pueden tener unas sin las otras, y **quien controla el dominio manda sobre
todo lo demás**:

| Pieza | Quién la controla hoy |
|---|---|
| **El dominio (DNS)** | ⚠️ NO CONFIRMADO — es lo primero que debes averiguar |
| **El hosting (Vercel)** | ⚠️ NO CONFIRMADO — a qué cuenta pertenece |
| **El código (GitHub)** | Cuenta `quierorenting-collab` (ver abajo) |

**Orden correcto: primero la cuenta, después el código.** Mientras otra persona
conserve acceso al proyecto de Vercel, puede volver a desplegar desde su copia y
pisar tus cambios.

### 3. Hay dos cosas urgentes que arreglar (detalle al final, §11)

- 🔴 **Credenciales al descubierto en quierorenting.es.**
- 🔴 **Páginas legales vacías** mientras el formulario pide consentimiento RGPD.

---

# PARTE 1 — INVENTARIO COMPLETO DE ACCESOS

## 1.1 Código y repositorios

### Repositorio principal (Movilease)

| Campo | Valor real |
|---|---|
| **URL** | https://github.com/quierorenting-collab/movilease |
| **Propietario** | `quierorenting-collab` — es una **cuenta de usuario** de GitHub, **no una organización** |
| **Creada** | 29/07/2026 |
| **Visibilidad** | 🔴 **PÚBLICO** — cualquiera puede leer el código (ver aviso en §11.7) |
| **Rama principal (producción)** | `master` |
| **Colaboradores** | **Solo uno**: `quierorenting-collab`, con rol *admin*. No hay nadie más con acceso. |
| **Lenguaje** | TypeScript |
| **Historia** | ~54 commits, del 29/07/2026 al 01/09/2026 |
| **Clonado con** | `https://github.com/quierorenting-collab/movilease.git` |

**Otras ramas que existen hoy** (ninguna fusionada en `master`):

| Rama | Qué contiene |
|---|---|
| `master` | **Producción.** Lo que está publicado. |
| `claude/migracion-nuevo-claude-code-8tzvme` | Esta migración (los documentos que estás leyendo). |
| `claude/project-handoff-master-doc-f9menb` | El documento de traspaso anterior. Ya rescatado en la rama de arriba. |
| `claude/movilease-add-remove-cars-vqwswd` | Trabajo de alta/baja de coches. |
| `claude/webs-prompt-movilease-laponce-4jqmqn` | Notas antiguas de las cuatro webs. |
| `feat/seo-jsonld-ga4-analytics` | Trabajo de SEO/analítica sin terminar. |
| `fix/mobile-horizontal-overflow` | Arreglo de móvil sin fusionar. |

**Cómo se conecta Claude Code al repositorio hoy:** Claude Code se autentica
como la cuenta de GitHub `quierorenting-collab` (es decir, **como el propietario
del repositorio**), a través del conector de GitHub de Claude. Por eso puede leer
y escribir sin pedir permisos extra.

**Qué permisos necesita el Claude nuevo:** lectura y escritura de contenido
(*Contents: read & write*) y de *Pull requests* sobre este repositorio. Con
permiso solo de lectura podrá explicarte el código pero **no podrá publicar
cambios**.

### Repositorios de las otras webs

| Web | Repositorio |
|---|---|
| quierorenting.es | ⚠️ **NO CONFIRMADO — DEBO REVISARLO MANUALMENTE.** No se conoce ninguno. El sitio se sirve como ficheros estáticos ya construidos. |
| laponce.es | ⚠️ **NO CONFIRMADO** — ninguno conocido |
| adridaganzo.com | ⚠️ **NO CONFIRMADO** — ninguno conocido |

Si no aparecen, el código se puede recuperar descargándolo del propio dominio:
el HTML se sirve **sin minificar y con comentarios**, así que lo que sirve la web
*es* el código fuente. El procedimiento exacto está en `docs/HANDOFF-MAESTRO.md`
§2.5.

## 1.2 Deployment y hosting

| Campo | Movilease | Quiero Renting |
|---|---|---|
| **Plataforma** | **Vercel** (confirmado por cabeceras `server: Vercel`, `x-vercel-id`) | **Vercel** (mismas cabeceras) |
| **Proyecto** | **`movilease`** — responde en https://movilease.vercel.app | ⚠️ **NO CONFIRMADO** — existe pero no se ha podido ver su nombre |
| **Cuenta / equipo** | ⚠️ **NO CONFIRMADO — DEBO REVISARLO MANUALMENTE** | ⚠️ **NO CONFIRMADO** |
| **Repositorio conectado** | `quierorenting-collab/movilease` (deducido: el `homepage` del repo es `movilease.vercel.app`) | ⚠️ **NO CONFIRMADO** — probablemente ninguno |
| **Rama que publica producción** | **`master`** | — |
| **¿Despliegue automático al hacer push?** | **Sí.** Push a `master` → Vercel construye y publica. Push a otra rama → *preview* con URL propia. | No aplica: son ficheros subidos, sin build |
| **Región observada** | `iad1` | `iad1` |

**Importante:** para **añadir un coche o cambiar un precio NO hace falta
desplegar**. Los coches están en la base de datos, no en el código. Solo se
despliega cuando se toca código.

## 1.3 Dominios

### movilease.es

| Campo | Valor |
|---|---|
| **DNS (registro A)** | `76.76.21.21` → **es una IP de Vercel** |
| **www** | `www.movilease.es` responde **308** y redirige a `movilease.es`. La redirección está escrita en el código (`next.config.ts`), no en el panel de Vercel. |
| **Plataforma conectada** | Vercel, proyecto `movilease` |
| **Dónde se gestiona el dominio (registrador)** | ⚠️ **NO CONFIRMADO — DEBO REVISARLO MANUALMENTE** |
| **Quién controla el DNS** | ⚠️ **NO CONFIRMADO** |

### quierorenting.es

| Campo | Valor |
|---|---|
| **DNS (registros A)** | `76.76.21.21`, `76.76.21.61`, `66.33.60.130` → **todas IPs de Vercel** |
| **Plataforma conectada** | Vercel, sirviendo HTML estático |
| **Dónde se gestiona el dominio (registrador)** | ⚠️ **NO CONFIRMADO — DEBO REVISARLO MANUALMENTE** |

> **Pista para localizar el registrador:** laponce.es y adridaganzo.com estaban
> en **DonDominio** (comprobado el 26/08/2026). Es razonable empezar buscando ahí
> también estos dos, pero **hay que confirmarlo**.

**Cómo comprobarlo tú mismo, sin ayuda técnica:** entra en
https://www.whois.com/whois/movilease.es y mira el campo *Registrar*. Repite con
`quierorenting.es`.

## 1.4 Bases de datos

Solo Movilease tiene base de datos. Quiero Renting no tiene ninguna: sus datos
están escritos a mano dentro del HTML.

| Campo | Valor |
|---|---|
| **Servicio** | **Supabase** (PostgreSQL gestionado) |
| **Para qué se usa** | Catálogo de coches, fotos, precios por plazo y kilometraje, leads del formulario, blog, usuarios del panel |
| **Proyecto / referencia** | ⚠️ **NO CONFIRMADO** — la URL vive en la variable `NEXT_PUBLIC_SUPABASE_URL`, que no está en el repositorio. **La verás en Vercel → Settings → Environment Variables.** |
| **Organización de Supabase** | ⚠️ **NO CONFIRMADO — DEBO REVISARLO MANUALMENTE** |
| **Cómo se conecta la web** | Con la librería `@supabase/ssr`, desde `src/lib/supabase/` |

**Tablas importantes** (definidas en `supabase/migrations/`):

| Tabla | Para qué sirve |
|---|---|
| `brands` | Marcas (SEAT, Volkswagen…) |
| `models` | Modelos. **Su `slug` es la URL de la ficha** (`renting-seat-ibiza`) |
| `vehicles` | Cada versión concreta de un coche, con su precio y sus características |
| `vehicle_pricing` | Cuotas por plazo × kilometraje (la tabla de precios de la ficha) |
| `vehicle_images` | Galería de fotos de cada coche |
| `leads` | **Los clientes que llegan por el formulario** |
| `blog_posts` | Artículos del blog |
| `profiles` | Usuarios del panel y su rol |
| `landing_pages`, `seo_metadata`, `redirects` | Existen y hay código que las lee, pero ⚠️ **NO CONFIRMADO** si tienen contenido |

**Cómo se gestiona el catálogo hoy:** el panel de administración
(`/admin`) **está a medias**: entra con usuario y contraseña, pero sus páginas
son plantillas vacías ("Fase 4"). **Hoy un coche se da de alta con un script o
pegando SQL en Supabase**, no desde la web. Esto es importante que lo sepas: no
es un fallo, es que esa parte no está construida.

## 1.5 APIs e integraciones

| # | Servicio | Para qué se usa | Dónde está en el proyecto | Qué tienes que conectar | Variables que necesita |
|---|---|---|---|---|---|
| 1 | **Supabase** | Base de datos, login del panel y almacenamiento | `src/lib/supabase/*`, `src/lib/data/*` | Cuenta de Supabase (el proyecto ya existe) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| 2 | **Web3Forms** | Enviarte **por email** cada cliente que rellena el formulario | `src/lib/notifications/web3forms.ts` | Cuenta en web3forms.com | `WEB3FORMS_API_KEY` |
| 3 | **Telegram Bot API** | Avisarte **al móvil al instante** de cada cliente nuevo | `src/lib/notifications/telegram.ts` | El bot ya existe (se creó con @BotFather) | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| 4 | **WhatsApp** (enlaces `wa.me`) | Canal principal de contacto. Botón flotante, botones de ficha, pop-up | `src/lib/constants.ts` → `buildWhatsAppLink()` | Nada que conectar: son enlaces | `NEXT_PUBLIC_WHATSAPP_NUMBER` (por defecto `34613267375`) |
| 5 | **Google Search Console** | Verificación de propiedad del dominio para SEO | `src/app/layout.tsx` (`verification.google`) | Tu cuenta de Google con la propiedad `movilease.es` | Ninguna (el código de verificación va escrito en el código) |
| 6 | **fotos.quecochemecompro.com** | CDN de fotos **heredada**, de un tercero. Algunas fichas antiguas cargan imágenes de ahí | Autorizada en `next.config.ts` → `remotePatterns` | ⚠️ **NO CONFIRMADO** si tienes control sobre ese dominio | Ninguna |
| 7 | **Vercel** | Hosting y despliegue | — | Cuenta de Vercel | Todas las de arriba, cargadas en el panel |
| 8 | **API interna `/api/revalidate`** | Refrescar la web tras cambiar el catálogo, sin desplegar | `src/app/api/revalidate/route.ts` | Nada externo | `REVALIDATE_SECRET` (un valor que te inventas tú) |

### Integraciones que la gente suele dar por hechas y **NO existen**

| Servicio | Estado real |
|---|---|
| **Google Analytics / GA4** | 🔴 **NO instalado.** Comprobado el 01/09/2026 en movilease.es: no hay ni `gtag`, ni `googletagmanager`, ni ninguna etiqueta. |
| **Meta / Facebook Pixel** | 🔴 **NO instalado** en movilease.es. |
| **Google Tag Manager** | 🔴 **NO instalado** en movilease.es. |
| **CRM** | 🔴 **No hay.** Los leads se guardan en la tabla `leads` de Supabase y te llegan por email y Telegram. Nada más. |
| **Automatizaciones** (Zapier, Make…) | ⚠️ **NO CONFIRMADO** — no hay ni rastro en el código. |
| **Almacenamiento de imágenes en la nube** | Las fotos de coches están **dentro del repositorio**, en `public/coches-nuevos/` (139 archivos `.webp`). Supabase Storage está autorizado en la configuración pero hoy las fotos van por el repo. |
| **Banner de cookies** | Existe y guarda la preferencia, pero **no gobierna ningún script**, porque no hay scripts de terceros que activar. |

> **Consecuencia de negocio:** hoy **no sabes cuánta gente visita la web ni de
> dónde viene**. Es el hueco más grande del proyecto y es una decisión tuya, no
> técnica. Ver §11.6.

## 1.6 Variables de entorno — las nueve

Plantilla en `.env.example` (está en el repositorio, **sin valores**). Los
valores reales viven **solo en Vercel** y en el `.env.local` de tu ordenador,
que nunca se sube.

| Variable | Para qué sirve | ¿Obligatoria? | Dónde configurarla |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Dirección de la base de datos | **Sí** — sin ella el catálogo sale vacío | Vercel + `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de lectura | **Sí** | Vercel + `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de administración. **Se salta todas las protecciones** | **Sí** para que funcione el formulario | Vercel + `.env.local` |
| `NEXT_PUBLIC_SITE_URL` | Dirección oficial del sitio | No (por defecto `https://movilease.es`) | Vercel |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp | No (por defecto `34613267375`) | Vercel |
| `WEB3FORMS_API_KEY` | Email de aviso de lead | No | Vercel |
| `TELEGRAM_BOT_TOKEN` | Aviso de lead por Telegram | No | Vercel |
| `TELEGRAM_CHAT_ID` | A qué chat de Telegram avisar | No | Vercel |
| `REVALIDATE_SECRET` | Contraseña del botón de "refrescar la web" | No | Vercel |

> **Regla de oro:** las que empiezan por `NEXT_PUBLIC_` **acaban dentro de la web
> y las puede leer cualquiera**. Las otras cuatro no deben salir nunca del
> servidor. Si alguna vez ves `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`, es un
> error grave.

---

# PARTE 2 — GUÍA DE MIGRACIÓN PASO A PASO

> Tiempo estimado: **45–60 minutos**, más lo que tardes en localizar las cuentas
> de Vercel y del dominio.
>
> Haz los pasos **en este orden**. Están ordenados de forma que si te atascas en
> uno, lo anterior ya te sirve.

## PASO 0 — Antes de nada: reúne las llaves

No abras el Claude nuevo todavía. Primero comprueba que **puedes entrar tú** en
estos cinco sitios. Si no puedes entrar tú, el Claude nuevo tampoco podrá.

| # | Sitio | Qué comprobar | ¿Lo tengo? |
|---|---|---|---|
| 1 | https://github.com/login | Que entras con la cuenta **`quierorenting-collab`** | ☐ |
| 2 | https://vercel.com/login | Que ves un proyecto llamado **`movilease`** | ☐ |
| 3 | https://supabase.com/dashboard | Que ves el proyecto de la base de datos | ☐ |
| 4 | El panel de tu registrador de dominios | Que ves `movilease.es` y `quierorenting.es` | ☐ |
| 5 | https://web3forms.com | Que ves la clave de los formularios | ☐ |

> **Si no puedes entrar en la cuenta de GitHub `quierorenting-collab`:** es el
> paso más crítico de toda la migración, porque **es la cuenta propietaria del
> código**. Recupérala en https://github.com/password_reset con el correo con el
> que se creó. Si la creó otra persona, pídesela **antes de seguir**.

## PASO 1 — Dale al nuevo Claude acceso al código

Tienes **dos caminos**. El A es más rápido; el B es más limpio a largo plazo.

### Camino A — Reutilizar la cuenta `quierorenting-collab` (recomendado si tienes su contraseña)

1. Abre el **Claude Code nuevo**.
2. Ve a la configuración de conectores:
   **https://claude.ai/customize/connectors** → **GitHub** → *Conectar*.
3. Cuando GitHub te pida iniciar sesión, **entra con la cuenta
   `quierorenting-collab`** (no con tu cuenta personal).
4. En la pantalla de permisos de GitHub, elige **"Only select repositories"** y
   marca **`quierorenting-collab/movilease`**.
5. Concede los permisos: **Contents (read & write)** y **Pull requests
   (read & write)**.

### Camino B — Invitar a tu cuenta personal de GitHub como colaboradora

Úsalo si prefieres trabajar desde tu cuenta habitual.

1. Entra en GitHub **como `quierorenting-collab`**.
2. Ve a
   **https://github.com/quierorenting-collab/movilease/settings/access**
3. Pulsa **"Add people"**, escribe tu cuenta personal de GitHub y dale el rol
   **Write** (o **Admin** si quieres poder cambiar ajustes del repositorio).
4. Acepta la invitación desde tu cuenta personal (te llega por email).
5. Ahora conecta el Claude nuevo con **tu cuenta personal**, siguiendo los pasos
   2–5 del Camino A.

> **Ojo con el Camino B:** la cuenta `quierorenting-collab` sigue siendo la
> **propietaria**. Si algún día quieres que el dueño sea tu cuenta personal,
> hay que hacer una *transferencia de repositorio*
> (Settings → General → Transfer ownership). **No la hagas ahora**: cambiaría la
> URL del repositorio y hay que reconectar Vercel después.

### Cómo comprobar que el PASO 1 ha funcionado

Escribe esto en el Claude nuevo:

```
Lee el archivo docs/CONTEXTO-MAESTRO.md del repositorio
quierorenting-collab/movilease y dime en dos frases qué es este proyecto.
```

**Debe responder** que es una web de renting en Next.js 15 con Supabase, y
mencionar que quierorenting.es es una web estática aparte. Si dice que no puede
acceder al repositorio, vuelve al paso 1.

## PASO 2 — Dale el contexto

Este paso es el que hace que **no tengas que explicarle nada**.

1. Abre `docs/CONTEXTO-MAESTRO.md` (está en el repositorio, en la carpeta
   `docs/`).
2. **Cópialo entero y pégalo** en la primera conversación del Claude nuevo.
3. A partir de ahí ya puedes pedirle cosas con normalidad.

> **Truco para no repetirlo cada vez:** dile
> *"guarda esto como instrucciones permanentes del proyecto"*, o pídele que lo
> copie al archivo `CLAUDE.md` del repositorio. Ese archivo lo lee **solo**, sin
> que tengas que pegar nada, al abrir cualquier sesión nueva.

## PASO 3 — Conecta el hosting (Vercel)

**El Claude nuevo no necesita acceso a Vercel para trabajar.** Le basta GitHub:
hace push y Vercel publica solo. Pero **tú sí necesitas entrar en Vercel** para
las variables de entorno y para ver si un despliegue ha fallado.

1. Entra en https://vercel.com y busca el proyecto **`movilease`**.
2. Comprueba en **Settings → Git** que está conectado a
   `quierorenting-collab/movilease` y que la *Production Branch* es **`master`**.
3. Ve a **Settings → Environment Variables** y comprueba que están **las nueve**
   de la tabla de §1.6, marcadas para **Production**.
4. Aprovecha y **cópialas a un gestor de contraseñas**. Son la única copia que
   existe fuera de Vercel.

> **⚠️ Si el proyecto de Vercel NO aparece en tu cuenta**, está en la cuenta de
> otra persona. Ve directo a §11.2: es un problema de propiedad, no técnico.

## PASO 4 — Comprueba que el proyecto arranca

Puedes saltarte este paso si vas a trabajar solo desde el Claude Code en la nube.
Hazlo si quieres poder ver los cambios en tu ordenador antes de publicarlos.

Pídele al Claude nuevo:

```
Clona el repositorio, ejecuta npm install y luego npm run build.
Dime si compila sin errores.
```

**Resultado esperado** (verificado hoy, 01/09/2026): `npm run lint` sale limpio y
`npm run build` compila correctamente.

Para verlo en el navegador hace falta además el archivo `.env.local` con los
valores de Vercel. **Sin él la web arranca igual**, pero el catálogo sale vacío:
sirve para trabajar en diseño, no en contenido.

## PASO 5 — Haz un cambio de prueba de principio a fin

Este es el paso que demuestra que la migración ha salido bien. Pídele:

```
En la home (src/app/(public)/page.tsx), cambia el texto de la sección de
preguntas frecuentes: donde dice "¿Qué incluye la cuota mensual?" quiero que
diga "¿Qué incluye exactamente la cuota mensual?".

Ejecuta npm run lint y npm run build, y haz push a una rama nueva.
No toques master sin mi permiso.
```

Después comprueba, en este orden:

1. **En GitHub** → aparece una rama nueva con ese commit.
2. **En Vercel** → aparece un *Preview Deployment* con una URL propia. Ábrela y
   comprueba que el texto cambió.
3. Si te convence, dile: **"fusiona esa rama en master"**.
4. **En movilease.es** → a los 1–2 minutos, el cambio está en producción.

**Si los cuatro puntos funcionan, la migración está completa.**

## PASO 6 — Comprueba que los formularios siguen llegando

Entra en https://movilease.es/contacto y **envía el formulario con tus propios
datos**. Debes recibir:

1. Un **email** (vía Web3Forms).
2. Un **mensaje de Telegram**.
3. Y debe aparecer una fila nueva en la tabla `leads` de Supabase.

Si no llega nada, la causa casi siempre es una variable de entorno que falta en
Vercel (§1.6).

## PASO 7 — Comprueba los dominios

| Comprobación | Resultado esperado |
|---|---|
| https://movilease.es | Carga la web |
| https://www.movilease.es | Redirige a `movilease.es` |
| https://quierorenting.es | Carga la web estática (la verde) |
| https://movilease.es/sitemap.xml | Lista ~123 direcciones |

---

# PARTE 7 — CONFIGURACIÓN EXACTA PARA EL NUEVO CLAUDE CODE

## Tabla de servicios

| SERVICIO | PROYECTO / CUENTA / REPOSITORIO | PARA QUÉ SIRVE | ACCESO NECESARIO | ¿OBLIGATORIO? |
|---|---|---|---|---|
| **GitHub** | `quierorenting-collab/movilease` | Leer y modificar el código de movilease.es | Conector de GitHub en Claude, con *Contents: read & write* sobre ese repositorio | 🔴 **SÍ — sin esto no hay nada** |
| **Vercel** | Proyecto `movilease` | Publicar la web; guardar las variables de entorno | Tu cuenta de Vercel (**no** hace falta dársela a Claude) | 🔴 **SÍ, para ti** |
| **Supabase** | ⚠️ NO CONFIRMADO (verlo en Vercel) | Catálogo, precios, fotos, leads, blog | Tu cuenta de Supabase. Claude lo usa a través de las variables de entorno | 🔴 **SÍ** |
| **Dominio movilease.es** | ⚠️ Registrador NO CONFIRMADO | Que la web se vea en su dirección | Acceso al panel del registrador | 🔴 **SÍ, para ti** |
| **Dominio quierorenting.es** | ⚠️ Registrador NO CONFIRMADO | Ídem | Ídem | 🔴 **SÍ, para ti** |
| **Web3Forms** | web3forms.com | Recibir los leads por email | Tu cuenta; la clave va en Vercel | 🟡 Recomendable |
| **Telegram Bot** | Bot creado con @BotFather | Aviso instantáneo de lead al móvil | Token y chat id, en Vercel | 🟡 Recomendable |
| **Google Search Console** | Propiedad `movilease.es` | Ver cómo va el SEO | Tu cuenta de Google | 🟡 Recomendable |
| **quierorenting.es (ficheros)** | ⚠️ Proyecto de Vercel NO CONFIRMADO | Modificar la web estática | Acceso a ese proyecto de Vercel | 🟡 Solo si vas a tocar esa web |
| **fotos.quecochemecompro.com** | Tercero | CDN heredada de fotos | ⚠️ NO CONFIRMADO si tienes control | ⚪ No |
| **Google Analytics** | — | — | **NO EXISTE HOY** (§11.6) | ⚪ No |
| **CRM** | — | — | **NO EXISTE HOY** | ⚪ No |

## CHECKLIST DE MIGRACIÓN

Ve marcando. El orden importa.

**Acceso al código**
- [ ] Puedo entrar en la cuenta de GitHub `quierorenting-collab`
- [ ] Confirmo que el repositorio `quierorenting-collab/movilease` existe y lo veo
- [ ] GitHub conectado en el Claude Code nuevo
- [ ] El Claude nuevo puede **leer** un archivo del repositorio
- [ ] El Claude nuevo puede **crear una rama y hacer push**

**Contexto**
- [ ] He pegado `docs/CONTEXTO-MAESTRO.md` en el Claude nuevo
- [ ] (Opcional) Lo he guardado como `CLAUDE.md` para que lo lea solo

**Hosting**
- [ ] Entro en Vercel y **veo el proyecto `movilease`**
- [ ] Confirmo: repositorio conectado + rama de producción = `master`
- [ ] Las **9 variables de entorno** están cargadas en Production
- [ ] He copiado las 9 variables a un gestor de contraseñas

**Base de datos**
- [ ] Entro en Supabase y veo el proyecto
- [ ] Veo la tabla `vehicles` con coches dentro
- [ ] Veo la tabla `leads` con clientes dentro

**Dominios**
- [ ] Sé **quién es el registrador** de movilease.es y puedo entrar
- [ ] Sé **quién es el registrador** de quierorenting.es y puedo entrar
- [ ] movilease.es carga · www redirige · quierorenting.es carga

**Proyecto en marcha**
- [ ] `npm install` funciona
- [ ] `npm run build` compila sin errores
- [ ] (Opcional) `.env.local` creado y el catálogo se ve en local

**Prueba de fuego**
- [ ] Cambio de prueba hecho en una rama
- [ ] *Preview* de Vercel visto y correcto
- [ ] Fusionado a `master`
- [ ] **El cambio se ve en movilease.es**
- [ ] Formulario probado: llega el email, llega el Telegram, aparece en `leads`

**Urgencias pendientes** (no bloquean la migración, pero no las dejes)
- [ ] 🔴 Rotadas las credenciales expuestas de quierorenting.es (§11.1)
- [ ] 🔴 Páginas legales redactadas (§11.5)
- [ ] 🟡 Decidido si se instala analítica (§11.6)
- [ ] 🟡 Publicado el SEAT León, que está preparado y sin publicar (§11.4)

---

# PARTE 11 — ACCIONES QUE DEBE REALIZAR EL PROPIETARIO

> Esto es lo que **ningún Claude puede hacer por ti**, ni el actual ni el nuevo:
> requiere entrar en cuentas con tu identidad.

## 11.1 🔴 URGENTE — Rotar las credenciales expuestas de quierorenting.es

**Qué pasa:** el JavaScript de quierorenting.es lleva escritas **en claro** la
clave de Web3Forms y el **token del bot de Telegram con su chat id**. Están a la
vista de cualquiera que abra el código fuente de la página. Confirmado hoy,
01/09/2026. *(En este documento no se reproducen los valores a propósito.)*

**Riesgo real:** con el token del bot, un tercero puede leer y enviar mensajes
por tu bot de Telegram. Con la clave de Web3Forms, puede enviarte correos
falsos a tu bandeja de leads.

**Qué tienes que hacer:**

1. **Telegram:** abre Telegram, habla con **@BotFather**, elige tu bot →
   `/revoke` para invalidar el token → te da uno nuevo.
2. **Web3Forms:** entra en https://web3forms.com, borra la clave actual y genera
   otra.
3. **Actualiza los valores nuevos en Vercel** → proyecto `movilease` →
   *Settings → Environment Variables* (`TELEGRAM_BOT_TOKEN`, `WEB3FORMS_API_KEY`)
   y vuelve a desplegar.
4. **Arregla quierorenting.es** para que no vuelva a llevar secretos en el HTML.
   Pídeselo al Claude nuevo: la solución correcta es que ese formulario envíe a
   un endpoint del servidor, no directamente a Telegram desde el navegador.

> Hasta el paso 4, cada vez que rotes el token quierorenting.es dejará de
> notificar. Es preferible eso a dejar el token público.

## 11.2 🔴 Localizar y asegurar las cuentas de Vercel

**Por qué importa:** mientras otra persona tenga acceso al proyecto de Vercel,
puede desplegar su propia versión y **pisar todos tus cambios**.

**Qué tienes que hacer:**

1. Entra en https://vercel.com con tu cuenta y comprueba si ves los proyectos de
   **movilease** y de **quierorenting**.
2. **Si los ves:** ve a *Settings → Members* de cada uno y comprueba quién más
   tiene acceso. Quita a quien no deba estar.
3. **Si NO los ves:** están en la cuenta de otra persona. Tienes dos salidas:
   - Pedir que te transfieran el proyecto, o que te añadan como miembro.
   - **O**, si tienes el dominio: crear proyectos nuevos en tu cuenta y
     **apuntar el DNS a los tuyos**. Con el dominio en la mano, no dependes de
     nadie. Esto último **sí puede ayudarte a hacerlo el Claude nuevo**.

## 11.3 🔴 Confirmar quién controla los dominios

**Qué tienes que hacer:**

1. Consulta el registrador en https://www.whois.com/whois/movilease.es y en
   https://www.whois.com/whois/quierorenting.es (campo *Registrar*).
2. Entra en el panel de ese registrador y comprueba que **la cuenta es tuya**.
3. Comprueba que el contacto de renovación es un email al que tú accedes. *Un
   dominio que caduca tumba la web entera.*
4. Activa la **renovación automática** en los dos.

**Es la acción más importante de toda la lista.** El dominio es lo único que no
se puede recuperar de ninguna otra forma.

## 11.4 🟡 Publicar el SEAT León, que está preparado y sin publicar

Hay un coche completamente listo —ficha, 7 fotos y el SQL de alta— que **nunca se
llegó a ejecutar**. Comprobado hoy: `https://movilease.es/renting-seat-leon`
devuelve **404**.

**Qué tienes que hacer:** entra en Supabase → *SQL Editor*, abre el archivo
`supabase/alta_seat_leon.sql` del repositorio, pega su contenido y ejecútalo. Es
idempotente (se puede ejecutar dos veces sin estropear nada). O simplemente
pídeselo al Claude nuevo, que te guiará.

## 11.5 🔴 Redactar las páginas legales

`/aviso-legal` y `/politica-privacidad` siguen diciendo literalmente
*"PENDIENTE: completar con los datos fiscales…"*. Confirmado hoy en producción.

**Por qué es importante:** el formulario de leads **pide el consentimiento RGPD
y enlaza a esa política vacía**. Es un problema de cumplimiento legal, no
estético.

**Qué tienes que hacer:** dale al Claude nuevo la **razón social, el NIF y el
domicilio fiscal** y pídele que redacte las dos páginas. Él no puede inventarse
esos datos.

## 11.6 🟡 Decidir si instalas analítica

Hoy **no se mide nada** en movilease.es. No sabes cuántas visitas tienes, ni de
dónde vienen, ni qué coches se miran más.

**Qué tienes que hacer si quieres medir:**

1. Crea una propiedad en https://analytics.google.com y copia el identificador
   (empieza por `G-`).
2. Dáselo al Claude nuevo y pídele que lo instale **respetando el banner de
   cookies** que ya existe.
3. Si además quieres campañas de Meta, crea el Pixel en
   https://business.facebook.com y dale también ese identificador.

## 11.7 🟡 Decidir si el repositorio sigue siendo público

El repositorio `quierorenting-collab/movilease` es **público**: cualquiera puede
leer el código, ver la estructura de la base de datos y los precios del catálogo.

**No hay contraseñas dentro** (están todas en variables de entorno, y `.env.local`
está excluido), así que no es una fuga. Pero es una decisión de negocio.

**Para hacerlo privado:** GitHub →
https://github.com/quierorenting-collab/movilease/settings →
*Danger Zone* → *Change visibility* → *Make private*. **Después comprueba que
Vercel sigue desplegando**: puede pedirte reautorizar el acceso.

## 11.8 🟡 Recuperar el código de quierorenting.es en un repositorio

Hoy esa web **no tiene repositorio**: si alguien borra los ficheros de Vercel, no
hay copia. Pídele al Claude nuevo:

```
Descarga las 85 páginas de quierorenting.es siguiendo el procedimiento de
docs/HANDOFF-MAESTRO.md §2.5, crea un repositorio nuevo con ellas y dime cómo
conectarlo a Vercel.
```

## 11.9 ⚪ Las otras dos webs del ecosistema

No las has mencionado, pero forman parte del mismo conjunto y tienen problemas
abiertos. Están documentadas en `docs/HANDOFF-MAESTRO.md` §14:

- **laponce.es** — la cuenta atrás lleva parada desde el **24/06/2026** y el
  título de la página sigue anunciando un concierto ya celebrado. Confirmado hoy.
- **adridaganzo.com** — el formulario de contacto **no envía nada**: enseña
  "¡Gracias!" y el mensaje se pierde. Confirmado hoy. Su analítica también está
  con valores de ejemplo.

---

## RESUMEN EN UNA PÁGINA

**Lo mínimo imprescindible para que el Claude nuevo trabaje:**

1. Conectar **GitHub** al repositorio `quierorenting-collab/movilease` con
   permiso de escritura.
2. Pegarle **`docs/CONTEXTO-MAESTRO.md`**.
3. Ya puede trabajar. Cada push a `master` se publica solo en movilease.es.

**Lo mínimo imprescindible para que TÚ no pierdas el control:**

1. Entrar en la cuenta de GitHub **`quierorenting-collab`**.
2. Entrar en **Vercel** y ver el proyecto `movilease`.
3. Entrar en **Supabase**.
4. Saber **quién tiene el dominio** y que la cuenta sea tuya.
5. Copiar las **9 variables de entorno** a un gestor de contraseñas.

**Lo que hay que arreglar cuanto antes:**

1. 🔴 Rotar el token de Telegram y la clave de Web3Forms (§11.1).
2. 🔴 Redactar las páginas legales (§11.5).
3. 🔴 Confirmar el control de los dominios (§11.3).
