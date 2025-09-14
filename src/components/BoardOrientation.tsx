import React from 'react'
import { toast } from 'react-toastify'
import type { BoardOrientation } from '../types'

interface BoardOrientationProps {
  boardOrientation: BoardOrientation
  setBoardOrientation: (orientation: BoardOrientation) => void
  logAction: (action: string, details?: any) => void
}

export function BoardOrientationControl({ 
  boardOrientation, 
  setBoardOrientation, 
  logAction 
}: BoardOrientationProps) {
  const handleOrientationChange = (orientation: BoardOrientation) => {
    setBoardOrientation(orientation)
    logAction(`Board orientation changed to ${orientation}`)
    toast.info(`Board flipped to ${orientation} perspective`)
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Board Orientation</h2>
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded text-sm border ${
            boardOrientation === 'white'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => handleOrientationChange('white')}
        >
          ♔ White
        </button>
        <button
          className={`px-3 py-1 rounded text-sm border ${
            boardOrientation === 'black'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => handleOrientationChange('black')}
        >
          ♚ Black
        </button>
      </div>
    </div>
  )
}
