import React from 'react'
import type { Opening } from '../types'

interface OpeningControlsProps {
  isPlayingOpening: boolean
  matchedOpening: Opening | null
  popularMovesIndex: number
  onNavigate: (index: number) => void
  gameHistoryLength?: number
}

type NavigationAction = 'start' | 'back' | 'forward' | 'end'

export function OpeningControls({
  isPlayingOpening,
  matchedOpening,
  popularMovesIndex,
  onNavigate,
  gameHistoryLength = 0
}: OpeningControlsProps) {
  // Unified navigation logic
  const handleNavigation = (action: NavigationAction) => {
    const maxMoves = matchedOpening?.moves?.length || 0
    const maxIndex = Math.max(maxMoves, gameHistoryLength)
    
    switch (action) {
      case 'start':
        onNavigate(0)
        break
      case 'back':
        onNavigate(Math.max(0, popularMovesIndex - 1))
        break
      case 'forward':
        onNavigate(Math.min(maxIndex, popularMovesIndex + 1))
        break
      case 'end':
        onNavigate(maxIndex)
        break
    }
  }

  // Navigation button configuration
  const navigationButtons = [
    {
      id: 'start',
      label: '⏮ Start',
      action: 'start' as NavigationAction,
      disabled: popularMovesIndex === 0,
      title: 'Go to start'
    },
    {
      id: 'back',
      label: '⏪ Back',
      action: 'back' as NavigationAction,
      disabled: popularMovesIndex === 0,
      title: 'Previous move'
    },
    {
      id: 'forward',
      label: '⏩ Forward',
      action: 'forward' as NavigationAction,
      disabled: popularMovesIndex >= Math.max(
        matchedOpening?.moves?.length || 0, 
        gameHistoryLength
      ),
      title: 'Next move',
      primary: true
    },
    {
      id: 'end',
      label: '⏭ End',
      action: 'end' as NavigationAction,
      disabled: false,
      title: 'Go to end'
    }
  ]

  // Development debug info
  if (!isPlayingOpening || !matchedOpening) {
    if (import.meta.env.DEV) {
      return (
        <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800 text-xs">
          <div>Debug: Controls not showing</div>
          <div>• isPlayingOpening: {String(isPlayingOpening)}</div>
          <div>• hasMatchedOpening: {String(!!matchedOpening)}</div>
          <div>• popularMovesIndex: {popularMovesIndex}</div>
          <div>• gameHistoryLength: {gameHistoryLength}</div>
        </div>
      )
    }
    return null
  }

  const currentMoves = matchedOpening.moves || []
  const hasNextMove = popularMovesIndex < currentMoves.length
  
  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="text-sm font-medium mb-3 text-blue-900 dark:text-blue-100">
        Opening Controls
      </div>

      {/* Unified Navigation Buttons */}
      <div className="flex gap-2 justify-center mb-3 flex-wrap">
        {navigationButtons.map((button) => (
          <button
            key={button.id}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              button.primary
                ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
                : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => handleNavigation(button.action)}
            disabled={button.disabled}
            title={button.title}
          >
            {button.label}
          </button>
        ))}
      </div>

      {/* Move Progress Indicator */}
      <div className="flex justify-center mb-3">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Move {popularMovesIndex} of {Math.max(currentMoves.length, gameHistoryLength)}
        </div>
      </div>

      {/* Next Move Display */}
      {hasNextMove && (
        <div className="text-center">
          <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
            Next move:
          </div>
          <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded-lg font-mono text-lg">
            {currentMoves[popularMovesIndex]}
          </div>
        </div>
      )}

      {/* Development Debug Info */}
      {import.meta.env.DEV && (
        <details className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
            Debug Info
          </summary>
          <div className="mt-2 space-y-1 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <div>Opening: {matchedOpening.name}</div>
            <div>Moves count: {currentMoves.length}</div>
            <div>Current index: {popularMovesIndex}</div>
            <div>Game history: {gameHistoryLength}</div>
            <div>Has next: {String(hasNextMove)}</div>
          </div>
        </details>
      )}
    </div>
  )
}
