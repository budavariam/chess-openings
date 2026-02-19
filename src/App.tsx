import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ChessPractice from "./ChessPractice";
import { Footer } from "./components/Footer";
import { SettingsModal } from "./components/SettingsModal";
import { LandingPage } from "./components/LandingPage";
import { useToastSettingsContext } from "./contexts/ToastSettingsContext";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved !== null) {
        return saved === "dark";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    settings,
    updateSettings,
    updateNotificationType,
    resetToDefaults,
  } = useToastSettingsContext();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <div className="min-h-screen min-w-[320px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="min-w-[320px] p-3 sm:p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2 sm:gap-4">
          {location.pathname !== "/" && (
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
              title="Home"
            >
              🏠
            </button>
          )}
          <h1 className="text-lg sm:text-2xl font-semibold truncate pr-2">
            Chess Openings Trainer
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
            title="Settings"
          >
            ⚙️
          </button>
          <button
            onClick={() => {
              setDark((d) => {
                const next = !d;
                try {
                  localStorage.setItem("theme", next ? "dark" : "light");
                } catch {
                  // Ignore localStorage errors
                }
                return next;
              });
            }}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
            title="Toggle dark mode"
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>
      <main className="min-w-[320px] p-3 sm:p-6">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/practice" element={<ChessPractice />} />
          <Route path="/explore" element={<ChessPractice />} />
          <Route path="/search" element={<ChessPractice />} />
          <Route path="/popular" element={<ChessPractice />} />
          <Route path="/favourites" element={<ChessPractice />} />
          <Route path="/sight-training" element={<ChessPractice />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer
        position={settings.position}
        autoClose={3000}
        hideProgressBar={!settings.showProgressBar}
        newestOnTop={settings.newestOnTop}
        closeOnClick={settings.closeOnClick}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={settings.pauseOnHover}
        theme={dark ? "dark" : "light"}
        className="!w-auto !max-w-[calc(100vw-1rem)] !min-w-[280px]"
        toastClassName="!text-sm !min-w-[280px]"
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateNotificationType={updateNotificationType}
        onUpdateSettings={updateSettings}
        onReset={resetToDefaults}
      />
    </div>
  );
}
