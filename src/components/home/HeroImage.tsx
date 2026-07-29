"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function HeroImage() {
  const [loaded, setLoaded] = useState(false);
  const { scrollY } = useScroll();

  // Cinematic parallax — the car drifts slower than the scroll
  const rawY = useTransform(scrollY, [0, 1000], [0, 160]);
  const y = useSpring(rawY, { stiffness: 90, damping: 30, restDelta: 0.001 });
  const scale = useTransform(scrollY, [0, 800], [1, 1.08]);

  // Subtle mouse-driven ambient light
  const [mouse, setMouse] = useState({ x: 0.6, y: 0.5 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#071A3D]">
      {/* Ambient blue glow behind the text column */}
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-[560px] w-[560px]"
        style={{
          background: "radial-gradient(circle, rgba(0,104,255,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Car layer — full bleed on mobile, right column on desktop */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 lg:left-auto lg:right-0 lg:w-[68%]"
      >
        <Image
          src="/hero-car.webp"
          alt=""
          fill
          priority
          quality={92}
          sizes="(max-width: 1024px) 100vw, 68vw"
          className={`object-cover object-center transition-all duration-[1400ms] ease-out ${
            loaded ? "opacity-100 blur-0" : "opacity-0 blur-xl"
          }`}
          onLoad={() => setLoaded(true)}
        />
      </motion.div>

      {/* Mobile — heavy darkening so the copy always reads */}
      <div className="absolute inset-0 bg-[#071A3D]/78 lg:hidden" />

      {/* Desktop — blend the car's left edge into the dark blue panel */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, #071A3D 0%, #071A3D 26%, rgba(7,26,61,0.82) 38%, rgba(7,26,61,0.35) 52%, rgba(7,26,61,0.08) 64%, transparent 74%)",
        }}
      />

      {/* Top fade — keeps the white logo + nav readable */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#071A3D] via-[#071A3D]/55 to-transparent" />

      {/* Bottom fade into the next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#071A3D] to-transparent" />

      {/* Ambient mouse-following light — very subtle */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          background: `radial-gradient(650px circle at ${mouse.x * 100}% ${mouse.y * 100}%, rgba(0,104,255,0.07) 0%, transparent 65%)`,
          opacity: loaded ? 1 : 0,
        }}
      />
    </div>
  );
}
