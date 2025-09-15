import React from 'react'
import type { Opening } from '../types'

interface GameStatusProps {
  isPlayingOpening: boolean
  matchedOpening: Opening | null
  popularMovesIndex: number
  moveHistory: string[]
  openingsCount: number
  onStudyOpening?: (opening: Opening) => void
}

export function GameStatus({
  isPlayingOpening,
  matchedOpening,
  popularMovesIndex,
  moveHistory,
  openingsCount,
  onStudyOpening
}: GameStatusProps) {
  const currentOpeningProgress = matchedOpening
    ? `${popularMovesIndex}/${matchedOpening.moves.length}`
    : '0/0'

  const handleStudyClick = () => {
    if (matchedOpening && onStudyOpening) {
      onStudyOpening(matchedOpening)
    }
  }

  return (
    <>
      {/* Current Status */}
      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="text-sm font-medium">
          {isPlayingOpening ? (
            <span className="text-green-600 dark:text-green-400">
              📖 Playing Opening: {matchedOpening?.name} ({currentOpeningProgress})
            </span>
          ) : (
            <span className="text-blue-600 dark:text-blue-400">
              🎯 Free Play: Make moves to identify openings
            </span>
          )}
        </div>
      </div>

      {/* Opening and Move History Grid */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900 dark:text-white">Matched Opening</h3>
            {matchedOpening && !isPlayingOpening && onStudyOpening && (
              <button
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={handleStudyClick}
                title="Study this opening"
              >
                📚 Study
              </button>
            )}
          </div>
          {matchedOpening ? (
            <div>
              <div className="text-sm text-gray-400 flex gap-2 flex-wrap">
                <span>{matchedOpening.eco}</span>
                {matchedOpening.src && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">
                    {matchedOpening.src}
                  </span>
                )}
                {matchedOpening.isEcoRoot && (
                  <span className="text-xs bg-blue-200 dark:bg-blue-700 px-1 rounded">
                    ROOT
                  </span>
                )}
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">{matchedOpening.name}</div>
              <div className="italic text-gray-900 dark:text-white">{matchedOpening.moves.join(" ")}</div>
            </div>
          ) : (
            <div className="text-gray-500">No match</div>
          )}
        </div>

        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">Move History</h3>
          <div className="text-sm text-gray-400 break-words">
            {moveHistory.length > 0 ? moveHistory.join(' ') : '—'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {openingsCount} openings loaded
          </div>
        </div>
      </div>
    </>
  )
}