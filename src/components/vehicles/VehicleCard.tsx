import Image from "next/image";
import Link from "next/link";
import type { VehicleCardData } from "@/lib/data/vehicles";
import { FUEL_TYPE_LABELS } from "@/lib/constants";
import { FavoriteButton } from "@/components/vehicles/FavoriteButton";
import { CompareButton } from "@/components/vehicles/CompareButton";

export function VehicleCard({ vehicle }: { vehicle: VehicleCardData }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface transition-transform hover:-translate-y-1 hover:border-primary/30">
      <Link href={`/${vehicle.modelSlug}`} className="contents">
        <div className="relative aspect-[4/3] w-full bg-surface-elevated">
          {vehicle.imageUrl ? (
            <Image
              src={vehicle.imageUrl}
              alt={`${vehicle.brandName} ${vehicle.modelName}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl font-semibold text-muted-2">
              {vehicle.brandName.charAt(0)}
            </div>
          )}
          {vehicle.badgeText && (
            <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-black">
              {vehicle.badgeText}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-2">
            {vehicle.brandName} · {FUEL_TYPE_LABELS[vehicle.fuelType]}
          </p>
          <h3 className="font-semibold text-foreground">{vehicle.modelName}</h3>
          <p className="text-sm text-muted">{vehicle.version}</p>
          <p className="mt-3 text-lg font-semibold text-primary">
            {vehicle.priceLabel}
            <span className="text-sm font-normal text-muted"> /mes</span>
          </p>
        </div>
      </Link>
      <FavoriteButton vehicleId={vehicle.id} />
      <div className="px-5 pb-4">
        <CompareButton vehicleId={vehicle.id} />
      </div>
    </div>
  );
}
