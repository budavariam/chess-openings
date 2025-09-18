import React from "react";
import { ExternalExplorer } from "./ExternalExplorer";
import { OpeningItem, getOpeningId } from "./OpeningItem";
import type { Opening, ChessMode } from "../types";

interface GameStatusProps {
  isPlayingOpening: boolean;
  matchedOpening: Opening | null;
  popularMovesIndex: number;
  moveHistory: string[];
  openingsCount: number;
  onStudyOpening: (opening: Opening) => void;
  toggleFavourite: (openingId: string) => void;
  favouriteIds?: string[];
  mode: ChessMode;
  logAction: (action: string, details?: any) => void;
}

export function GameStatus({
  isPlayingOpening,
  matchedOpening,
  popularMovesIndex,
  moveHistory,
  openingsCount,
  onStudyOpening,
  toggleFavourite,
  favouriteIds = [],
  mode = "practice",
  logAction,
}: GameStatusProps) {
  const currentOpeningProgress = matchedOpening
    ? `${popularMovesIndex}/${matchedOpening.moves.length}`
    : "0/0";

  return (
    <>
      {/* Current Status */}
      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="text-sm font-medium">
          {isPlayingOpening ? (
            <span className="text-green-600 dark:text-green-400">
              📖 Playing Opening: {matchedOpening?.name} (
              {currentOpeningProgress})
            </span>
          ) : (
            <span className="text-blue-600 dark:text-blue-400">
              🎯 Free Play: Make moves to identify openings
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Matched Opening
            </h3>
          </div>

          {matchedOpening ? (
            <div className="space-y-3">
              <OpeningItem
                opening={matchedOpening}
                isFavourite={favouriteIds.includes(
                  getOpeningId(matchedOpening),
                )}
                toggleFavourite={toggleFavourite}
                onStudy={onStudyOpening}
                variant="expanded"
                mode={mode}
                className="!p-3"
              />
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <ExternalExplorer
                  matchedOpening={matchedOpening}
                  popularMovesIndex={popularMovesIndex}
                  logAction={logAction}
                />
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No match</div>
          )}
        </div>

        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Move History
          </h3>
          <div className="text-sm text-gray-400 break-words">
            {moveHistory.length > 0 ? moveHistory.join(" ") : "—"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {openingsCount} openings loaded
          </div>
        </div>
      </div>
    </>
  );
}
