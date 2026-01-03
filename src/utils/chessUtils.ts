import { Chess } from "chess.js";

export function calculatePopularity(data: any): number {
  if (data.src === "eco_tsv") return 100; // Lichess data is most authoritative
  if (data.isEcoRoot) return 95; // Root variations are important
  if (data.src === "eco_js") return 80;
  if (data.src === "scid") return 70;
  if (data.src === "eco_wikip") return 60;
  if (data.src === "interpolated") return 30; // Lower priority for gap-filling
  return 25;
}

export function parseMovesString(movesStr: string): string[] {
  if (!movesStr) return [];

  let normalized = movesStr
    .replace(/(\d+)\./g, '$1. ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized.split(/\s+/).filter((move: string) => {
    const trimmed = move.trim();
    return trimmed && !trimmed.match(/^\d+\.+$/);
  });
}

export function formatMovesAsChessNotation(moves: string[], maxMoves?: number): string {
  if (!moves || moves.length === 0) return "";

  const movesToShow = maxMoves ? moves.slice(0, maxMoves) : moves;
  const pairs: string[] = [];

  for (let i = 0; i < movesToShow.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = movesToShow[i];
    const blackMove = movesToShow[i + 1];

    if (blackMove) {
      pairs.push(`${moveNumber}.${whiteMove} ${blackMove}`);
    } else {
      pairs.push(`${moveNumber}.${whiteMove}`);
    }
  }

  return pairs.join(" ");
}

// Get last move for highlighting
export function getLastMove(game: any): { from: string; to: string } | null {
  const history = game.history({ verbose: true });
  if (history.length === 0) return null;

  const lastMove = history[history.length - 1];
  return {
    from: lastMove.from,
    to: lastMove.to,
  };
}

// Create a new chess game instance
export function createChessGame(): any {
  return new Chess();
}

// Make a move on the chess game
export function makeChessMove(
  game: any,
  move: string | { from: string; to: string; promotion?: string },
): any | null {
  try {
    return game.move(move);
  } catch {
    return null;
  }
}

// Undo last move
export function undoMove(game: any): any | null {
  try {
    return game.undo();
  } catch {
    return null;
  }
}
