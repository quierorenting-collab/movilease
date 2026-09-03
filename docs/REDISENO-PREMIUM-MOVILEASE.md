# REDISEÑO PREMIUM Y DIFERENCIACIÓN VISUAL DE MOVILEASE

> **Origen:** encargo de Adrián Daganzo del 03/09/2026, entregado con el
> catálogo a medio sincronizar. Su instrucción literal fue **«cuando acabes
> hacemos esto»**, así que este documento es una COLA, no un trabajo en curso.
>
> Se guarda literal. Es su encargo, no mi interpretación de él.

---

## LO QUE PIDE

Analizar visualmente toda la web y mejorarla para conseguir una imagen mucho
más **premium, moderna y diferenciada** de las típicas webs de renting. No un
cambio de colores ni añadir efectos: actuar como director de arte digital,
diseñador UX/UI premium, especialista en automoción, en conversión y
mobile-first.

**Antes de modificar nada:** analizar la web completa y detectar qué elementos
hacen que parezca genérica.

### 1. Objetivo visual

PREMIUM + CONFIANZA + AUTOMOCIÓN + TECNOLOGÍA + EXCLUSIVIDAD + PROFESIONALIDAD.
Diferenciarse de las webs de renting llenas de bloques, tarjetas y descuentos.
La sensación al entrar debe ser: *«esta empresa parece diferente»*.

### 2. Hero / Home

El vídeo de escritorio funciona: aporta profundidad y sensación premium. **El
problema es el móvil**, donde el vídeo no se aprecia.

No vale hacer el vídeo más pequeño: hay que crear una **experiencia específica
para móvil** — vídeo vertical o 9:16, imagen cinematográfica de alta calidad,
secuencia de imágenes o motion background ligero. Con degradado elegante para
que el texto sea perfectamente legible.

> Prioridad literal: **que el resultado se vea premium en móvil, no que sea el
> mismo vídeo recortado.**

### 3. Nada de vídeos genéricos malos

Investigar vídeo premium de automoción usable legalmente: licencia, uso
comercial, peso optimizado, formatos modernos, poster, lazy loading. **Si no
hay un vídeo suficientemente bueno, mejor una fotografía cinematográfica
espectacular que un vídeo mediocre.** Valorar también producir material propio
de la marca.

### 4. Identidad visual

Dirección artística coherente en tipografías, tamaños, pesos, colores,
espaciados, botones, bordes, sombras, cards, iconos, fotografías, animaciones,
fondos y degradados. Todo debe parecer el mismo sistema.

Evitar el exceso de sombras, bordes redondeados, gradientes baratos,
animaciones innecesarias, colores y elementos flotantes. **Elegancia.**

### 5. Catálogo

Los coches son los protagonistas. Fotografías grandes, calidad visual, cuota
claramente visible, información limpia, jerarquía, botón de acción claro,
botón de IA y selector de km/meses. **No tarjetas genéricas de ecommerce: fichas
de catálogo automovilístico premium.**

### 6. Fotografías

Tratamiento uniforme. Coherencia entre fotos del mismo coche, priorizar las
mejores, nada pixelado ni deformado, fondos consistentes. El coche siempre
protagonista.

### 7. Microinteracciones

Aparición suave, hover sobre vehículos, transiciones de imágenes, animación
ligera de botones, scroll reveal, transiciones entre secciones. Pero sin
convertir la web en una demo de animaciones.

> Regla: **premium = movimiento sutil + velocidad + intención.**

### 8. Mobile first

Revisar a 320, 375, 390, 430 px, tablet y escritorio. El móvil no puede ser una
versión reducida: cada sección diseñada para móvil, sobre todo hero, menús,
catálogo, fichas, selectores, botón de IA, WhatsApp, formularios y
documentación.

### 9. Diferenciación

Crear elementos propios de MoviLease:

- **Buscador inteligente** — «dime cuánto quieres pagar y qué coche necesitas»
- **Asesor MoviLease** — disponible durante toda la navegación
- **Encuentra tu cuota** — coche + km/año + meses → cuota
- **No encuentras tu coche** — «tenemos oportunidades que no siempre aparecen
  públicamente»

### 10. Home

Recorrido propuesto (no literal si el análisis indica algo mejor): hero →
buscar coche / hablar con el asesor → marcas o categorías → destacados → por qué
MoviLease → cómo funciona → ventajas del renting → asesor → ofertas y vehículos
no publicados → confianza → CTA final.

