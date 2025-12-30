import { useReducer, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
import { toast } from "react-toastify";
import type { Opening, ChessMode, BoardOrientation } from "../types";

interface GameState {
  game: Chess;
  mode: ChessMode;
  moveHistory: string[];
  matchedOpening: Opening | null;
  popularIndex: number;
  popularMovesIndex: number;
  isPlayingOpening: boolean;
  searchQuery: string;
  searchResults: Opening[];
  boardOrientation: BoardOrientation;
}

type GameAction =
  | {
      type: "SET_GAME_STATE";
      payload: {
        game: Chess;
        moveHistory: string[];
        popularMovesIndex: number;
      };
    }
  | {
      type: "NAVIGATE_TO_INDEX";
      payload: {
        game: Chess;
        popularMovesIndex: number;
      };
    }
  | { type: "SET_MODE"; payload: ChessMode }
  | { type: "SET_MATCHED_OPENING"; payload: Opening | null }
  | { type: "SET_POPULAR_INDEX"; payload: number }
  | { type: "SET_IS_PLAYING_OPENING"; payload: boolean }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SEARCH_RESULTS"; payload: Opening[] }
  | { type: "SET_BOARD_ORIENTATION"; payload: BoardOrientation }
  | { type: "RESET_GAME" }
  | { type: "EXIT_OPENING_STUDY" };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_GAME_STATE":
      return {
        ...state,
        game: action.payload.game,
        moveHistory: action.payload.moveHistory,
        popularMovesIndex: action.payload.popularMovesIndex,
      };
    case "NAVIGATE_TO_INDEX":
      return {
        ...state,
        game: action.payload.game,
        popularMovesIndex: action.payload.popularMovesIndex,
      };
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "SET_MATCHED_OPENING":
      return { ...state, matchedOpening: action.payload };
    case "SET_POPULAR_INDEX":
      return { ...state, popularIndex: action.payload };
    case "SET_IS_PLAYING_OPENING":
      return { ...state, isPlayingOpening: action.payload };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "SET_SEARCH_RESULTS":
      return { ...state, searchResults: action.payload };
    case "SET_BOARD_ORIENTATION":
      return { ...state, boardOrientation: action.payload };
    case "RESET_GAME":
      return {
        ...state,
        game: new Chess(),
        moveHistory: [],
        matchedOpening: null,
        popularMovesIndex: 0,
        isPlayingOpening: false,
      };
    case "EXIT_OPENING_STUDY":
      return {
        ...state,
        isPlayingOpening: false,
        popularMovesIndex: 0,
      };
    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, {
    game: new Chess(),
    mode: "practice" as ChessMode,
    moveHistory: [],
    matchedOpening: null,
    popularIndex: 0,
    popularMovesIndex: 0,
    isPlayingOpening: false,
    searchQuery: "",
    searchResults: [],
    boardOrientation: "white" as BoardOrientation,
  });

  const updateGameState = useCallback((game: Chess, safeIndex?: number) => {
    const moveHistory = [...game.history()];
    const popularMovesIndex = safeIndex ?? moveHistory.length;

    dispatch({
      type: "SET_GAME_STATE",
      payload: { game, moveHistory, popularMovesIndex },
    });
  }, []);

  const makeMove = useCallback(
    (moveStr: string): boolean => {
      try {
        const g = new Chess(state.game.fen());
        const move = g.move(moveStr);
        if (move) {
          updateGameState(g);
          toast.success(`Played ${move.san}`);

          if (state.isPlayingOpening) {
            dispatch({ type: "EXIT_OPENING_STUDY" });
            toast.info("Exited opening study mode");
          }
          return true;
        } else {
          toast.error(`Invalid move: ${moveStr}`);
          return false;
        }
      } catch (error: any) {
        toast.error(`Move failed: ${error.message}`);
        return false;
      }
    },
    [state.game, state.isPlayingOpening, updateGameState],
  );

  const navigateToMove = useCallback(
    (targetIndex: number, popularSorted: Opening[]) => {
      try {
        // If playing an opening, navigate through opening moves
        if (state.isPlayingOpening) {
          const chosen =
            state.matchedOpening || popularSorted[state.popularIndex];

          if (!chosen) {
            toast.error("No opening selected");
            return;
          }

          const maxMoves = chosen.moves.length;
          const safeIndex = Math.max(0, Math.min(targetIndex, maxMoves));

          const g = new Chess();
          for (let i = 0; i < safeIndex; i++) {
            if (i < chosen.moves.length) {
              const move = g.move(chosen.moves[i]);
              if (!move) {
                console.error("Failed to apply move during navigation:", {
                  moveIndex: i,
                  move: chosen.moves[i],
                });
                break;
              }
            }
          }

          updateGameState(g, safeIndex);

          if (safeIndex === 0) {
            toast.info("Moved to start position");
          } else {
            toast.info(`Moved to ${chosen.moves[safeIndex - 1]}`);
          }
          return;
        }

        // In practice/explore mode, navigate through move history
        if (state.moveHistory.length > 0) {
          const safeIndex = Math.max(
            0,
            Math.min(targetIndex, state.moveHistory.length),
          );

          const g = new Chess();
          for (let i = 0; i < safeIndex; i++) {
            if (i < state.moveHistory.length) {
              const move = g.move(state.moveHistory[i]);
              if (!move) {
                console.error("Failed to apply move during navigation:", {
                  moveIndex: i,
                  move: state.moveHistory[i],
                });
                break;
              }
            }
          }

          dispatch({
            type: "NAVIGATE_TO_INDEX",
            payload: { game: g, popularMovesIndex: safeIndex },
          });

          if (safeIndex === 0) {
            toast.info("Moved to start position");
          } else {
            toast.info(`Moved to ${state.moveHistory[safeIndex - 1]}`);
          }
          return;
        }

        toast.error("No moves to navigate");
      } catch (error: any) {
        console.error("[Navigation] Error:", error.message);
        toast.error(`Navigation failed: ${error.message}`);
      }
    },
    [
      state.isPlayingOpening,
      state.matchedOpening,
      state.moveHistory,
      state.popularIndex,
      updateGameState,
    ],
  );

  const resetGame = useCallback(() => {
    try {
      dispatch({ type: "RESET_GAME" });
      toast.success("Game reset");
    } catch (error: any) {
      toast.error(`Reset failed: ${error.message}`);
    }
  }, []);

  return {
    state,
    dispatch,
    makeMove,
    navigateToMove,
    resetGame,
    updateGameState,
  };
}

export function useSuggestions(
  moveHistory: string[],
  openings: Opening[],
): string[] {
  return useMemo(() => {
    const matches = openings.filter((o) => {
      if (o.moves.length <= moveHistory.length) return false;
      if (moveHistory.length === 0) return true;
      for (let i = 0; i < moveHistory.length; i++) {
        if (o.moves[i] !== moveHistory[i]) return false;
      }
      return true;
    });

    const uniqueMoves = Array.from(
      new Set(
        matches.map((m) => m.moves[moveHistory.length]).filter(Boolean),
      ),
    );

    const movesWithPopularity = uniqueMoves.map((move) => {
      const openingsWithMove = matches.filter(
        (o) => o.moves[moveHistory.length] === move,
      );
      const avgPopularity =
        openingsWithMove.reduce((sum, o) => sum + o.popularity, 0) /
        openingsWithMove.length;
      return { move, popularity: avgPopularity };
    });

    movesWithPopularity.sort((a, b) => b.popularity - a.popularity);

    return movesWithPopularity.slice(0, 8).map((item) => item.move);
  }, [moveHistory, openings]);
}
