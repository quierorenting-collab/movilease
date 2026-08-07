import type { NextConfig } from "next";

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
