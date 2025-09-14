import React from 'react'
import type { Opening } from '../types'

interface SearchOpeningsProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: Opening[]
  startSearchResult: (opening: Opening) => void
}

export function SearchOpenings({ 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  startSearchResult 
}: SearchOpeningsProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
      <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Search Openings</h3>
      <input
        type="text"
        placeholder="Search by name, ECO code, or moves (e.g., 'Sicilian', 'B20', '1.e4 c5')..."
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {searchResults.length > 0 && (
        <div className="mt-3 space-y-2 max-h-64 overflow-auto">
          {searchResults.map((opening, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
                  <span>{opening.eco}</span>
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
                <div className="font-medium truncate text-gray-900 dark:text-white">{opening.name}</div>
                <div className="text-xs text-gray-500 break-words">
                  {opening.moves.slice(0, 4).join(' ')}
                  {opening.moves.length > 4 && '...'}
                </div>
              </div>
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 ml-2 shrink-0"
                onClick={() => startSearchResult(opening)}
              >
                Study
              </button>
            </div>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && (
        <div className="mt-3 text-gray-500 text-center">No results found</div>
      )}
    </div>
  )
}
