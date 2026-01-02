import { useState } from "react";
import type { ToastSettings } from "../types/toastSettings";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ToastSettings;
  onUpdateNotificationType: (
    type: "success" | "error" | "info",
    updates: Partial<ToastSettings[typeof type]>
  ) => void;
  onReset: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateNotificationType,
  onReset,
}: SettingsModalProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    onReset();
    setShowResetConfirm(false);
  };

  const notificationTypes: Array<{
    key: "success" | "error" | "info";
    label: string;
    icon: string;
    description: string;
  }> = [
    {
      key: "success",
      label: "Success",
      icon: "✅",
      description: "Move played, favorites added, clipboard operations",
    },
    {
      key: "error",
      label: "Error",
      icon: "❌",
      description: "Invalid moves, failed actions, errors",
    },
    {
      key: "info",
      label: "Info",
      icon: "ℹ️",
      description: "Mode changes, navigation, general information",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Notification Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Customize which notifications you want to see
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Close"
            >
              <svg
                className="w-6 h-6 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {notificationTypes.map(({ key, label, icon, description }) => (
              <div
                key={key}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {label} Notifications
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onUpdateNotificationType(key, {
                        enabled: !settings[key].enabled,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings[key].enabled
                        ? "bg-blue-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings[key].enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Duration Control */}
                <div className="ml-11">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Duration: {(settings[key].duration / 1000).toFixed(1)}s
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1000"
                      max="10000"
                      step="500"
                      value={settings[key].duration}
                      onChange={(e) =>
                        onUpdateNotificationType(key, {
                          duration: parseInt(e.target.value),
                        })
                      }
                      disabled={!settings[key].enabled}
                      className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">
                      1s - 10s
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Version Info */}
            <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Settings Version: {settings.version}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            {!showResetConfirm ? (
              <>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Done
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to reset all settings?
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
