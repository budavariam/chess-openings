import React, { useState } from 'react'
import type { ChessMode } from '../types'

interface ModeSelectorProps {
  mode: ChessMode
  setMode: (mode: ChessMode) => void
  setIsPlayingOpening: (isPlaying: boolean) => void
  resetGame: () => void
  logAction: (action: string, details?: any) => void
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  setMode,
  setIsPlayingOpening,
  resetGame,
  logAction
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleModeChange = (newMode: ChessMode) => {
    logAction('Mode changed', { from: mode, to: newMode })
    setMode(newMode)
    setIsPlayingOpening(false)
    resetGame()
    setIsExpanded(false)
  }

  const modes: { key: ChessMode; label: string; icon: string }[] = [
    { key: 'practice', label: 'Practice', icon: '♟️' },
    { key: 'search', label: 'Search', icon: '🔍' },
    { key: 'popular', label: 'Popular', icon: '⭐' },
    { key: 'favourites', label: 'Favourites', icon: '❤️' }
  ]

  const currentMode = modes.find(m => m.key === mode) || modes[0]

  return (
    <>
      {/* Desktop version - shows all modes horizontally */}
      <div className="hidden md:flex gap-1 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
        {modes.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => handleModeChange(key)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${mode === key
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
          >
            <span>{icon}</span>
            <span className="whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>

      {/* Mobile version - dropdown with current mode displayed */}
      <div className="md:hidden relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg text-sm font-medium transition-colors flex items-center justify-between gap-2 text-gray-900 dark:text-gray-100"
        >
          <div className="flex items-center gap-2">
            <span>{currentMode.icon}</span>
            <span>{currentMode.label}</span>
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsExpanded(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 py-1 z-20">
              {modes.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => handleModeChange(key)}
                  className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors flex items-center gap-2 ${mode === key
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                  {mode === key && (
                    <span className="ml-auto text-blue-600 dark:text-blue-400 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
