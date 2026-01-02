/**
 * Toast Settings with semantic versioning for future migrations
 * Version format: MAJOR.MINOR.PATCH
 * - MAJOR: Breaking changes to settings structure
 * - MINOR: New settings added (backward compatible)
 * - PATCH: Bug fixes or value adjustments
 */

export const TOAST_SETTINGS_VERSION = "1.1.0";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastNotificationSettings {
  enabled: boolean;
  duration: number;
}

export interface ToastSettings {
  version: string;
  success: ToastNotificationSettings;
  error: ToastNotificationSettings;
  info: ToastNotificationSettings;
  position: ToastPosition;
  showProgressBar: boolean;
  pauseOnHover: boolean;
  closeOnClick: boolean;
  newestOnTop: boolean;
}

export const DEFAULT_TOAST_SETTINGS: ToastSettings = {
  version: TOAST_SETTINGS_VERSION,
  success: {
    enabled: true,
    duration: 3000,
  },
  error: {
    enabled: true,
    duration: 5000,
  },
  info: {
    enabled: true,
    duration: 3000,
  },
  position: "bottom-right",
  showProgressBar: true,
  pauseOnHover: true,
  closeOnClick: true,
  newestOnTop: false,
};

export function migrateToastSettings(
  savedSettings: any
): ToastSettings {
  if (!savedSettings || typeof savedSettings !== "object") {
    return DEFAULT_TOAST_SETTINGS;
  }

  const savedVersion = savedSettings.version || "0.0.0";
  const [savedMajor] = savedVersion.split(".").map(Number);
  const [currentMajor] = TOAST_SETTINGS_VERSION.split(".").map(Number);

  if (savedVersion === TOAST_SETTINGS_VERSION) {
    return validateToastSettings(savedSettings);
  }

  if (savedMajor !== currentMajor) {
    console.warn(
      `Toast settings version mismatch. Resetting to defaults. Saved: ${savedVersion}, Current: ${TOAST_SETTINGS_VERSION}`
    );
    return DEFAULT_TOAST_SETTINGS;
  }

  return validateToastSettings(savedSettings);
}

function validateToastSettings(
  settings: Partial<ToastSettings>
): ToastSettings {
  return {
    version: TOAST_SETTINGS_VERSION,
    success: {
      enabled:
        settings.success?.enabled ?? DEFAULT_TOAST_SETTINGS.success.enabled,
      duration:
        settings.success?.duration ?? DEFAULT_TOAST_SETTINGS.success.duration,
    },
    error: {
      enabled:
        settings.error?.enabled ?? DEFAULT_TOAST_SETTINGS.error.enabled,
      duration:
        settings.error?.duration ?? DEFAULT_TOAST_SETTINGS.error.duration,
    },
    info: {
      enabled: settings.info?.enabled ?? DEFAULT_TOAST_SETTINGS.info.enabled,
      duration: settings.info?.duration ?? DEFAULT_TOAST_SETTINGS.info.duration,
    },
    position: settings.position ?? DEFAULT_TOAST_SETTINGS.position,
    showProgressBar:
      settings.showProgressBar ?? DEFAULT_TOAST_SETTINGS.showProgressBar,
    pauseOnHover: settings.pauseOnHover ?? DEFAULT_TOAST_SETTINGS.pauseOnHover,
    closeOnClick: settings.closeOnClick ?? DEFAULT_TOAST_SETTINGS.closeOnClick,
    newestOnTop: settings.newestOnTop ?? DEFAULT_TOAST_SETTINGS.newestOnTop,
  };
}
