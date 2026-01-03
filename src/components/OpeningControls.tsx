import type { Opening } from "../types";
import type { BoardOrientation } from "../types";
import { StyleSelector } from "./StyleSelector";

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
  logAction: (action: string, details?: Record<string, unknown>) => void;
  mode?: string;
  openingMovesCount?: number;
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
  mode = "practice",
  openingMovesCount = 0,
}: OpeningControlsProps) {
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
        mode === "explore"
          ? openingMovesCount !== 1
          : popularMovesIndex >=
            Math.max(matchedOpening?.moves?.length || 0, gameHistoryLength),
      title: mode === "explore" ? "Next move (only enabled when one move available)" : "Next move",
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

        <StyleSelector
          boardOrientation={boardOrientation}
          setBoardOrientation={setBoardOrientation}
          boardTheme={boardTheme}
          showCoordinates={showCoordinates}
          onThemeChange={onThemeChange}
          onCoordinatesToggle={onCoordinatesToggle}
          logAction={logAction}
        />
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
