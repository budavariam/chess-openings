import React from 'react';
import type { Opening, ChessMode } from '../types';
import { OpeningItem, getOpeningId } from './OpeningItem';

interface SearchOpeningsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Opening[];
  startSearchResult: (opening: Opening) => void;
  toggleFavourite: (openingId: string) => void;
  favouriteIds: string[];
  mode?: ChessMode;
}

export function SearchOpenings({
  searchQuery,
  setSearchQuery,
  searchResults,
  startSearchResult,
  toggleFavourite,
  favouriteIds,
  mode = 'search'
}: SearchOpeningsProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
      <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Search Openings</h3>

      <input
        type="text"
        placeholder="Search by name, ECO code, or moves (e.g., Sicilian, B20, 1.e4 c5)..."
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {searchResults.length > 0 && (
        <div className="mt-3 space-y-2 max-h-64 overflow-auto">
          {searchResults.map((opening) => {
            const openingId = getOpeningId(opening);
            const isFavourite = favouriteIds.includes(openingId);

            return (
              <OpeningItem
                key={openingId}
                opening={opening}
                isFavourite={isFavourite}
                toggleFavourite={toggleFavourite}
                onStudy={startSearchResult}
                variant="list"
                mode={mode}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}