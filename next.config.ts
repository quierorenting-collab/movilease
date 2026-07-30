import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
