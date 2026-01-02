import React, { useMemo, useState } from "react";
import {
  Chessboard,
  ChessboardOptions,
  PieceDropHandlerArgs,
  SquareHandlerArgs,
} from "react-chessboard";
import { getLastMove } from "../utils/chessUtils";
import type { BoardOrientation } from "../types";

export interface BoardTheme {
  name: string;
  lightSquareStyle: React.CSSProperties;
  darkSquareStyle: React.CSSProperties;
  lastMoveHighlight: {
    from: React.CSSProperties;
    to: React.CSSProperties;
  };
}

const boardThemes: Record<string, BoardTheme> = {
  default: {
    name: "Default",
    lightSquareStyle: { backgroundColor: "#f0d9b5" },
    darkSquareStyle: { backgroundColor: "#b58863" },
    lastMoveHighlight: {
      from: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
      to: { backgroundColor: "rgba(255, 255, 0, 0.6)" },
    },
  },
  green: {
    name: "Green",
    lightSquareStyle: { backgroundColor: "#eeeed2" },
    darkSquareStyle: { backgroundColor: "#769656" },
    lastMoveHighlight: {
      from: { backgroundColor: "rgba(155, 199, 0, 0.4)" },
      to: { backgroundColor: "rgba(155, 199, 0, 0.6)" },
    },
  },
  blue: {
    name: "Blue",
    lightSquareStyle: { backgroundColor: "#dee3e6" },
    darkSquareStyle: { backgroundColor: "#8ca2ad" },
    lastMoveHighlight: {
      from: { backgroundColor: "rgba(70, 130, 180, 0.4)" },
      to: { backgroundColor: "rgba(70, 130, 180, 0.6)" },
    },
  },
  brown: {
    name: "Brown",
    lightSquareStyle: { backgroundColor: "#f5e6d3" },
    darkSquareStyle: { backgroundColor: "#8b4513" },
    lastMoveHighlight: {
      from: { backgroundColor: "rgba(255, 165, 0, 0.4)" },
      to: { backgroundColor: "rgba(255, 165, 0, 0.6)" },
    },
  },
  purple: {
    name: "Purple",
    lightSquareStyle: { backgroundColor: "#e8d5ff" },
    darkSquareStyle: { backgroundColor: "#9c27b0" },
    lastMoveHighlight: {
      from: { backgroundColor: "rgba(255, 193, 7, 0.4)" },
      to: { backgroundColor: "rgba(255, 193, 7, 0.6)" },
    },
  },
  pink: {
    name: "Pink",
    lightSquareStyle: { backgroundColor: "#fce4ec" },
    darkSquareStyle: { backgroundColor: "#e91e63" },
    lastMoveHighlight: {
      from: { backgroundColor: "rgba(76, 175, 80, 0.4)" },
      to: { backgroundColor: "rgba(76, 175, 80, 0.6)" },
    },
  },
};

interface ChessBoardProps {
  position: string;
  boardOrientation: BoardOrientation;
  onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
  onSquareClick?: (square: string) => void;
  game: any;
  children: React.ReactNode;
  showCoordinates?: boolean;
  boardTheme?: string;
  clickToMoveMode?: boolean;
  selectedSquare?: string | null;
  possibleMoves?: string[];
  captureMoves?: string[];
  piecesWithMoves?: string[];
}

export function ChessBoard({
  position,
  boardOrientation,
  onPieceDrop,
  onSquareClick,
  game,
  children,
  showCoordinates = true,
  boardTheme = "default",
  clickToMoveMode = false,
  selectedSquare = null,
  possibleMoves = [],
  captureMoves = [],
  piecesWithMoves = [],
}: ChessBoardProps) {
  const lastMove = getLastMove(game);
  const currentTheme = boardThemes[boardTheme] || boardThemes.default;
  const [showHelp, setShowHelp] = useState(false);

  console.log(
    "ChessBoard render - boardTheme:",
    boardTheme,
    "currentTheme:",
    currentTheme.name,
  );

  const customSquareStyles = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};

    if (lastMove) {
      styles[lastMove.from] = currentTheme.lastMoveHighlight.from;
      styles[lastMove.to] = currentTheme.lastMoveHighlight.to;
    }

    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: "rgba(255, 255, 0, 0.5)",
      };
    }

    // Highlight pieces with possible opening moves
    if (clickToMoveMode) {
      piecesWithMoves.forEach((square) => {
        if (square !== selectedSquare) {
          styles[square] = {
            backgroundColor: "rgba(155, 199, 0, 0.3)",
            border: "2px solid rgba(155, 199, 0, 0.6)",
          };
        }
      });
    }

    // Show circles for possible moves
    possibleMoves.forEach((square) => {
      styles[square] = {
        background:
          "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    });

    // Show larger rings for capture moves (more visible with pieces on top)
    captureMoves.forEach((square) => {
      styles[square] = {
        background:
          "radial-gradient(circle, transparent 0%, transparent 65%, rgba(0,0,0,.15) 65%, rgba(0,0,0,.15) 80%, transparent 80%)",
        borderRadius: "50%",
      };
    });

    return styles;
  }, [
    lastMove,
    currentTheme,
    selectedSquare,
    possibleMoves,
    captureMoves,
    piecesWithMoves,
    clickToMoveMode,
  ]);

  const chessboardKey = useMemo(
    () => `chessboard-${boardTheme}-${position}`,
    [boardTheme, position],
  );

  const chessboardOptions = useMemo(() => {
    const handleSquareClick = onSquareClick
      ? (args: SquareHandlerArgs) => onSquareClick(args.square)
      : undefined;

    const opts: ChessboardOptions = {
      boardOrientation: boardOrientation,
      position: position,
      onPieceDrop: clickToMoveMode ? () => false : onPieceDrop,
      onSquareClick: handleSquareClick,
      squareStyles: customSquareStyles,
      lightSquareStyle: currentTheme.lightSquareStyle,
      darkSquareStyle: currentTheme.darkSquareStyle,
      showNotation: showCoordinates,
      allowDrawingArrows: true,
      boardStyle: {
        width: "350px",
        height: "350px",
      },
      lightSquareNotationStyle: {
        fontSize: "12px",
        fontWeight: "bold",
        color: "#666",
      },
      darkSquareNotationStyle: {
        fontSize: "12px",
        fontWeight: "bold",
        color: "#666",
      },
    };
    return opts;
  }, [
    boardOrientation,
    position,
    onPieceDrop,
    onSquareClick,
    customSquareStyles,
    currentTheme.lightSquareStyle,
    currentTheme.darkSquareStyle,
    showCoordinates,
    clickToMoveMode,
  ]);

  return (
    <div className="flex justify-center lg:justify-start">
      <div className="relative shadow-xl rounded-2xl overflow-auto bg-white dark:bg-gray-800 p-3">
        {clickToMoveMode && (
          <div className="mb-2">
            <div className="px-3 py-2 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 rounded-lg text-sm text-green-800 dark:text-green-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">👆</span>
                <span className="font-medium">Click to Move Mode</span>
              </div>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 transition-colors"
                aria-label="Toggle help"
              >
                <span className="text-xs font-bold">?</span>
              </button>
            </div>
            {showHelp && (
              <div className="mt-1 px-3 py-2 bg-green-50 dark:bg-green-950/50 border border-green-300 dark:border-green-700 rounded-lg text-xs text-green-700 dark:text-green-400">
                Click highlighted pieces to select, then click a marked square
                to move
              </div>
            )}
          </div>
        )}
        <Chessboard key={chessboardKey} options={chessboardOptions} />
        {children}
      </div>
    </div>
  );
}

export { boardThemes };
