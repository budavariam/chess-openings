import React from 'react'
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
  const handleModeChange = (newMode: ChessMode) => {
    logAction('Mode changed', { from: mode, to: newMode })
    setMode(newMode)
    setIsPlayingOpening(false)
    resetGame()
  }

  const modes: { key: ChessMode; label: string; icon: string }[] = [
    { key: 'practice', label: 'Practice', icon: '♟️' },
    { key: 'search', label: 'Search', icon: '🔍' },
    { key: 'popular', label: 'Popular', icon: '⭐' },
    { key: 'favourites', label: 'Favourites', icon: '❤️' }
  ]

  return (
    <div className="flex gap-1 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
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
          {label}
        </button>
      ))}
    </div>
  )
}
