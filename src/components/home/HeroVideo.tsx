"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_HD  = "https://videos.pexels.com/video-files/33931911/14399098_1920_1080_25fps.mp4";
const VIDEO_SD  = "https://videos.pexels.com/video-files/33931911/14399097_1280_720_25fps.mp4";
const VIDEO_LOW = "https://videos.pexels.com/video-files/33931911/14399096_960_540_25fps.mp4";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onCanPlay = () => setLoaded(true);
    v.addEventListener("canplay", onCanPlay, { once: true });
    return () => v.removeEventListener("canplay", onCanPlay);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
        style={{
          opacity: loaded ? 1 : 0,
          filter: "brightness(0.55) saturate(0.7) contrast(1.1)",
        }}
      >
        <source src={VIDEO_LOW} type="video/mp4" />
        <source src={VIDEO_SD}  type="video/mp4" />
        <source src={VIDEO_HD}  type="video/mp4" />
      </video>
      {/* Subtle blue brand tint overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(0,6,20,0.35) 0%, rgba(0,6,20,0.1) 40%, rgba(4,16,31,0.7) 100%)",
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}
