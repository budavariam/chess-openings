import { useCallback } from "react";
import { toast as reactToast, ToastOptions } from "react-toastify";
import { useToastSettingsContext } from "../contexts/ToastSettingsContext";

/**
 * Custom toast hook that respects user settings for notifications
 * Wraps react-toastify with user preferences for enabled/disabled states and durations
 */
export function useToast() {
  const { shouldShowToast, getToastDuration } = useToastSettingsContext();

  const success = useCallback(
    (message: string, options?: ToastOptions) => {
      if (!shouldShowToast("success")) return;

      reactToast.success(message, {
        autoClose: getToastDuration("success"),
        ...options,
      });
    },
    [shouldShowToast, getToastDuration]
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => {
      if (!shouldShowToast("error")) return;

      reactToast.error(message, {
        autoClose: getToastDuration("error"),
        ...options,
      });
    },
    [shouldShowToast, getToastDuration]
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) => {
      if (!shouldShowToast("info")) return;

      reactToast.info(message, {
        autoClose: getToastDuration("info"),
        ...options,
      });
    },
    [shouldShowToast, getToastDuration]
  );

  return { success, error, info };
}
