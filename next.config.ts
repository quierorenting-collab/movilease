import type { NextConfig } from "next";

/**
 * Coches que se han retirado del catálogo porque ya no están en stock: sus
 * fichas quedan inactivas en la base de datos y su URL, que Google tiene
 * indexada, pasaría a devolver 404. En vez de eso se manda al catálogo.
 *
 * La redirección es TEMPORAL a propósito. Un 308 le diría a Google que la
 * dirección ha desaparecido para siempre y la sacaría del índice; estos coches
 * pueden volver a entrar en stock, y entonces basta con reactivarlos y quitar
 * su línea de aquí para recuperar la ficha con su posicionamiento intacto.
 */
const MODELOS_RETIRADOS = [
  "renting-ebro-s700",
  "renting-alfa-romeo-junior",
  "renting-audi-a3-sportback",
  "renting-citroen-c4",
  "renting-dacia-sandero",
  "renting-ebro-s800-phev",
  "renting-fiat-ducato",
  "renting-ford-kuga",
  "renting-ford-puma",
  "renting-foton-tunland",
  "renting-jaecoo-7",
  "renting-jeep-avenger",
  "renting-jeep-compass",
  "renting-kgm-korando",
  "renting-kgm-musso",
  "renting-kgm-rexton",
  "renting-kgm-tivoli",
  "renting-kia-stonic",
  "renting-maxus-deliver-9",
  "renting-maxus-t60-max",
  "renting-mazda-3",
  "renting-mazda-6e",
  "renting-mazda-cx-5",
  "renting-mg-zs",
  "renting-mitsubishi-outlander",
  "renting-nissan-x-trail",
  "renting-omoda-5",
  "renting-omoda-7",
  "renting-omoda-9",
  "renting-opel-combo-cargo",
  "renting-peugeot-2008",
  "renting-peugeot-3008",
  "renting-peugeot-partner",
  "renting-peugeot-rifter",
  "renting-renault-austral",
  "renting-renault-captur",
  "renting-renault-espace",
  "renting-renault-rafale",
  "renting-renault-symbioz",
  "renting-skoda-elroq",
  "renting-skoda-karoq",
  "renting-skoda-octavia",
  "renting-subaru-crosstrek",
  "renting-subaru-forester",
  "renting-subaru-outback",
  "renting-toyota-hilux",
  "renting-toyota-proace",
  "renting-volkswagen-golf",
  "renting-volkswagen-t-cross",
  "renting-volkswagen-t-roc",
];

const nextConfig: NextConfig = {
  /**
   * www servía el sitio entero en paralelo al dominio sin www, con 200 en las
   * dos. El canonical ya apuntaba bien y Google consolidaba, pero lo correcto
   * es que exista una sola dirección. Se resuelve en el edge, sin meter
   * middleware en todas las rutas públicas.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.movilease.es" }],
        destination: "https://movilease.es/:path*",
        permanent: true,
      },
      ...MODELOS_RETIRADOS.map((slug) => ({
        source: `/${slug}`,
        destination: "/catalogo",
        permanent: false,
      })),
    ];
  },
  /**
   * Vercel sirve todo lo de public/ con `max-age=0, must-revalidate`, así que
   * en cada visita repetida hay una ida y vuelta de red por imagen —devuelven
   * 304 con 300 B, pero se paga la latencia— y /_next/image copia esa cabecera
   * del origen.
   *
   * Los plazos son distintos a propósito, porque el riesgo no es el mismo:
   * los vídeos y los logos de marca no cambian nunca, pero las fotos de coche
   * SÍ se reemplazan conservando el nombre cuando se actualiza el catálogo
   * desde el Drive. Con siete días ahí, una foto nueva tardaría una semana en
   * verse; con un día, como mucho hasta mañana.
   */
  async headers() {
    return [
      {
        source: "/coches-nuevos/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/videos/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
      {
        source: "/brands/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
    ];
  },

  images: {
    // AVIF primero: en fotos de coche baja un 20-30 % respecto a WebP
    formats: ["image/avif", "image/webp"],
    // El hero pide quality=92; declararlo quita el aviso y en Next 16 será obligatorio
    qualities: [75, 92],
    // Las fotos del catálogo apenas cambian: menos reoptimizaciones
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "fotos.quecochemecompro.com",
      },
    ],
  },
};

export default nextConfig;
