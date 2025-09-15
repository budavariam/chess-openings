import React from 'react'
import type { Opening } from '../types'

interface PopularOpeningsProps {
  moveHistory: string[]
  popularSorted: Opening[]
  startPopularAt: (index: number) => void
}

export function PopularOpenings({ moveHistory, popularSorted, startPopularAt }: PopularOpeningsProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
      <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
        {moveHistory.length > 0 ? 'Opening Continuations' : 'Popular Openings'}
      </h3>
      {moveHistory.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Showing openings that continue from: {moveHistory.join(' ')}
        </div>
      )}
      <div className="space-y-2 max-h-64 overflow-auto">
        {popularSorted.slice(0, 50).map((o, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
                <span>{o.eco}</span>
                {o.src && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">
                    {o.src}
                  </span>
                )}
                {o.isEcoRoot && (
                  <span className="text-xs bg-blue-200 dark:bg-blue-600 px-1 rounded">
                    ROOT
                  </span>
                )}
              </div>
              <div className="font-medium truncate text-gray-900 dark:text-white">{o.name}</div>
              <div className="text-xs text-gray-500">
                {moveHistory.length > 0 ?
                  // Show continuation moves
                  `...${o.moves.slice(moveHistory.length, moveHistory.length + 3).join(' ')}` :
                  // Show opening moves
                  `${o.moves.slice(0, 3).join(' ')}...`
                } ({o.moves.length} moves)
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400">{o.popularity}</span>
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                onClick={() => startPopularAt(i)}
              >
                📚 Study
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
