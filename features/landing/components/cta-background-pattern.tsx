"use client";

import { useEffect, useRef } from "react";

export function CtaBackgroundPattern() {
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
      height = canvas.parentElement?.clientHeight || 450;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Particle nodes for fluid flow
    const particles: Array<{
      x: number;
      y: number;
      speed: number;
      radius: number;
      alpha: number;
      offset: number;
    }> = [];

    const numParticles = 24;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * (width || 1200),
        y: Math.random() * (height || 450),
        speed: 0.2 + Math.random() * 0.4,
        radius: 1.5 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.25,
        offset: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle central ambient radial glow
      const radialGlow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.6
      );
      radialGlow.addColorStop(0, "rgba(45, 155, 240, 0.08)");
      radialGlow.addColorStop(0.5, "rgba(45, 155, 240, 0.03)");
      radialGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Harmonic Fluid Sine Waves
      const waves = [
        { amplitude: 28, frequency: 0.0035, speed: 1.0, yRatio: 0.45, color: "rgba(45, 155, 240, 0.12)", lineWidth: 1.5 },
        { amplitude: 38, frequency: 0.0028, speed: -0.8, yRatio: 0.52, color: "rgba(45, 155, 240, 0.18)", lineWidth: 2 },
        { amplitude: 22, frequency: 0.0042, speed: 1.2, yRatio: 0.58, color: "rgba(148, 163, 184, 0.20)", lineWidth: 1.2 },
        { amplitude: 44, frequency: 0.0022, speed: -0.6, yRatio: 0.65, color: "rgba(45, 155, 240, 0.10)", lineWidth: 1.8 },
      ];

      waves.forEach((w) => {
        ctx.beginPath();
        const baseOffset = height * w.yRatio;

        for (let x = 0; x <= width; x += 6) {
          const y =
            baseOffset +
            Math.sin(x * w.frequency + time * w.speed) * w.amplitude +
            Math.cos(x * w.frequency * 0.5 + time * 0.4) * (w.amplitude * 0.4);

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

      // 3. Fluid floating particles
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(time + p.offset) * 0.4;

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
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}
