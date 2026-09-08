/* Todos los logos son PNG de 240x120 desde que se normalizaron: mismo peso
   visual para todas las marcas, que antes cada fichero traia sus propios
   margenes y en el menu unos salian enormes y otros diminutos.
   Se generan con scripts/normalizar-logos-marca.mjs a partir de
   public/brands/_origen/, que guarda los ficheros tal como llegaron. */
const EXTENSION_BY_SLUG: Record<string, string> = {
  "alfa-romeo": "png",
  audi: "png",
  bmw: "png",
  byd: "png",
  citroen: "png",
  cupra: "png",
  dacia: "png",
  ebro: "png",
  fiat: "png",
  ford: "png",
  foton: "png",
  honda: "png",
  hyundai: "png",
  jaecoo: "png",
  jeep: "png",
  kgm: "png",
  kia: "png",
  "lynk-co": "png",
  maserati: "png",
  maxus: "png",
  mazda: "png",
  "mercedes-benz": "png",
  mg: "png",
  mitsubishi: "png",
  nissan: "png",
  omoda: "png",
  opel: "png",
  peugeot: "png",
  renault: "png",
  seat: "png",
  skoda: "png",
  subaru: "png",
  toyota: "png",
  volkswagen: "png",
};

function slugify(brandName: string) {
  return brandName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    // Todo lo que no sea letra o numero pasa a guion: "Lynk & Co" tiene que dar
    // "lynk-co" y no "lynk-&-co", que no es un nombre de fichero valido y dejaba
    // a la marca sin logo en el catalogo y en el menu.
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Logo oficial de la marca, servido desde public/brands/. Null si no tenemos un logo libre de derechos para esa marca. */
export function getBrandLogoUrl(brandName: string): string | null {
  const slug = slugify(brandName);
  const ext = EXTENSION_BY_SLUG[slug];
  if (!ext) return null;
  return `/brands/${slug}.${ext}`;
}
