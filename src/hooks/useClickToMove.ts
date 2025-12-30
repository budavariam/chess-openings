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

  // Get all possible opening moves for current position
  const allOpeningMoves = useMemo(() => {
    if (!enabled || mode !== "practice") return [];

    const key = moveHistory.join("|");
    const moves = openingMovesIndex.get(key);
    return moves ? Array.from(moves) : [];
  }, [enabled, mode, moveHistory, openingMovesIndex]);

  // Calculate possible destination squares for selected piece
  const possibleMoves = useMemo(() => {
    if (!enabled || !selectedSquare || mode !== "practice") return [];

    const moves = game.moves({
      square: selectedSquare as Square,
      verbose: true,
    }) as Move[];

    return moves
      .filter((move) => allOpeningMoves.includes(move.san))
      .map((move) => move.to);
  }, [enabled, selectedSquare, game, mode, allOpeningMoves]);

  // Calculate which pieces have possible opening moves
  const piecesWithMoves = useMemo(() => {
    if (!enabled || mode !== "practice") return [];

    const squares: string[] = [];
    const allMoves = game.moves({ verbose: true }) as Move[];

    allMoves.forEach((move) => {
      if (allOpeningMoves.includes(move.san) && !squares.includes(move.from)) {
        squares.push(move.from);
      }
    });

    return squares;
  }, [enabled, game, mode, allOpeningMoves]);

  const onSquareClick = useCallback(
    (square: string) => {
      if (!enabled || mode !== "practice") return;

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
    [enabled, mode, selectedSquare, possibleMoves, game, onMove],
  );

  return {
    enabled,
    selectedSquare,
    possibleMoves,
    piecesWithMoves,
    toggleEnabled,
    onSquareClick,
  };
}
