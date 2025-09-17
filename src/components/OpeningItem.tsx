import React from 'react';
import type { Opening, ChessMode } from '../types';

interface OpeningItemProps {
  opening: Opening;
  isFavourite: boolean;
  toggleFavourite: (openingId: string) => void;
  onStudy?: (opening: Opening, resumeAtLastPosition?: boolean) => void;
  variant?: 'list' | 'expanded';
  mode?: ChessMode;
  showIndex?: number;
  className?: string;
}

// STANDARDIZED ID FUNCTION - use this everywhere!
export const getOpeningId = (opening: Opening): string => 
  opening.fen || opening.eco || opening.name;

export function OpeningItem({
  opening,
  isFavourite,
  toggleFavourite,
  onStudy,
  variant = 'list',
  mode = 'practice',
  showIndex,
  className = ''
}: OpeningItemProps) {
  const openingId = getOpeningId(opening);
  const shouldShowStudyButton = variant === 'list' || mode === 'practice' || mode === 'favourites';

  // Heart icon for favorite button
  const HeartIcon = () => (
    <svg className="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );

  if (variant === 'expanded') {
    return (
      <div className={`p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
        {/* Header with name and badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {showIndex !== undefined && (
                <span className="text-sm font-mono text-gray-400 dark:text-gray-500 min-w-[2rem]">
                  {showIndex}.
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {opening.name}
              </h3>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                {opening.eco}
              </span>
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                {opening.popularity.toFixed(1)}%
              </span>
              {opening.src && (
                <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                  {opening.src}
                </span>
              )}
              {opening.isEcoRoot && (
                <span className="text-xs bg-blue-200 dark:bg-blue-600 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  ROOT
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavourite(openingId);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isFavourite
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
            >
              <HeartIcon />
            </button>

            {shouldShowStudyButton && onStudy && (
              <>
                <button
                  onClick={() => onStudy(opening, false)}
                  className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                >
                  📚
                </button>
                <button
                  onClick={() => onStudy(opening, true)}
                  className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                  title="Start at final position"
                >
                  ⏭️
                </button>
              </>
            )}
          </div>
        </div>

        {/* Move sequence */}
        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono leading-relaxed">
          {opening.moves.slice(0, 8).join(' ')}
          {opening.moves.length > 8 && (
            <span className="text-gray-400"> ... +{opening.moves.length - 8} more</span>
          )}
        </div>

        {/* Move count */}
        <div className="text-xs text-gray-500 mt-2">
          {opening.moves.length} moves
        </div>
      </div>
    );
  }

  // List variant (compact)
  return (
    <div className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow ${className}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {showIndex !== undefined && (
            <span className="text-sm font-mono text-gray-400 dark:text-gray-500 w-6">
              {showIndex}.
            </span>
          )}
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

        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {opening.moves.slice(0, 6).join(' ')}
          {opening.moves.length > 6 && ' ...'}
          <span className="ml-2 text-xs">
            {opening.moves.length} moves
          </span>
        </div>

        {/* Additional badges for list view */}
        {(opening.src || opening.isEcoRoot) && (
          <div className="flex items-center gap-2 mt-1">
            {opening.src && (
              <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">
                {opening.src}
              </span>
            )}
            {opening.isEcoRoot && (
              <span className="text-xs bg-blue-200 dark:bg-blue-600 px-1 rounded">
                ROOT
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 ml-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavourite(openingId);
          }}
          className={`p-2 rounded-lg transition-colors ${
            isFavourite
              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <HeartIcon />
        </button>

        {shouldShowStudyButton && onStudy && (
          <button
            onClick={() => onStudy(opening, false)}
            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            📚
          </button>
        )}
      </div>
    </div>
  );
}