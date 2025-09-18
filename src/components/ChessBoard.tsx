import React, { useMemo } from "react";
import {
  Chessboard,
  ChessboardOptions,
  PieceDropHandlerArgs,
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
  game: any;
  children: React.ReactNode;
  showCoordinates?: boolean;
  boardTheme?: string;
}

export function ChessBoard({
  position,
  boardOrientation,
  onPieceDrop,
  game,
  children,
  showCoordinates = true,
  boardTheme = "default",
}: ChessBoardProps) {
  const lastMove = getLastMove(game);
  const currentTheme = boardThemes[boardTheme] || boardThemes.default;

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

    return styles;
  }, [lastMove, currentTheme]);

  const chessboardKey = useMemo(
    () => `chessboard-${boardTheme}-${position}`,
    [boardTheme, position],
  );

  const chessboardOptions = useMemo(() => {
    const opts: ChessboardOptions = {
      boardOrientation: boardOrientation,
      position: position,
      onPieceDrop: onPieceDrop,
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
    customSquareStyles,
    currentTheme.lightSquareStyle,
    currentTheme.darkSquareStyle,
    showCoordinates,
  ]);

  return (
    <div className="flex justify-center lg:justify-start">
      <div className="relative shadow-xl rounded-2xl overflow-auto bg-white dark:bg-gray-800 p-3">
        <Chessboard key={chessboardKey} options={chessboardOptions} />
        {children}
      </div>
    </div>
  );
}

export { boardThemes };
