"use client";

import { useEffect, useState } from "react";

import { LandingIntroLoader } from "./landing-intro-loader";

import { cn } from "@/lib/utils";

interface LandingContentWrapperProps {
  children: React.ReactNode;
}

export function LandingContentWrapper({ children }: LandingContentWrapperProps) {
  const [isDissolving, setIsDissolving] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);

  useEffect(() => {
    // Lock scroll to top and prevent browser scroll restoration from skipping the top
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    if (!isIntroComplete) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isIntroComplete]);

  const handleDissolve = () => {
    setIsDissolving(true);
    window.scrollTo(0, 0);
  };

  const handleComplete = () => {
    setIsIntroComplete(true);
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    window.scrollTo(0, 0);
  };

  return (
    <>
      {!isIntroComplete && (
        <LandingIntroLoader
          onDissolve={handleDissolve}
          onComplete={handleComplete}
        />
      )}

      <div
        id="prava-landing-root"
        className={cn(
          "transition-all duration-700 ease-out",
          !isDissolving
            ? "max-h-screen overflow-hidden opacity-0 scale-[0.99] filter blur-xs pointer-events-none invisible"
            : "min-h-screen opacity-100 scale-100 filter-none pointer-events-auto visible"
        )}
      >
        {children}
      </div>
    </>
  );
}

export default LandingContentWrapper;
