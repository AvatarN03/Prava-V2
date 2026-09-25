"use client";

import { useEffect, useRef } from "react";

interface Waypoint {
  name: string;
  code: string;
  xPct: number;
  yPct: number;
  elevation: string;
  isPrimary?: boolean;
}

const NOTABLE_WAYPOINTS: Waypoint[] = [
  { name: "Ladakh", code: "IXL", xPct: 0.16, yPct: 0.24, elevation: "3,500M", isPrimary: true },
  { name: "Jaipur", code: "JAI", xPct: 0.38, yPct: 0.42, elevation: "430M" },
  { name: "Varanasi", code: "VNS", xPct: 0.62, yPct: 0.32, elevation: "80M", isPrimary: true },
  { name: "Kerala", code: "COK", xPct: 0.82, yPct: 0.58, elevation: "12M" },
];

export function HeroBackgroundPattern() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    // Pulse wave progress for traveling flight arcs
    let pulseProgress = 0;
    let waveTime = 0;

    const render = () => {
      waveTime += 0.012;
      pulseProgress = (pulseProgress + 0.004) % 1;

      ctx.clearRect(0, 0, width, height);

      // -----------------------------------------------------------
      // 1. Noticeable Cartographic Coordinate Grid
      // -----------------------------------------------------------
      const gridSize = 72;
      ctx.lineWidth = 1;

      // Fine grid lines
      ctx.strokeStyle = "rgba(148, 163, 184, 0.28)"; // clearly visible light-mode slate
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // High-contrast Crosshair markers at every intersection
      ctx.strokeStyle = "rgba(45, 155, 240, 0.75)"; // vivid Prava Cerulean
      ctx.lineWidth = 1.4;
      const crossSize = 5;

      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x - crossSize, y);
          ctx.lineTo(x + crossSize, y);
          ctx.moveTo(x, y - crossSize);
          ctx.lineTo(x, y + crossSize);
          ctx.stroke();
        }
      }

      // -----------------------------------------------------------
      // 2. Dynamic Topographic Mountain Contour Waves
      // -----------------------------------------------------------
      const contourTiers = [
        {
          yBase: height * 0.20,
          amp: 36,
          freq: 0.0022,
          speed: 0.7,
          color: "rgba(45, 155, 240, 0.65)", // strong cerulean
          width: 2.0,
          dashed: false,
          label: "CONTOUR 3,500M · PASS SUMMIT",
        },
        {
          yBase: height * 0.34,
          amp: 48,
          freq: 0.0018,
          speed: 1.0,
          color: "rgba(14, 165, 233, 0.55)", // vivid sky blue
          width: 1.6,
          dashed: true,
          label: "CONTOUR 2,400M",
        },
        {
          yBase: height * 0.48,
          amp: 54,
          freq: 0.0016,
          speed: 0.8,
          color: "rgba(71, 85, 105, 0.45)", // deep slate
          width: 1.4,
          dashed: false,
          label: "CONTOUR 1,800M · VALLEY RIDGE",
        },
        {
          yBase: height * 0.65,
          amp: 62,
          freq: 0.0014,
          speed: 1.1,
          color: "rgba(45, 155, 240, 0.50)",
          width: 1.5,
          dashed: true,
          label: "CONTOUR 1,200M",
        },
        {
          yBase: height * 0.80,
          amp: 42,
          freq: 0.0020,
          speed: 0.6,
          color: "rgba(100, 116, 139, 0.40)",
          width: 1.2,
          dashed: false,
          label: "CONTOUR 600M · FOOTHILLS",
        },
      ];

      ctx.font = "600 10px var(--font-sora), sans-serif";

      contourTiers.forEach((tier, index) => {
        ctx.beginPath();
        ctx.strokeStyle = tier.color;
        ctx.lineWidth = tier.width;

        if (tier.dashed) {
          ctx.setLineDash([8, 6]);
        } else {
          ctx.setLineDash([]);
        }

        const step = 12;
        let first = true;
        let midX = width * 0.45;
        let midY = 0;

        for (let x = -20; x <= width + 20; x += step) {
          const y =
            tier.yBase +
            Math.sin(x * tier.freq + waveTime * tier.speed) * tier.amp +
            Math.cos(x * tier.freq * 0.6 + waveTime * 0.4) * (tier.amp * 0.35);

          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }

          if (Math.abs(x - midX) < step) {
            midY = y;
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Contour Elevation Text Label
        if (width > 640 && index % 2 === 0) {
          ctx.fillStyle = tier.color;
          ctx.fillText(tier.label, midX + 20, midY - 6);
        }
      });

      // -----------------------------------------------------------
      // 3. Sweeping Navigational Flight Arc & Traveling Pulse
      // -----------------------------------------------------------
      const p1 = { x: width * 0.12, y: height * 0.62 };
      const cp1 = { x: width * 0.35, y: height * 0.12 };
      const cp2 = { x: width * 0.70, y: height * 0.18 };
      const p2 = { x: width * 0.92, y: height * 0.52 };

      // Great circle flight arc
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
      ctx.strokeStyle = "rgba(45, 155, 240, 0.45)";
      ctx.lineWidth = 2.0;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Calculate traveling pulse head using cubic bezier
      const t = pulseProgress;
      const invT = 1 - t;
      const pulseX =
        invT * invT * invT * p1.x +
        3 * invT * invT * t * cp1.x +
        3 * invT * t * t * cp2.x +
        t * t * t * p2.x;
      const pulseY =
        invT * invT * invT * p1.y +
        3 * invT * invT * t * cp1.y +
        3 * invT * t * t * cp2.y +
        t * t * t * p2.y;

      // Outer ripple
      ctx.beginPath();
      ctx.arc(pulseX, pulseY, 14, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(45, 155, 240, 0.40)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glowing pulse head
      ctx.beginPath();
      ctx.arc(pulseX, pulseY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#2D9BF0";
      ctx.shadowColor = "#38BDF8";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // -----------------------------------------------------------
      // 4. Cartographic Waypoints with Concentric Ripple Rings
      // -----------------------------------------------------------
      NOTABLE_WAYPOINTS.forEach((wp, wIdx) => {
        const wx = width * wp.xPct;
        const wy = height * wp.yPct;
        const pulsePhase = Math.sin(waveTime * 2 + wIdx * 1.5) * 0.5 + 0.5;

        // Concentric pulse circle
        ctx.beginPath();
        ctx.arc(wx, wy, 8 + pulsePhase * 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(45, 155, 240, ${0.45 - pulsePhase * 0.35})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Core waypoint point
        ctx.beginPath();
        ctx.arc(wx, wy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#2D9BF0";
        ctx.fill();

        // Waypoint Tag Badge
        if (width > 500) {
          ctx.fillStyle = "rgba(15, 23, 42, 0.85)"; // high contrast slate
          ctx.font = "600 11px var(--font-sora), sans-serif";
          ctx.fillText(`${wp.name} · ${wp.elevation}`, wx + 12, wy + 4);
        }
      });

      // -----------------------------------------------------------
      // 5. Prominent Navigational Compass Rose in Top-Right
      // -----------------------------------------------------------
      if (width > 768) {
        const cx = width - 110;
        const cy = 100;
        const r = 42;

        // Outer Ring
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(45, 155, 240, 0.45)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Inner Dashed Dial
        ctx.beginPath();
        ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(100, 116, 139, 0.35)";
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(cx, cy - r - 4);
        ctx.lineTo(cx, cy + r + 4);
        ctx.moveTo(cx - r - 4, cy);
        ctx.lineTo(cx + r + 4, cy);
        ctx.strokeStyle = "rgba(45, 155, 240, 0.55)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Cardinal Letters
        ctx.font = "700 10px var(--font-sora), sans-serif";
        ctx.fillStyle = "#2D9BF0";
        ctx.textAlign = "center";
        ctx.fillText("N", cx, cy - r + 11);
        ctx.fillStyle = "#475569";
        ctx.fillText("S", cx, cy + r - 3);
        ctx.fillText("E", cx + r - 8, cy + 4);
        ctx.fillText("W", cx - r + 8, cy + 4);
        ctx.textAlign = "left";

        // Center jewel
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#2D9BF0";
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      {/* Subtle Ambient Glows - Softened for light mode */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(45,155,240,0.08),transparent_75%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_90%_20%,rgba(245,158,11,0.04),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_10%_60%,rgba(45,155,240,0.05),transparent_65%)]" />

      {/* Dynamic Animated Canvas - High Contrast Light Mode Travel Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-100"
      />

      {/* Clean Bottom Gradient Mask */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FAFAF9] to-transparent pointer-events-none" />
    </div>
  );
}
