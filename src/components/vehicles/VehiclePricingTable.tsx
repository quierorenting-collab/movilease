import type { VehiclePricingRow } from "@/lib/data/vehicles";
import { formatPriceFromCents } from "@/lib/utils";

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
    <div className="overflow-x-auto rounded-2xl border border-white/8">
      <table className="w-full min-w-[480px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/8">
            <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              Km / año
            </th>
            {months.map((m) => (
              <th
                key={m}
                className={`px-5 py-4 text-center text-[12px] font-bold uppercase tracking-[0.1em] ${
                  m === highlighted ? "bg-[#0068FF]/15 text-[#0068FF]" : "text-white/60"
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
              <td className="px-5 py-3.5 text-[13px] font-medium text-white/70">
                {km.toLocaleString("es-ES")} km
              </td>
              {months.map((m) => {
                const cell = byKey.get(`${m}-${km}`);
                return (
                  <td
                    key={m}
                    className={`px-5 py-3.5 text-center text-[13.5px] font-semibold ${
                      m === highlighted ? "bg-[#0068FF]/10 text-white" : "text-white/70"
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
