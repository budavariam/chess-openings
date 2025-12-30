import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
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

export function useOpenings(): OpeningsData {
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [fenToOpening, setFenToOpening] = useState<Map<string, Opening>>(
    new Map(),
  );
  const [openingMovesIndex, setOpeningMovesIndex] = useState<
    Map<string, Set<string>>
  >(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded) return;

    console.log("[Openings] Loading ECO data...");
    try {
      const allEcoData = { ...ecoA, ...ecoB, ...ecoC, ...ecoD, ...ecoE };

      const mapped: Opening[] = [];
      const fenMap = new Map<string, Opening>();
      const movesIndex = new Map<string, Set<string>>();

      Object.entries(allEcoData as Record<string, any>).forEach(
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

      setOpenings(mapped);
      setFenToOpening(fenMap);
      setOpeningMovesIndex(movesIndex);
      setIsLoaded(true);

      toast.success(`Loaded ${mapped.length} chess openings`);
    } catch (error: any) {
      console.error("[Openings] Error loading:", error.message);
      toast.error(`Failed to load openings: ${error.message}`);
    }
  }, [isLoaded]);

  return {
    openings,
    fenToOpening,
    openingMovesIndex,
    isLoaded,
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
