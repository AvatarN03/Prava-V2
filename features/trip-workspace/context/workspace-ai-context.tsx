"use client";

import { createContext, useContext, useState, ReactNode } from "react";

import { UserAiQuotaDTO } from "@/features/trip-workspace/ai/actions";

export interface ActiveTripContext {
  tripId: string;
  tripTitle: string;
  destination?: string | null;
}

interface WorkspaceAiContextType {
  isAiOpen: boolean;
  setIsAiOpen: (open: boolean) => void;
  toggleAi: () => void;
  openAi: () => void;
  closeAi: () => void;
  userQuota: UserAiQuotaDTO | null;
  setUserQuota: (quota: UserAiQuotaDTO | null) => void;
  activeTrip: ActiveTripContext | null;
  setActiveTrip: (trip: ActiveTripContext | null) => void;
  userAvatarUrl: string | null;
}

const WorkspaceAiContext = createContext<WorkspaceAiContextType | undefined>(undefined);

export function WorkspaceAiProvider({
  children,
  initialOpen = false,
  userAvatarUrl = null,
}: {
  children: ReactNode;
  initialOpen?: boolean;
  userAvatarUrl?: string | null;
}) {
  const [isAiOpen, setIsAiOpen] = useState(initialOpen);
  const [userQuota, setUserQuota] = useState<UserAiQuotaDTO | null>(null);
  const [activeTrip, setActiveTrip] = useState<ActiveTripContext | null>(null);

  const toggleAi = () => {
    setIsAiOpen((prev) => !prev);
  };

  const openAi = () => {
    setIsAiOpen(true);
  };

  const closeAi = () => {
    setIsAiOpen(false);
  };

  return (
    <WorkspaceAiContext.Provider
      value={{
        isAiOpen,
        setIsAiOpen,
        toggleAi,
        openAi,
        closeAi,
        userQuota,
        setUserQuota,
        activeTrip,
        setActiveTrip,
        userAvatarUrl,
      }}
    >
      {children}
    </WorkspaceAiContext.Provider>
  );
}

export function useWorkspaceAi() {
  const context = useContext(WorkspaceAiContext);
  if (!context) {
    throw new Error("useWorkspaceAi must be used within a WorkspaceAiProvider");
  }
  return context;
}
