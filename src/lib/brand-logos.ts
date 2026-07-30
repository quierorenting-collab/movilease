const EXTENSION_BY_SLUG: Record<string, string> = {
  audi: "svg",
  "alfa-romeo": "png",
  citroen: "svg",
  cupra: "svg",
  dacia: "svg",
  ebro: "png",
  fiat: "png",
  ford: "svg",
  foton: "svg",
  hyundai: "svg",
  jaecoo: "svg",
  jeep: "png",
  kgm: "svg",
  kia: "svg",
  maxus: "png",
  mazda: "svg",
  mg: "png",
  mitsubishi: "svg",
  nissan: "svg",
  omoda: "svg",
  opel: "svg",
  peugeot: "png",
  renault: "svg",
  seat: "svg",
  skoda: "png",
  subaru: "png",
  toyota: "svg",
  volkswagen: "svg",
};

function slugify(brandName: string) {
  return brandName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-");
}

/** Logo oficial de la marca, servido desde public/brands/. Null si no tenemos un logo libre de derechos para esa marca. */
export function getBrandLogoUrl(brandName: string): string | null {
  const slug = slugify(brandName);
  const ext = EXTENSION_BY_SLUG[slug];
  if (!ext) return null;
  return `/brands/${slug}.${ext}`;
}