### 11. Jerarquía comercial

La estética nunca perjudica la conversión. El recorrido debe ser
**COCHE → CUOTA → CONDICIONES → HABLAR → SOLICITAR OFERTA**. Un CTA principal y
secundarios; no llenar la pantalla de botones.

### 12. IA y WhatsApp

La IA integrada visualmente con la marca, **no un widget externo pegado**.
WhatsApp presente sobre todo cuando hay intención comercial.

### 13. Velocidad

Mantener o mejorar el rendimiento: vídeo, imágenes, fuentes, JS, CSS, lazy
loading, responsive images, WebP/AVIF, compresión, carga progresiva. **Nada de
una web preciosa que tarde 5 segundos.**

### 14. Regla muy importante

Antes de cambiar el diseño: analizar, detectar problemas, proponer, identificar
qué funciona ya, no eliminar funcionalidades, mantener catálogo, precios, IA,
WhatsApp y sistema de leads. **Después** implementar.

> No cambiar cosas por cambiar. Cada modificación con un motivo: mejor estética
> + mejor UX + más confianza + más conversión.

### 15. Resultado buscado

> «Esto no parece la típica web de renting.»

Premium, tecnológica, elegante, automovilística, moderna y limpia. Y la
experiencia en móvil tan buena o mejor que en ordenador. Identidad visual
propia, no una copia.

---

# NOTAS PARA CUANDO SE ABORDE

Esta parte **no es de Adrián**: es lo que ya se sabe del repositorio y que
condiciona el trabajo. Leerla antes de empezar ahorra tiempo y errores caros.

## Lo que ya está hecho y NO hay que rehacer

- **El vídeo del hero ya está optimizado**: carga diferida con
  `requestIdleCallback`, `preload="none"`, póster servido por `next/image`. El
  primer pintado bajó de 1.261.216 a 300.342 bytes. Cualquier propuesta de hero
  nuevo tiene que igualar eso, no empeorarlo.
- **El movimiento ya respeta `prefers-reduced-motion`** en las dos capas:
  `MotionConfig reducedMotion="user"` para framer-motion y la excepción CSS.
  Toda animación nueva hereda esto solo si se monta dentro del layout público.
- **El contraste está medido, no estimado.** Las decisiones de color llevan su
  ratio en el comentario. Mantener esa costumbre.
- **El selector de km y meses ya existe** dentro de la ventana del asesor
  (`ContextoCocheCard.tsx`). El punto 9 pide llevarlo también a la ficha.
- **El botón del asesor ya está** en el hero, en cada ficha, en cada tarjeta del
  catálogo y flotando sobre el de WhatsApp.

## La trampa que va a costar una tarde si no se sabe

**`src/app/globals.css` no tiene NI UNA `@layer`.** Todas sus clases ganan a
cualquier utilidad de Tailwind, escriba lo que escriba el `className`. Ya ha
causado fallos reales: un botón que se veía en móvil pese a llevar `hidden`, y
un `bottom-*` que no movía nada. En un rediseño que toca botones, tarjetas y
espaciados esto va a aparecer constantemente. La salida es tocar `globals.css`,
no pelearse con utilidades.

## Fotografías: el problema es de origen, no de diseño

El punto 6 pide coherencia fotográfica, y hoy no la hay por una razón que no se
arregla con CSS: **parte del catálogo usa fotos de archivo de
quecochemecompro.com** y no del coche real. El Cupra Formentor se anuncia con
fotos que no son de su color, y al Qashqai le pasó lo mismo (salió rojo cuando
se contrata azul).

La fuente buena son las hojas de contacto `FOTOS *.png` del Drive: estudio,
fondo gris neutro, matrícula MoviLease y color real. `trocear_hoja_fotos.py` las
convierte. **Esto es trabajo de datos, no de diseño, y debería hacerse antes
del rediseño visual**: no tiene sentido pulir la presentación de una foto que
es del coche equivocado.

## Lo que no se toca sin permiso

Número de WhatsApp y datos de contacto · precios que no vengan de una lámina ·
la frase «IVA incluido» · el honeypot `website` y la casilla `rgpd` · el
mecanismo multimarca · la redirección `www` · los slugs ya publicados · el 404
de modelos sin vehículos activos.
