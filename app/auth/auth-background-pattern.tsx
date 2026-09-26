"use client";

import { useEffect, useRef } from "react";

export function AuthBackgroundPattern() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Drifting waypoint particles matching the CTA / Hero aesthetic
    const numParticles = 20;
    const particles: Array<{
      x: number;
      y: number;
      speed: number;
      radius: number;
      alpha: number;
      offset: number;
    }> = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * (width || 1200),
        y: Math.random() * (height || 800),
        speed: 0.15 + Math.random() * 0.3,
        radius: 1.2 + Math.random() * 1.8,
        alpha: 0.15 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      time += 0.009;
      ctx.clearRect(0, 0, width, height);

      // 1. Fluent Ambient Radial Gradient Glows (Left Hero side & Right Card side)
      // Left ambient glow (Prava radiant cerulean)
      const leftGlow = ctx.createRadialGradient(
        width * 0.25,
        height * 0.35,
        0,
        width * 0.25,
        height * 0.35,
        Math.max(width, height) * 0.55
      );
      leftGlow.addColorStop(0, "rgba(45, 155, 240, 0.09)");
      leftGlow.addColorStop(0.45, "rgba(45, 155, 240, 0.03)");
      leftGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = leftGlow;
      ctx.fillRect(0, 0, width, height);

      // Bottom-right ambient glow (Sky accent)
      const rightGlow = ctx.createRadialGradient(
        width * 0.8,
        height * 0.7,
        0,
        width * 0.8,
        height * 0.7,
        Math.max(width, height) * 0.5
      );
      rightGlow.addColorStop(0, "rgba(85, 184, 255, 0.06)");
      rightGlow.addColorStop(0.5, "rgba(45, 155, 240, 0.02)");
      rightGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = rightGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Harmonic Fluid Sine Waves (Undulating contour lines)
      const waves = [
        {
          amplitude: 32,
          frequency: 0.0028,
          speed: 0.9,
          yRatio: 0.28,
          color: "rgba(45, 155, 240, 0.14)",
          lineWidth: 1.6,
        },
        {
          amplitude: 42,
          frequency: 0.0022,
          speed: -0.7,
          yRatio: 0.46,
          color: "rgba(45, 155, 240, 0.18)",
          lineWidth: 2.0,
        },
        {
          amplitude: 26,
          frequency: 0.0036,
          speed: 1.1,
          yRatio: 0.62,
          color: "rgba(148, 163, 184, 0.18)",
          lineWidth: 1.2,
        },
        {
          amplitude: 48,
          frequency: 0.0019,
          speed: -0.5,
          yRatio: 0.78,
          color: "rgba(45, 155, 240, 0.12)",
          lineWidth: 1.8,
        },
      ];

      waves.forEach((w) => {
        ctx.beginPath();
        const baseOffset = height * w.yRatio;

        for (let x = 0; x <= width; x += 6) {
          const y =
            baseOffset +
            Math.sin(x * w.frequency + time * w.speed) * w.amplitude +
            Math.cos(x * w.frequency * 0.5 + time * 0.35) * (w.amplitude * 0.45);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = w.color;
        ctx.lineWidth = w.lineWidth;
        ctx.stroke();
      });

      // 3. Subtle Cartographic Crosshairs at strategic coordinate intersections
      const crosshairs = [
        { xPct: 0.12, yPct: 0.22 },
        { xPct: 0.42, yPct: 0.15 },
        { xPct: 0.22, yPct: 0.68 },
        { xPct: 0.88, yPct: 0.32 },
        { xPct: 0.78, yPct: 0.82 },
      ];

      ctx.strokeStyle = "rgba(45, 155, 240, 0.4)";
      ctx.lineWidth = 1.2;
      const crossSize = 4.5;

      crosshairs.forEach((c) => {
        const cx = width * c.xPct;
        const cy = height * c.yPct;

        ctx.beginPath();
        ctx.moveTo(cx - crossSize, cy);
        ctx.lineTo(cx + crossSize, cy);
        ctx.moveTo(cx, cy - crossSize);
        ctx.lineTo(cx, cy + crossSize);
        ctx.stroke();
      });

      // 4. Floating Waypoint Particles
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(time + p.offset) * 0.35;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 155, 240, ${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full z-0"
    />
  );
}
