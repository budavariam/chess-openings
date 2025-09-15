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
          className="px-3 py-1 rounded text-sm border bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer"
          onClick={() => handleOrientationChange(boardOrientation === 'white' ? 'black' : 'white')}
        >
          {boardOrientation === 'white' ? "♔ White" : "♚ Black"}
        </button>
      </div>
    </div>
  )
}
