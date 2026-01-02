import { useState, useCallback, useEffect } from "react";
import {
  ToastSettings,
  DEFAULT_TOAST_SETTINGS,
  migrateToastSettings,
} from "../types/toastSettings";

const STORAGE_KEY = "chess-openings-toast-settings";

export function useToastSettings() {
  const [settings, setSettings] = useState<ToastSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return migrateToastSettings(parsed);
      }
    } catch (error) {
      console.error("Failed to load toast settings:", error);
    }
    return DEFAULT_TOAST_SETTINGS;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save toast settings:", error);
    }
  }, [settings]);

  const updateSettings = useCallback(
    (updates: Partial<ToastSettings>) => {
      setSettings((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  const updateNotificationType = useCallback(
    (
      type: "success" | "error" | "info",
      updates: Partial<ToastSettings[typeof type]>
    ) => {
      setSettings((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          ...updates,
        },
      }));
    },
    []
  );

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_TOAST_SETTINGS);
  }, []);

  const shouldShowToast = useCallback(
    (type: "success" | "error" | "info"): boolean => {
      return settings[type].enabled;
    },
    [settings]
  );

  const getToastDuration = useCallback(
    (type: "success" | "error" | "info"): number => {
      return settings[type].duration;
    },
    [settings]
  );

  return {
    settings,
    updateSettings,
    updateNotificationType,
    resetToDefaults,
    shouldShowToast,
    getToastDuration,
  };
}
