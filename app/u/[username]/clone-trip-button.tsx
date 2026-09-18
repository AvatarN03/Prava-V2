"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cloneTripTemplate } from "@/features/templates/actions";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";

interface CloneTripButtonProps {
  tripId: string;
  tripTitle: string;
}

export function CloneTripButton({ tripId }: CloneTripButtonProps) {
  const router = useRouter();
  const [isCloning, startCloning] = useTransition();

  const handleClone = () => {
    startCloning(async () => {
      const res = await cloneTripTemplate(tripId);
      if (res.success && res.tripId) {
        router.push(`/trips/${res.tripId}/overview`);
      } else {
        alert(res.error || "Failed to clone trip. Please sign in.");
      }
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      className="h-7 px-2.5 text-xs font-semibold gap-1.5 shadow-xs"
      onClick={handleClone}
      disabled={isCloning}
    >
      {isCloning ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      Clone to My Trips
    </Button>
  );
}
