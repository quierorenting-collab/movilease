"use client";

import Image from "next/image";
import { useState } from "react";

export function HeroImage() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="absolute inset-0">
      <Image
        src="/hero-bg.webp"
        alt=""
        fill
        priority
        quality={90}
        sizes="100vw"
        className={`object-cover object-center transition-opacity duration-1000 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
      />

      {/* Overlay base oscuro */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Degradado izquierda → legibilidad texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

      {/* Degradado abajo → fade hacia el siguiente bloque */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#04101F] via-transparent to-black/25" />
    </div>
  );
}
