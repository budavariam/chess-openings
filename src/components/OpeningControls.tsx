import { useState, useRef, useEffect, CSSProperties } from "react";
import type { Opening } from "../types";
import type { BoardOrientation } from "../types";
import { boardThemes } from "../components/ChessBoard";
import { toast } from "react-toastify";

interface OpeningControlsProps {
  isPlayingOpening: boolean;
  matchedOpening: Opening | null;
  popularMovesIndex: number;
  onNavigate: (index: number) => void;
  gameHistoryLength?: number;
  boardOrientation: BoardOrientation;
  setBoardOrientation: (orientation: BoardOrientation) => void;
  boardTheme?: string;
  showCoordinates?: boolean;
  onThemeChange?: (theme: string) => void;
  onCoordinatesToggle?: (show: boolean) => void;
  logAction: (action: string, details?: any) => void;
}

type NavigationAction = "start" | "back" | "forward" | "end";

export function OpeningControls({
  isPlayingOpening,
  matchedOpening,
  popularMovesIndex,
  onNavigate,
  gameHistoryLength = 0,
  boardOrientation,
  setBoardOrientation,
  boardTheme = "default",
  showCoordinates = true,
  onThemeChange,
  onCoordinatesToggle,
  logAction,
}: OpeningControlsProps) {
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<CSSProperties>(
    {},
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOrientationChange = (orientation: BoardOrientation) => {
    setBoardOrientation(orientation);
    logAction(`Board orientation changed to ${orientation}`);
    toast.info(`Board flipped to ${orientation} perspective`);
    setShowStyleSelector(false);
  };

  const calculateDropdownPosition = () => {
    if (!buttonRef.current || !dropdownRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdownElement = dropdownRef.current;
    const dropdownWidth = 160;
    const margin = 8;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // Temporarily show dropdown to measure its height
    dropdownElement.style.visibility = "hidden";
    dropdownElement.style.display = "block";
    const dropdownHeight = dropdownElement.scrollHeight;
    dropdownElement.style.display = "none";
    dropdownElement.style.visibility = "visible";

    // Calculate available space above and below button
    const spaceBelow = windowHeight - buttonRect.bottom - margin;
    const spaceAbove = buttonRect.top - margin;

    // Decide whether to open upwards or downwards
    const openUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    // Calculate maximum height based on available space
    const maxHeight = openUpwards
      ? Math.min(dropdownHeight, spaceAbove - margin)
      : Math.min(dropdownHeight, spaceBelow - margin);

    // Calculate horizontal position (centered on button, but within window bounds)
    const idealLeft =
      buttonRect.left + buttonRect.width / 2 - dropdownWidth / 2;
    const left = Math.max(
      margin,
      Math.min(idealLeft, windowWidth - dropdownWidth - margin),
    );

    // Calculate vertical position
    const top = openUpwards
      ? buttonRect.top - maxHeight - margin
      : buttonRect.bottom + margin;

    setDropdownPosition({
      position: "fixed",
      top,
      left,
      width: dropdownWidth,
      maxHeight,
      overflowY: dropdownHeight > maxHeight ? "auto" : "visible",
    });
  };

  useEffect(() => {
    if (showStyleSelector) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(calculateDropdownPosition, 0);
      return () => clearTimeout(timer);
    }
  }, [showStyleSelector]);

  const handleNavigation = (action: NavigationAction) => {
    const maxMoves = matchedOpening?.moves?.length || 0;
    const maxIndex = Math.max(maxMoves, gameHistoryLength);

    let targetIndex: number;
    switch (action) {
      case "start":
        targetIndex = 0;
        break;
      case "back":
        targetIndex = Math.max(0, popularMovesIndex - 1);
        break;
      case "forward":
        targetIndex = Math.min(maxIndex, popularMovesIndex + 1);
        break;
      case "end":
        targetIndex = maxIndex;
        break;
    }

    console.log("[OpeningControls] Navigation:", {
      action,
      currentIndex: popularMovesIndex,
      targetIndex,
      maxMoves,
      gameHistoryLength,
      maxIndex,
    });

    onNavigate(targetIndex);
  };

  const navigationButtons = [
    {
      id: "start",
      label: "⏮",
      action: "start" as NavigationAction,
      disabled: popularMovesIndex === 0,
      title: "Go to start",
      primary: false,
    },
    {
      id: "back",
      label: "⏪",
      action: "back" as NavigationAction,
      disabled: popularMovesIndex === 0,
      title: "Previous move",
      primary: false,
    },
    {
      id: "forward",
      label: "⏩",
      action: "forward" as NavigationAction,
      disabled:
        popularMovesIndex >=
        Math.max(matchedOpening?.moves?.length || 0, gameHistoryLength),
      title: "Next move",
      primary: true,
    },
    {
      id: "end",
      label: "⏭",
      action: "end" as NavigationAction,
      disabled: false,
      title: "Go to end",
      primary: false,
    },
  ] as const;

  const StyleSelector = () => (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowStyleSelector(!showStyleSelector)}
        className="px-4 py-2 rounded text-sm font-medium transition-colors bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100"
        title="Board settings"
      >
        🎨
      </button>

      {showStyleSelector && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowStyleSelector(false)}
          />
          <div
            ref={dropdownRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 py-2 z-50"
            style={dropdownPosition}
          >
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Board Settings
            </div>

            <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-600 mb-2">
              Orientation
            </div>

            <button
              onClick={() => handleOrientationChange("white")}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                boardOrientation === "white"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              <span>♔ White</span>
              {boardOrientation === "white" && (
                <span className="text-blue-600 dark:text-blue-400 text-xs">
                  ✓
                </span>
              )}
            </button>

            <button
              onClick={() => handleOrientationChange("black")}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                boardOrientation === "black"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              <span>♚ Black</span>
              {boardOrientation === "black" && (
                <span className="text-blue-600 dark:text-blue-400 text-xs">
                  ✓
                </span>
              )}
            </button>

            <hr className="my-2 border-gray-200 dark:border-gray-600" />

            <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Themes
            </div>

            {Object.entries(boardThemes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => {
                  onThemeChange?.(key);
                  setShowStyleSelector(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  boardTheme === key
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex">
                  <div
                    className="w-3 h-3 border border-gray-300 dark:border-gray-500"
                    style={theme.lightSquareStyle}
                  />
                  <div
                    className="w-3 h-3 border border-gray-300 dark:border-gray-500"
                    style={theme.darkSquareStyle}
                  />
                </div>
                <span className="flex-1">{theme.name}</span>
                {boardTheme === key && (
                  <span className="text-blue-600 dark:text-blue-400 text-xs">
                    ✓
                  </span>
                )}
              </button>
            ))}

            <hr className="my-2 border-gray-200 dark:border-gray-600" />

            <button
              onClick={() => {
                onCoordinatesToggle?.(!showCoordinates);
                setShowStyleSelector(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              <span>Coordinates</span>
              <span
                className={`text-xs ${showCoordinates ? "text-green-600" : "text-gray-400"}`}
              >
                {showCoordinates ? "✓" : "○"}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  const hideControls = !isPlayingOpening || !matchedOpening;
  const currentMoves = matchedOpening?.moves || [];
  const hasNextMove = popularMovesIndex < currentMoves.length;
  const canNavigate = isPlayingOpening || gameHistoryLength > 0;

  return (
    <div className="mt-4 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex gap-2 justify-center mb-3 flex-wrap">
        {navigationButtons.map((button) => (
          <button
            key={button.id}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              button.primary
                ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
                : "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => handleNavigation(button.action)}
            disabled={button.disabled || !canNavigate}
            title={button.title}
          >
            {button.id === "forward" && hasNextMove
              ? currentMoves[popularMovesIndex]
              : button.label}
          </button>
        ))}

        <StyleSelector />
      </div>

      <div className="flex justify-center">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {popularMovesIndex} /{" "}
          {Math.max(currentMoves.length, gameHistoryLength)}
        </div>
      </div>

      {import.meta.env.DEV && (
        <details className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
            Debug Info
          </summary>
          <div className="mt-2 space-y-1 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {hideControls && (
              <>
                <div>Debug: Controls not showing</div>
                <div>• isPlayingOpening: {String(isPlayingOpening)}</div>
                <div>• hasMatchedOpening: {String(!!matchedOpening)}</div>
                <div>• popularMovesIndex: {popularMovesIndex}</div>
                <div>• gameHistoryLength: {gameHistoryLength}</div>
              </>
            )}
            {!hideControls && (
              <>
                <div>Opening: {matchedOpening.name}</div>
                <div>Moves count: {currentMoves.length}</div>
                <div>Current index: {popularMovesIndex}</div>
                <div>Game history: {gameHistoryLength}</div>
                <div>Has next: {String(hasNextMove)}</div>
              </>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
