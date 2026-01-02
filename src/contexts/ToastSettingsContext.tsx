import { createContext, useContext, ReactNode } from "react";
import { useToastSettings } from "../hooks/useToastSettings";
import type { ToastSettings } from "../types/toastSettings";

interface ToastSettingsContextValue {
  settings: ToastSettings;
  updateSettings: (updates: Partial<ToastSettings>) => void;
  updateNotificationType: (
    type: "success" | "error" | "info",
    updates: Partial<ToastSettings[typeof type]>
  ) => void;
  resetToDefaults: () => void;
  shouldShowToast: (type: "success" | "error" | "info") => boolean;
  getToastDuration: (type: "success" | "error" | "info") => number;
}

const ToastSettingsContext = createContext<ToastSettingsContextValue | null>(
  null
);

export function ToastSettingsProvider({ children }: { children: ReactNode }) {
  const toastSettings = useToastSettings();

  return (
    <ToastSettingsContext.Provider value={toastSettings}>
      {children}
    </ToastSettingsContext.Provider>
  );
}

export function useToastSettingsContext() {
  const context = useContext(ToastSettingsContext);
  if (!context) {
    throw new Error(
      "useToastSettingsContext must be used within ToastSettingsProvider"
    );
  }
  return context;
}
