import React from 'react'
import type { Opening } from '../types'

interface FavouriteOpeningsProps {
  favouriteOpenings: Opening[]
  startSearchResult: (opening: Opening, resumeAtLastPosition?: boolean) => void
  toggleFavourite: (openingId: string) => void
  favouriteIds: string[]
}

export const FavouriteOpenings: React.FC<FavouriteOpeningsProps> = ({
  favouriteOpenings,
  startSearchResult,
  toggleFavourite,
  favouriteIds
}) => {
  const getOpeningId = (opening: Opening) => opening.fen || opening.eco || opening.name

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Favourite Openings ({favouriteOpenings.length})
      </h3>
      
      {favouriteOpenings.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
          No favourite openings yet. Mark openings as favourites to see them here.
        </p>
      ) : (
        <div className="space-y-2">
          {favouriteOpenings.map((opening) => {
            const openingId = getOpeningId(opening)
            const isFavourite = favouriteIds.includes(openingId)
            
            return (
              <div
                key={openingId}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {opening.name}
                    </h4>
                    {opening.eco && (
                      <span className="px-2 py-1 text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        {opening.eco}
                      </span>
                    )}
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                      {opening.popularity.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {opening.moves.slice(0, 6).join(' ')}
                    {opening.moves.length > 6 && '...'}
                    <span className="ml-2 text-xs">
                      ({opening.moves.length} moves)
                    </span>
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => toggleFavourite(openingId)}
                    className={`p-2 rounded-lg transition-colors ${
                      isFavourite
                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => startSearchResult(opening, false)}
                    className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    📚 Study
                  </button>
                  
                  <button
                    onClick={() => startSearchResult(opening, true)}
                    className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    title="Start at final position"
                  >
                    Final
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
