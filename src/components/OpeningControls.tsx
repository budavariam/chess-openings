import React from 'react'
import type { Opening } from '../types'

interface OpeningControlsProps {
  isPlayingOpening: boolean
  matchedOpening: Opening | null
  popularMovesIndex: number
  goToStart: () => void
  popularStepBack: () => void
  popularStepForward: () => void
  goToEnd: () => void
}

export function OpeningControls({
  isPlayingOpening,
  matchedOpening,
  popularMovesIndex,
  goToStart,
  popularStepBack,
  popularStepForward,
  goToEnd
}: OpeningControlsProps) {
  if (!isPlayingOpening || !matchedOpening) {
    if (import.meta.env.DEV) {
      return (
        <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800 text-xs">
          Debug: Controls not showing - isPlayingOpening: {String(isPlayingOpening)}, hasMatchedOpening: {String(!!matchedOpening)}
        </div>
      )
    }
    else {
      return null
    }
  }

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="text-sm font-medium mb-3 text-blue-900 dark:text-blue-100">
        Opening Controls
      </div>

      <div className="flex gap-2 justify-center mb-3 flex-wrap">
        <button
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm font-medium"
          onClick={goToStart}
          title="Go to start"
        >
          ⏮ Start
        </button>
        <button
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm font-medium disabled:opacity-50"
          onClick={popularStepBack}
          disabled={popularMovesIndex === 0}
          title="Previous move"
        >
          ⏪ Back
        </button>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
          onClick={popularStepForward}
          disabled={popularMovesIndex >= (matchedOpening.moves || []).length}
          title="Next move"
        >
          ⏩ Forward
        </button>
        <button
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm font-medium"
          onClick={goToEnd}
          title="Go to end"
        >
          ⏭ End
        </button>
      </div>

      {popularMovesIndex < (matchedOpening.moves || []).length && (
        <div className="text-center">
          <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
            Next move:
          </div>
          <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded-lg font-mono text-lg">
            {matchedOpening.moves[popularMovesIndex]}
          </div>
        </div>
      )}
    </div>
  )
}
