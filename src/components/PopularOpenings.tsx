import React from 'react';
import type { Opening, ChessMode } from '../types';
import { OpeningItem, getOpeningId } from './OpeningItem';

interface PopularOpeningsProps {
  moveHistory: string[];
  popularSorted: Opening[];
  startPopularAt: (index: number) => void;
  toggleFavourite: (openingId: string) => void;
  favouriteIds: string[];
  mode?: ChessMode;
}

export const PopularOpenings: React.FC<PopularOpeningsProps> = ({
  moveHistory,
  popularSorted,
  startPopularAt,
  toggleFavourite,
  favouriteIds,
  mode = 'popular'
}) => {
  // Wrapper function to convert index-based callback to opening-based
  const handleStudyOpening = (opening: Opening) => {
    const index = popularSorted.findIndex(o => 
      getOpeningId(o) === getOpeningId(opening)
    );
    if (index !== -1) {
      startPopularAt(index);
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Popular Openings
        {moveHistory.length > 0 && (
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
            (filtered by current position)
          </span>
        )}
      </h3>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {popularSorted.slice(0, 20).map((opening, index) => {
          const openingId = getOpeningId(opening);
          const isFavourite = favouriteIds.includes(openingId);

          return (
            <OpeningItem
              key={openingId}
              opening={opening}
              isFavourite={isFavourite}
              toggleFavourite={toggleFavourite}
              onStudy={handleStudyOpening}
              variant="list"
              mode={mode}
              showIndex={index + 1}
            />
          );
        })}
      </div>
    </div>
  );
};