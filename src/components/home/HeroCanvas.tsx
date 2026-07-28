"use client";

import { useEffect, useRef } from "react";

export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let W = 0, H = 0;

    function resize() {
      if (!canvas) return;
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const STAR_COUNT = 160;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random() * 0.55,
      r: Math.random() * 1.2 + 0.3,
      a: Math.random() * 0.6 + 0.2,
    }));

    const TRAIL_COUNT = 20;
    const trails = Array.from({ length: TRAIL_COUNT }, (_, i) => ({
      x: Math.random(),
      y: 0.38 + Math.random() * 0.55,
      speed: 0.0015 + Math.random() * 0.004,
      len: 0.08 + Math.random() * 0.18,
      side: i < 10 ? -1 : 1,
      color: i % 3 === 0 ? "0,104,255" : i % 3 === 1 ? "14,165,201" : "180,220,240",
      alpha: 0.15 + Math.random() * 0.45,
      width: 1 + Math.random() * 1.5,
    }));

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#061B3F");
      bg.addColorStop(1, "#041020");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const glow = ctx.createRadialGradient(W * 0.5, H * 0.38, 0, W * 0.5, H * 0.38, W * 0.55);
      glow.addColorStop(0, "rgba(0,104,255,0.08)");
      glow.addColorStop(1, "rgba(0,104,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,220,255,${s.a})`;
        ctx.fill();
      }

      const VP = { x: W * 0.5, y: H * 0.38 };
      const roadW = W * 0.55;
      ctx.beginPath();
      ctx.moveTo(VP.x, VP.y);
      ctx.lineTo(VP.x - roadW / 2, H);
      ctx.lineTo(VP.x + roadW / 2, H);
      ctx.closePath();
      const roadGrad = ctx.createLinearGradient(0, VP.y, 0, H);
      roadGrad.addColorStop(0, "rgba(7,26,47,0)");
      roadGrad.addColorStop(0.4, "rgba(7,26,47,0.7)");
      roadGrad.addColorStop(1, "rgba(4,16,32,0.95)");
      ctx.fillStyle = roadGrad;
      ctx.fill();

      for (let i = 0; i < 12; i++) {
        const t = i / 12;
        const t2 = (i + 0.5) / 12;
        const y1 = VP.y + (H - VP.y) * t;
        const y2 = VP.y + (H - VP.y) * t2;
        const alpha = 0.08 + t * 0.25;
        ctx.strokeStyle = `rgba(0,104,255,${alpha})`;
        ctx.lineWidth = 1 + t * 2;
        ctx.setLineDash([8, 12]);
        ctx.beginPath();
        ctx.moveTo(VP.x, y1);
        ctx.lineTo(VP.x, y2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const now = Date.now() / 1000;
      for (const tr of trails) {
        const pos = ((tr.x + now * tr.speed) % 1 + 1) % 1;
        const frac = 0.35 + pos * 0.65;
        const roadHalfAtFrac = (roadW / 2) * frac;
        const y = VP.y + (H - VP.y) * frac;
        const cx = VP.x + tr.side * roadHalfAtFrac * 0.4;
        const lenPx = tr.len * W * 0.15 * frac;

        const grad = ctx.createLinearGradient(cx - lenPx * tr.side, y, cx + lenPx * tr.side * 0.3, y - lenPx * 0.15);
        grad.addColorStop(0, `rgba(${tr.color},0)`);
        grad.addColorStop(0.5, `rgba(${tr.color},${tr.alpha * frac})`);
        grad.addColorStop(1, `rgba(${tr.color},0)`);

        ctx.beginPath();
        ctx.moveTo(cx - lenPx * tr.side, y);
        ctx.lineTo(cx + lenPx * tr.side * 0.3, y - lenPx * 0.15);
        ctx.strokeStyle = grad;
        ctx.lineWidth = tr.width * frac;
        ctx.stroke();
      }

      // Diagonal brand accent (like brand book cover)
      const diagGrad = ctx.createLinearGradient(W, 0, W * 0.5, H * 0.38);
      diagGrad.addColorStop(0, "rgba(0,104,255,0.35)");
      diagGrad.addColorStop(1, "rgba(0,104,255,0)");
      ctx.beginPath();
      ctx.moveTo(W, 0);
      ctx.lineTo(W * 0.5, H * 0.38);
      ctx.strokeStyle = diagGrad;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
