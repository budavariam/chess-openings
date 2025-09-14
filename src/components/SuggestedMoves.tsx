import React from 'react'

interface SuggestedMovesProps {
  suggestions: string[]
  makeMove: (move: string) => boolean
}

export function SuggestedMoves({ suggestions, makeMove }: SuggestedMovesProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
      <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Suggested Next Moves</h3>
      {suggestions.length > 0 ? (
        <div className="flex gap-2 flex-wrap">
          {suggestions.map((move, i) => (
            <button
              key={i}
              className="px-3 py-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium transition-colors border border-blue-200 dark:border-blue-700"
              onClick={() => makeMove(move)}
              title={`Play ${move}`}
            >
              {move}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">No suggestions available</div>
      )}
    </div>
  )
}
