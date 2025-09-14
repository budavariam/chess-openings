import React from 'react'
import { toast } from 'react-toastify'
import type { ChessMode } from '../types'

interface ModeSelectorProps {
  mode: ChessMode
  setMode: (mode: ChessMode) => void
  setIsPlayingOpening: (playing: boolean) => void
  resetGame: () => void
  logAction: (action: string, details?: any) => void
}

export function ModeSelector({ 
  mode, 
  setMode, 
  setIsPlayingOpening, 
  resetGame, 
  logAction 
}: ModeSelectorProps) {
  const handleModeChange = (newMode: ChessMode) => {
    setMode(newMode)
    if (newMode === 'practice') {
      setIsPlayingOpening(false)
    }
    logAction(`Switched to ${newMode} mode`)
    if (newMode === 'practice') {
      toast.info('Switched to practice mode')
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        className={`px-3 py-1 rounded text-sm ${
          mode === 'practice' 
            ? 'bg-blue-600 text-white' 
            : 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
        }`}
        onClick={() => handleModeChange('practice')}
      >
        Practice
      </button>
      <button
        className={`px-3 py-1 rounded text-sm ${
          mode === 'popular' 
            ? 'bg-blue-600 text-white' 
            : 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
        }`}
        onClick={() => handleModeChange('popular')}
      >
        Popular
      </button>
      <button
        className={`px-3 py-1 rounded text-sm ${
          mode === 'search' 
            ? 'bg-blue-600 text-white' 
            : 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
        }`}
        onClick={() => handleModeChange('search')}
      >
        Search
      </button>
      <button
        className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
        onClick={resetGame}
      >
        Reset
      </button>
    </div>
  )
}
