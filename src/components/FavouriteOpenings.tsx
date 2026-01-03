import React from "react";
import type { Opening, ChessMode } from "../types";
import { OpeningItem, getOpeningId } from "./OpeningItem";

interface FavouriteOpeningsProps {
  favouriteOpenings: Opening[];
  startSearchResult: (opening: Opening, startAtFinalPosition?: boolean) => void;
  toggleFavourite: (openingId: string) => void;
  favouriteIds: string[];
  mode?: ChessMode;
  onMoveClick?: (opening: Opening, moveIndex: number) => void;
}

export const FavouriteOpenings: React.FC<FavouriteOpeningsProps> = ({
  favouriteOpenings,
  startSearchResult,
  toggleFavourite,
  favouriteIds,
  mode = "favourites",
  onMoveClick,
}) => {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Favourite Openings ({favouriteOpenings.length})
      </h3>

      {favouriteOpenings.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
          No favourite openings yet. Mark openings as favourites to see them
          here.
        </p>
      ) : (
        <div className="space-y-2">
          {favouriteOpenings.map((opening) => {
            const openingId = getOpeningId(opening);
            const isFavourite = favouriteIds.includes(openingId);

            return (
              <OpeningItem
                key={openingId}
                opening={opening}
                isFavourite={isFavourite}
                toggleFavourite={toggleFavourite}
                onStudy={startSearchResult}
                variant="expanded"
                mode={mode}
                onMoveClick={onMoveClick}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
