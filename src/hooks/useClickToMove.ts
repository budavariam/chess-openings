import { useState, useMemo, useCallback } from "react";
import { Chess, Square, Move } from "chess.js";
import { toast } from "react-toastify";

export interface ClickToMoveState {
  enabled: boolean;
  selectedSquare: string | null;
  possibleMoves: string[];
  piecesWithMoves: string[];
  toggleEnabled: () => void;
  onSquareClick: (square: string) => void;
}

export function useClickToMove(
  game: Chess,
  mode: string,
  openingMovesIndex: Map<string, Set<string>>,
  moveHistory: string[],
  onMove: (from: string, to: string) => void,
): ClickToMoveState {
  const [enabled, setEnabled] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => !prev);
    setSelectedSquare(null);
    toast.success(`${!enabled ? "Enabled" : "Disabled"} click-to-move mode`);
  }, [enabled]);

  const isActive = mode === "explore";

  const allOpeningMoves = useMemo(() => {
    if (!isActive) return [];

    const key = moveHistory.join("|");
    const moves = openingMovesIndex.get(key);
    const result = moves ? Array.from(moves) : [];

    console.log("[useClickToMove] Opening moves lookup:", {
      moveHistory,
      key,
      foundMoves: result.length,
      moves: result,
      indexSize: openingMovesIndex.size,
    });

    return result;
  }, [isActive, moveHistory, openingMovesIndex]);

  const possibleMoves = useMemo(() => {
    if (!isActive || !selectedSquare) return [];

    const moves = game.moves({
      square: selectedSquare as Square,
      verbose: true,
    }) as Move[];

    return moves
      .filter((move) => allOpeningMoves.includes(move.san))
      .map((move) => move.to);
  }, [isActive, selectedSquare, game, allOpeningMoves]);

  const piecesWithMoves = useMemo(() => {
    if (!isActive) return [];

    const squares: string[] = [];
    const allMoves = game.moves({ verbose: true }) as Move[];

    allMoves.forEach((move) => {
      if (allOpeningMoves.includes(move.san) && !squares.includes(move.from)) {
        squares.push(move.from);
      }
    });

    return squares;
  }, [isActive, game, allOpeningMoves]);

  const onSquareClick = useCallback(
    (square: string) => {
      if (!isActive) return;

      const piece = game.get(square as Square);

      if (selectedSquare && possibleMoves.includes(square as Square)) {
        onMove(selectedSquare, square);
        setSelectedSquare(null);
        return;
      }

      if (piece) {
        const isOurTurn =
          (game.turn() === "w" && piece.color === "w") ||
          (game.turn() === "b" && piece.color === "b");

        if (isOurTurn) {
          setSelectedSquare(square);
        }
        return;
      }

      if (selectedSquare) {
        setSelectedSquare(null);
      }
    },
    [isActive, selectedSquare, possibleMoves, game, onMove],
  );

  return {
    enabled,
    selectedSquare: isActive ? selectedSquare : null,
    possibleMoves: isActive ? possibleMoves : [],
    piecesWithMoves: isActive ? piecesWithMoves : [],
    toggleEnabled,
    onSquareClick,
  };
}
