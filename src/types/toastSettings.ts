/**
 * Toast Settings with semantic versioning for future migrations
 * Version format: MAJOR.MINOR.PATCH
 * - MAJOR: Breaking changes to settings structure
 * - MINOR: New settings added (backward compatible)
 * - PATCH: Bug fixes or value adjustments
 */

export const TOAST_SETTINGS_VERSION = "1.0.0";

export interface ToastNotificationSettings {
  enabled: boolean;
  duration: number; // in milliseconds
}

export interface ToastSettings {
  version: string;
  success: ToastNotificationSettings;
  error: ToastNotificationSettings;
  info: ToastNotificationSettings;
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
};

/**
 * Migration function for future settings version changes
 * Add new migration cases when MAJOR version changes
 */
export function migrateToastSettings(
  savedSettings: any
): ToastSettings {
  // If no version or invalid format, return defaults
  if (!savedSettings || typeof savedSettings !== "object") {
    return DEFAULT_TOAST_SETTINGS;
  }

  const savedVersion = savedSettings.version || "0.0.0";
  const [savedMajor] = savedVersion.split(".").map(Number);
  const [currentMajor] = TOAST_SETTINGS_VERSION.split(".").map(Number);

  // If saved version is current, validate and return
  if (savedVersion === TOAST_SETTINGS_VERSION) {
    return validateToastSettings(savedSettings);
  }

  // Future migration logic goes here
  // Example:
  // if (savedMajor < 2) {
  //   return migrateV1ToV2(savedSettings);
  // }

  // For now, if major version differs, reset to defaults
  if (savedMajor !== currentMajor) {
    console.warn(
      `Toast settings version mismatch. Resetting to defaults. Saved: ${savedVersion}, Current: ${TOAST_SETTINGS_VERSION}`
    );
    return DEFAULT_TOAST_SETTINGS;
  }

  // Validate and fill in any missing fields
  return validateToastSettings(savedSettings);
}

/**
 * Validates and fills in missing fields from saved settings
 */
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
  };
}
