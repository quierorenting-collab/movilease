"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function HeroImage() {
  const [loaded, setLoaded] = useState(false);
  const { scrollY } = useScroll();

  // Cinematic parallax — image drifts slower than scroll
  const rawY = useTransform(scrollY, [0, 1000], [0, 220]);
  const y = useSpring(rawY, { stiffness: 90, damping: 30, restDelta: 0.001 });
  const scale = useTransform(scrollY, [0, 800], [1.06, 1.16]);
  const overlayOpacity = useTransform(scrollY, [0, 600], [1, 1.35]);

  // Subtle mouse-driven ambient light
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Parallax image layer */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <Image
          src="/hero-bg.webp"
          alt=""
          fill
          priority
          quality={92}
          sizes="100vw"
          className={`object-cover object-center transition-all duration-[1400ms] ease-out ${
            loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-xl scale-105"
          }`}
          onLoad={() => setLoaded(true)}
        />
      </motion.div>

      {/* Base darkening */}
      <motion.div
        className="absolute inset-0 bg-black/45"
        style={{ opacity: overlayOpacity }}
      />

      {/* Left → right cinematic gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />

      {/* Vertical fade into next section */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/40" />

      {/* Ambient mouse-following light — very subtle */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          background: `radial-gradient(600px circle at ${mouse.x * 100}% ${mouse.y * 100}%, rgba(0,104,255,0.10) 0%, transparent 65%)`,
          opacity: loaded ? 1 : 0,
        }}
      />

      {/* Bottom vignette for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 0%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
