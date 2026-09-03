export function formatPriceFromCents(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    /**
     * Sin esto el ICU español no agrupa hasta las cinco cifras, así que el GLE
     * salía como "1407 €" y el Omoda 7 como "1008 €" en mitad de una tabla de
     * cuotas donde el resto lleva tres. Al lado de "966 €" eso se lee como una
     * errata, y sobre todo no es lo que dicen las láminas del proveedor, que
     * escriben "1.407 €": que el precio del papel y el de la web se escriban
     * distinto es exactamente lo que hace dudar a un cliente.
     *
     * Va como booleano y no como "always" a propósito: el tipo de la cadena
     * solo existe si el proyecto incluye la librería es2023.intl, y aquí el
     * target es ES2017. El resultado es idéntico.
     */
    useGrouping: true,
  }).format(cents / 100);
}

/**
 * El mismo importe agrupado pero SIN el símbolo, y a partir de euros enteros.
 *
 * Existe aparte porque varios textos escriben el euro ellos mismos —"desde
 * 1.407 €/mes", "hasta 900 €/mes", el título de la ficha— y pasarles una
 * cadena que ya lo trae dejaría "1.407 € €/mes". Cambiar solo
 * `formatPriceFromCents` arreglaba la tabla de cuotas y dejaba sin punto el
 * precio grande del hero, el `<title>` y la FAQ, que es como se detectó.
 *
 * OJO, no vale para todo: los precios de los datos estructurados
 * (`lowPrice`/`highPrice` de JSON-LD) van como NÚMERO y sin separador —
 * schema.org espera 1407— así que ahí no se toca nada.
 */
export function formatEuros(euros: number): string {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(euros);
}
