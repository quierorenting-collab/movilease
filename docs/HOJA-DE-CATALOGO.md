# La hoja de catálogo de MoviLease

Esta es la hoja que convierte el Drive en la fuente de verdad **de verdad**.

Hoy el Drive son 40 imágenes: los precios viven dentro de fotos de tablas. Un
robot no puede leerlas sin OCR, y un dígito mal leído publica un precio falso
en la web. Con esta hoja, la sincronización deja de ser una apuesta.

El fichero ya está rellenado con **los 36 coches publicados hoy**, sacados de
la base de datos, así que no partís de cero: solo hay que ir manteniéndolo.

📄 `docs/CATALOGO-MOVILEASE.csv`

---

## Cómo se abre

Es un CSV con punto y coma y codificación UTF-8. En Excel español se abre con
doble clic y las columnas salen bien. En Google Sheets: **Archivo → Importar →
Subir**, y en «Tipo de separador» elegir **Punto y coma**.

Si lo subís a Google Sheets, ese documento pasa a ser el original y el CSV del
repositorio queda solo como copia de arranque.

---

## Las cinco reglas que evitan publicar un precio falso

**1. Una celda vacía significa «ese kilometraje no se ofrece». Nunca un 0.**

En las láminas el 0 quiere decir que esa combinación no está disponible.
Escribir 0 en la hoja publicaría un renting gratis. Si no se ofrece, se deja
en blanco.

**2. La columna `PRECIO CON IVA` es obligatoria y no se rellena de memoria.**

Hay láminas SIN IVA que **no lo dicen en el nombre del fichero**, solo dentro.
La del Nissan Qashqai de ARVAL llegó a decir «IVA INCLUIDO» e «IVA NO
INCLUIDO» a la vez. Hay que abrir la lámina y mirarlo.

- `SI` → los importes de la fila llevan IVA. Se publican tal cual.
- `NO` → **no se publica esa fila.** No se calcula el IVA por nuestra cuenta.

**3. El «DESDE» impreso en la lámina no vale.**

Comprobado en cuatro coches el mismo día: el Formentor, el Mazda 3, el Peugeot
208 y el Mazda 2 imprimían un «DESDE» que **no coincidía con su propia tabla**.
Lo que se copia a la hoja es **la tabla**, celda a celda.

La web calcula sola el precio destacado: coge la celda más barata de la fila de
10.000 km, y el plazo es esa columna.

**4. La `REFERENCIA` no se cambia nunca.**

Es lo que identifica al coche entre una sincronización y la siguiente. Si se
cambia, el sistema cree que es un coche nuevo y crea una ficha duplicada, con
lo que la URL antigua —que Google tiene indexada— se queda vacía.

Coche nuevo → referencia nueva. Coche que ya existía → su referencia de
siempre, pase lo que pase con su nombre comercial.

**5. La columna `PROVEEDOR` es interna y NO se publica.**

Está en la hoja porque a vosotros os sirve para saber de dónde viene cada
oferta. No sale en la web, ni en el asesor, ni en ningún sitio. Decisión de
Adrián: *«nunca menciona proveedores, solo marcas y coches»*.

---

## Qué hacer en cada caso

| Situación | Qué se toca en la hoja |
|---|---|
| Cambia un precio | Solo esa celda. Nada más. |
| El coche sale de stock | `ESTADO` → `FUERA DE STOCK`. **No se borra la fila.** |
| Vuelve al stock | `ESTADO` → `EN STOCK`. Se reactiva su ficha de siempre. |
| Coche nuevo | Fila nueva con referencia nueva y su tabla completa |
| Desaparece un kilometraje | Se vacía esa columna para ese coche |
| Entra o sale de ofertas | `OFERTA` → `SI` o en blanco |

**Nunca se borra una fila.** Poniéndola en `FUERA DE STOCK` se conserva la
ficha, sus fotos y su posicionamiento, y volver a activarla es cambiar una
palabra. Borrarla pierde la URL.

---

## Las columnas

**Obligatorias** — sin ellas la ficha no se puede publicar:
`REFERENCIA` · `ESTADO` · `MARCA` · `MODELO` · `VERSION` · `PRECIO CON IVA` ·
al menos una celda de precio

**Las 20 celdas de precio:** `24m 10k` … `60m 30k`, o sea plazo en meses por
kilometraje anual en miles. Importes con coma decimal, como salen en la
lámina: `427,75`.

> La columna de **24 meses está hoy entera en blanco**, y es correcto: ningún
> coche publicado la ofrece. Se deja porque, según Adrián, algún modelo suelto
> sí la admite.

**Opcionales pero recomendadas:** `CV` · `COMBUSTIBLE` · `CAMBIO` ·
`CARROCERIA` · `ETIQUETA` · `PLAZAS` · `PUERTAS` · `COLOR`

Si un dato no está claro en la lámina, **se deja vacío**. Es preferible una
ficha con un hueco que una con un dato inventado. Ya pasó: dos láminas del
Qashqai ponen «4 puertas» y el coche tiene 5; se dejó vacío y se hizo bien.

**Valores que entiende el sistema:**

- `COMBUSTIBLE`: gasolina · hibrido · electrico · diesel · phev
- `CAMBIO`: manual · automatico
- `CARROCERIA`: turismo · suv · furgoneta
- `ETIQUETA`: 0 · eco · c · b

---

## Y el color, que ya ha dado un disgusto

El `COLOR` tiene que ser el de la lámina, y las fotos tienen que ser de ese
color. El Nissan Qashqai salió publicado en rojo cuando el que se contrata es
Deep Ocean Blue, porque heredó las fotos de otra versión.

Y ojo con los colores que cuestan más: la hoja de fotos del Mazda 2 se llama
literalmente **«FOTOS GRIS (+5 EUR MES EN TODAS LAS CUOTAS)»**. Si el color
que se publica no es el del precio de la tabla, el precio está mal.

Desde el 03/09/2026 los ficheros del Drive siguen un convenio fijo —`PRECIO.png`,
`EQUIPAMIENTO.png`, `FOTOS.png`— y los matices como ese solo aparecen cuando la
hoja los lleva de verdad. Lo hizo `scripts/renombrar_drive.py`, que guarda el
mapa de vuelta en `scripts/renombrado_drive.json`.

---

## Qué pasa cuando la hoja esté lista

Con esto se puede montar la sincronización completa: leer la hoja, comparar
con lo publicado, y dar de alta, actualizar, desactivar o reactivar solo lo que
haya cambiado, en las dos webs a la vez y con su registro de qué se tocó y
cuándo.

Mientras tanto ya funciona la parte que no necesita la hoja:
`python scripts/comparar_drive.py` recorre las carpetas del Drive y dice qué
falta, qué sobra y qué láminas se han tocado últimamente. Eso ya detecta altas
y bajas por carpeta con total fiabilidad, porque no depende de leer ninguna
imagen.
