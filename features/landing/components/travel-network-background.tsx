"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label?: string;
  pulsePhase: number;
}

interface Pulse {
  sourceIndex: number;
  targetIndex: number;
  progress: number;
  speed: number;
}

const WAYPOINT_CODES = [
  "DEL",
  "BOM",
  "IXL",
  "JAI",
  "COK",
  "VNS",
  "BLR",
  "GOI",
  "HYD",
  "MAA",
  "CCU",
  "SXR",
  "UDR",
  "JDH",
  "GAU",
  "TRV",
];

export function TravelNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const nodeCount = isMobile ? 22 : 46;
    const connectionDistance = isMobile ? 120 : 170;

    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 1.8,
        label: i < WAYPOINT_CODES.length ? WAYPOINT_CODES[i] : undefined,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    const pulses: Pulse[] = [];
    const maxPulses = isMobile ? 6 : 12;

    const createPulse = () => {
      if (pulses.length >= maxPulses || nodes.length < 2) return;
      const sourceIndex = Math.floor(Math.random() * nodes.length);
      const possibleTargets: number[] = [];

      for (let j = 0; j < nodes.length; j++) {
        if (sourceIndex === j) continue;
        const dx = nodes[sourceIndex].x - nodes[j].x;
        const dy = nodes[sourceIndex].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDistance) {
          possibleTargets.push(j);
        }
      }

      if (possibleTargets.length > 0) {
        const targetIndex =
          possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
        pulses.push({
          sourceIndex,
          targetIndex,
          progress: 0,
          speed: Math.random() * 0.008 + 0.006,
        });
      }
    };

    let pulseInterval = setInterval(createPulse, 800);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Update nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        node.pulsePhase += dt * 1.5;

        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
      }

      // Draw flight paths / network routes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.22;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(45, 155, 240, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Update and draw traveling flight pulses
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(p, 1);
          continue;
        }

        const source = nodes[pulse.sourceIndex];
        const target = nodes[pulse.targetIndex];
        if (!source || !target) {
          pulses.splice(p, 1);
          continue;
        }

        const px = source.x + (target.x - source.x) * pulse.progress;
        const py = source.y + (target.y - source.y) * pulse.progress;

        // Glowing pulse head
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(147, 197, 253, 0.9)";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw nodes and waypoint labels
      ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const pulseEffect = Math.sin(node.pulsePhase) * 0.4 + 0.6;

        // Outer glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 155, 240, ${0.12 * pulseEffect})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 230, 253, ${0.75 + pulseEffect * 0.25})`;
        ctx.fill();

        // Optional IATA / Waypoint Code
        if (node.label && !isMobile) {
          ctx.fillStyle = "rgba(148, 163, 184, 0.45)";
          ctx.fillText(node.label, node.x + 8, node.y - 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(pulseInterval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden dark:block"
    >
      {/* Rich ambient travel route gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(45,155,240,0.14),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_75%,rgba(14,165,233,0.08),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_15%_80%,rgba(99,102,241,0.06),transparent_65%)]" />

      {/* Dynamic Animated Travel Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-70"
      />
    </div>
  );
}
