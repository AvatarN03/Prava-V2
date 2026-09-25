"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

interface LandingIntroLoaderProps {
  onDissolve?: () => void;
  onComplete?: () => void;
}

export function LandingIntroLoader({ onDissolve, onComplete }: LandingIntroLoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [stage, setStage] = useState<"initial" | "brand" | "slide-tag" | "dissolve">("initial");

  const onDissolveRef = useRef(onDissolve);
  onDissolveRef.current = onDissolve;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Stage 1: Brand Logo & Name appear smoothly
    const t1 = setTimeout(() => {
      setStage("brand");
    }, 100);

    // Stage 2: "Travel Workspace" slides from center to right
    const t2 = setTimeout(() => {
      setStage("slide-tag");
    }, 420);

    // Stage 3: Smooth dissolve transition starts
    const t3 = setTimeout(() => {
      setStage("dissolve");
      setIsVisible(false);
      onDissolveRef.current?.();
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={() => onCompleteRef.current?.()}>
      {isVisible && (
        <motion.div
          key="prava-intro-overlay"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            filter: "blur(6px)",
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070B12] text-zinc-50 overflow-hidden select-none pointer-events-auto touch-none"
        >
          {/* Ambient Cerulean Radial Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(45, 155, 240, 0.16) 0%, rgba(7, 11, 18, 0) 65%)",
            }}
          />

          {/* Subtle Cartographic Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

          {/* Central Brand Composition */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Logo and Brand Name Row */}
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4"
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  initial={{ rotate: -15, scale: 0.75, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                  className="relative z-10"
                >
                  <Image
                    src="/logo.png"
                    alt="Prava Logo"
                    width={48}
                    height={48}
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-[0_0_24px_rgba(45,155,240,0.5)]"
                    priority
                  />
                </motion.div>
                {/* Glowing Aura Ring */}
                <div className="absolute inset-0 -m-2 rounded-full bg-[#2D9BF0]/25 blur-lg pointer-events-none" />
              </div>

              <span className="font-brand font-medium tracking-[0.32em] text-3xl sm:text-4xl uppercase text-zinc-50 drop-shadow-sm">
                Prava
              </span>
            </motion.div>

            {/* "Travel Workspace" sliding from center to right */}
            <div className="relative mt-3.5 h-6 flex items-center overflow-hidden">
              <motion.div
                initial={{ x: -26, opacity: 0 }}
                animate={
                  stage === "slide-tag" || stage === "dissolve"
                    ? { x: 0, opacity: 1 }
                    : { x: -26, opacity: 0 }
                }
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2.5"
              >
                {/* Animated Horizontal Guide Line */}
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={
                    stage === "slide-tag" || stage === "dissolve"
                      ? { width: 30, opacity: 1 }
                      : { width: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="h-px bg-gradient-to-r from-transparent via-[#2D9BF0] to-[#2D9BF0]"
                />

                <span className="font-sans text-[11px] sm:text-xs font-semibold tracking-[0.36em] uppercase text-[#2D9BF0]">
                  Travel Workspace
                </span>

                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={
                    stage === "slide-tag" || stage === "dissolve"
                      ? { width: 18, opacity: 0.7 }
                      : { width: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
                  className="h-px bg-gradient-to-r from-[#2D9BF0] to-transparent"
                />
              </motion.div>
            </div>
          </div>

          {/* Minimalist Bottom Horizon Progress Meter */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-36 h-0.5 bg-zinc-800/80 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full w-full bg-gradient-to-r from-transparent via-[#2D9BF0] to-sky-300"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LandingIntroLoader;
