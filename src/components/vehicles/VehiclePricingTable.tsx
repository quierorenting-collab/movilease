import type { VehiclePricingRow } from "@/lib/data/vehicles";
import { formatPriceFromCents } from "@/lib/utils";

/**
 * Tabla de cuotas plazo × kilometraje.
 *
 * Ojo con los colores de aquí: esta tabla vive sobre .surface-graphite, que es
 * un degradado que arranca en #2358B4 — bastante más claro de lo que era
 * cuando se escribió. La columna destacada llevaba texto #0068FF sobre un velo
 * del mismo #0068FF y se quedaba en 1,46:1: azul de marca sobre azul de marca,
 * el peor contraste de toda la web, y justo en la cifra que el cliente ha
 * venido a leer.
 *
 * Ahora la columna destacada se distingue por el velo (/25) y no por el color
 * del texto, que va en blanco. Los demás niveles usan .text-on-dark-2, el
 * token de la casa, en vez de opacidades sueltas. Ratios en el peor punto del
 * degradado: destacada 6,65:1, resto 5,43:1. Antes: 1,46 / 2,51 / 4,53.
 *
 * Si algún día se vuelve a aclarar la escala oscura, hay que volver a medir
 * esto: es lo que no se hizo la vez anterior.
 *
 * Y el ancho mínimo es responsivo por un motivo de negocio, no de maquetación:
 * con min-w-[480px] fijo, a 375 px la tabla se salía 155 px de su contenedor y
 * lo que quedaba fuera era justo la columna destacada — la del precio que
 * anuncian el título de la página y el hero. El visitante de móvil llegaba
 * buscando esa cifra y no la veía, salvo que descubriera que la tabla se
 * desliza. A 320 px y con las celdas compactas, entra entera.
 */

export function VehiclePricingTable({
  tiers,
  highlightMonths,
}: {
  tiers: VehiclePricingRow[];
  highlightMonths?: number;
}) {
  if (tiers.length === 0) return null;

  const months = [...new Set(tiers.map((t) => t.contractMonths))].sort((a, b) => a - b);
  const kms = [...new Set(tiers.map((t) => t.annualKm))].sort((a, b) => a - b);
  const byKey = new Map(tiers.map((t) => [`${t.contractMonths}-${t.annualKm}`, t]));
  const highlighted = highlightMonths && months.includes(highlightMonths) ? highlightMonths : months[months.length - 1];

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/20">
      {/* min-w-0 en móvil: con 320px de mínimo, en una pantalla de 320 se
          ocultaban 50px por la derecha, y esos 50px son la mitad de la columna
          de 60 meses, que es la marcada con estrella. El mínimo se mantiene a
          partir de sm, donde sí hay sitio. */}
      <table className="w-full min-w-0 border-collapse text-left sm:min-w-[480px]">
        <thead>
          <tr className="border-b border-white/20">
            <th className="px-2 py-4 text-[11px] sm:px-5 font-bold uppercase tracking-[0.16em] text-on-dark-2 sm:px-5">
              Km / año
            </th>
            {months.map((m) => (
              <th
                key={m}
                className={`px-2 sm:px-5 py-4 text-center text-[12px] font-bold uppercase tracking-[0.1em] sm:px-5 ${
                  m === highlighted ? "bg-[#0068FF]/25 text-white" : "text-on-dark-2"
                }`}
              >
                {m} meses
                {m === highlighted && <span className="ml-1">★</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {kms.map((km, i) => (
            <tr key={km} className={i % 2 === 1 ? "bg-white/[0.02]" : undefined}>
              <td className="px-2 sm:px-5 py-3.5 text-[13px] font-medium text-on-dark-2 sm:px-5">
                {km.toLocaleString("es-ES")} km
              </td>
              {months.map((m) => {
                const cell = byKey.get(`${m}-${km}`);
                return (
                  <td
                    key={m}
                    className={`px-2 sm:px-5 py-3.5 text-center text-[13.5px] font-semibold sm:px-5 ${
                      m === highlighted ? "bg-[#0068FF]/25 text-white" : "text-on-dark-2"
                    }`}
                  >
                    {cell ? formatPriceFromCents(cell.monthlyPriceCents) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
