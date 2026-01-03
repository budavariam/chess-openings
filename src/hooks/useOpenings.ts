import { useReducer, useEffect, useMemo } from "react";
import { useToast } from "./useToast";
import ecoA from "../eco.json/ecoA.json";
import ecoB from "../eco.json/ecoB.json";
import ecoC from "../eco.json/ecoC.json";
import ecoD from "../eco.json/ecoD.json";
import ecoE from "../eco.json/ecoE.json";
import type { Opening } from "../types";
import { calculatePopularity, parseMovesString } from "../utils/chessUtils";

export interface OpeningsData {
  openings: Opening[];
  fenToOpening: Map<string, Opening>;
  openingMovesIndex: Map<string, Set<string>>;
  isLoaded: boolean;
}

interface OpeningsState {
  openings: Opening[];
  fenToOpening: Map<string, Opening>;
  openingMovesIndex: Map<string, Set<string>>;
  isLoaded: boolean;
}

type OpeningsAction =
  | {
      type: "LOAD_SUCCESS";
      payload: {
        openings: Opening[];
        fenToOpening: Map<string, Opening>;
        openingMovesIndex: Map<string, Set<string>>;
      };
    };

const initialState: OpeningsState = {
  openings: [],
  fenToOpening: new Map(),
  openingMovesIndex: new Map(),
  isLoaded: false,
};

function openingsReducer(
  state: OpeningsState,
  action: OpeningsAction
): OpeningsState {
  switch (action.type) {
    case "LOAD_SUCCESS":
      return {
        ...state,
        openings: action.payload.openings,
        fenToOpening: action.payload.fenToOpening,
        openingMovesIndex: action.payload.openingMovesIndex,
        isLoaded: true,
      };
    default:
      return state;
  }
}

export function useOpenings(): OpeningsData {
  const [state, dispatch] = useReducer(openingsReducer, initialState);
  const toast = useToast();

  useEffect(() => {
    if (state.isLoaded) return;

    console.log("[Openings] Loading ECO data...");
    try {
      const allEcoData = { ...ecoA, ...ecoB, ...ecoC, ...ecoD, ...ecoE };

      const mapped: Opening[] = [];
      const fenMap = new Map<string, Opening>();
      const movesIndex = new Map<string, Set<string>>();

      Object.entries(allEcoData as Record<string, { name?: string; eco: string; moves?: string; src?: string; scid?: string; isEcoRoot?: boolean; aliases?: Record<string, string> }>).forEach(
        ([fen, data]) => {
          const movesArray = parseMovesString(data.moves || "");
          if (movesArray.length > 0) {
            const opening: Opening = {
              name: data.name || "Unknown Opening",
              eco: data.eco,
              moves: movesArray,
              popularity: calculatePopularity(data),
              fen: fen,
              src: data.src,
              scid: data.scid,
              isEcoRoot: data.isEcoRoot || false,
              aliases: data.aliases || {},
            };
            mapped.push(opening);
            fenMap.set(fen, opening);

            // Build moves index for fast lookup
            for (let i = 0; i < movesArray.length - 1; i++) {
              const key = movesArray.slice(0, i + 1).join("|");
              const nextMove = movesArray[i + 1];
              if (!movesIndex.has(key)) {
                movesIndex.set(key, new Set());
              }
              movesIndex.get(key)!.add(nextMove);
            }
          }
        },
      );

      // Add first moves with empty key
      const firstMoves = new Set<string>();
      mapped.forEach((opening) => {
        if (opening.moves.length > 0) {
          firstMoves.add(opening.moves[0]);
        }
      });
      movesIndex.set("", firstMoves);

      console.log("[Openings] Loaded:", {
        totalOpenings: mapped.length,
        indexSize: movesIndex.size,
        firstMoves: Array.from(firstMoves).length,
      });

      dispatch({
        type: "LOAD_SUCCESS",
        payload: {
          openings: mapped,
          fenToOpening: fenMap,
          openingMovesIndex: movesIndex,
        },
      });

      toast.success(`Loaded ${mapped.length} chess openings`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Openings] Error loading:", message);
      toast.error(`Failed to load openings: ${message}`);
    }
  }, [state.isLoaded, toast]);

  return {
    openings: state.openings,
    fenToOpening: state.fenToOpening,
    openingMovesIndex: state.openingMovesIndex,
    isLoaded: state.isLoaded,
  };
}

export function useOpeningMatch(
  moveHistory: string[],
  fenToOpening: Map<string, Opening>,
  openings: Opening[],
  currentFen: string,
  isPlayingOpening: boolean,
  currentMatchedOpening: Opening | null,
): Opening | null {
  return useMemo(() => {
    if (isPlayingOpening) return currentMatchedOpening;
    if (moveHistory.length === 0) return null;

    // Try FEN match first
    let match = fenToOpening.get(currentFen);
    if (match) return match;

    // Try position match
    const positionPart = currentFen.split(" ");
    for (const [fen, opening] of fenToOpening.entries()) {
      if (fen.split(" ") === positionPart) {
        return opening;
      }
    }

    // Try move sequence match
    const moveSequenceMatch = openings.find((o) => {
      if (o.moves.length < moveHistory.length) return false;
      return moveHistory.every((move, i) => o.moves[i] === move);
    });

    return moveSequenceMatch || null;
  }, [
    moveHistory,
    currentFen,
    fenToOpening,
    openings,
    isPlayingOpening,
    currentMatchedOpening,
  ]);
}
