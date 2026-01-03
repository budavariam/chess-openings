import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { ToastSettingsProvider } from "./contexts/ToastSettingsContext";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <ToastSettingsProvider>
        <App />
      </ToastSettingsProvider>
    </HashRouter>
  </React.StrictMode>,
);
