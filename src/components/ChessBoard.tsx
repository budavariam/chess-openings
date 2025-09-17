import React, { useState, useMemo } from 'react'
import { Chessboard, ChessboardOptions, PieceDropHandlerArgs } from 'react-chessboard'
import { getLastMove } from '../utils/chessUtils'
import type { BoardOrientation } from '../types'

// Board style themes
export interface BoardTheme {
  name: string
  lightSquareStyle: React.CSSProperties
  darkSquareStyle: React.CSSProperties
  lastMoveHighlight: {
    from: React.CSSProperties
    to: React.CSSProperties
  }
}

const boardThemes: Record<string, BoardTheme> = {
  default: {
    name: 'Default',
    lightSquareStyle: { backgroundColor: '#f0d9b5' },
    darkSquareStyle: { backgroundColor: '#b58863' },
    lastMoveHighlight: {
      from: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
      to: { backgroundColor: 'rgba(255, 255, 0, 0.6)' }
    }
  },
  green: {
    name: 'Green',
    lightSquareStyle: { backgroundColor: '#eeeed2' },
    darkSquareStyle: { backgroundColor: '#769656' },
    lastMoveHighlight: {
      from: { backgroundColor: 'rgba(155, 199, 0, 0.4)' },
      to: { backgroundColor: 'rgba(155, 199, 0, 0.6)' }
    }
  },
  blue: {
    name: 'Blue',
    lightSquareStyle: { backgroundColor: '#dee3e6' },
    darkSquareStyle: { backgroundColor: '#8ca2ad' },
    lastMoveHighlight: {
      from: { backgroundColor: 'rgba(70, 130, 180, 0.4)' },
      to: { backgroundColor: 'rgba(70, 130, 180, 0.6)' }
    }
  },
  brown: {
    name: 'Brown',
    lightSquareStyle: { backgroundColor: '#f5e6d3' },
    darkSquareStyle: { backgroundColor: '#8b4513' },
    lastMoveHighlight: {
      from: { backgroundColor: 'rgba(255, 165, 0, 0.4)' },
      to: { backgroundColor: 'rgba(255, 165, 0, 0.6)' }
    }
  },
  purple: {
    name: 'Purple',
    lightSquareStyle: { backgroundColor: '#e8d5ff' },
    darkSquareStyle: { backgroundColor: '#9c27b0' },
    lastMoveHighlight: {
      from: { backgroundColor: 'rgba(255, 193, 7, 0.4)' },
      to: { backgroundColor: 'rgba(255, 193, 7, 0.6)' }
    }
  },
  pink: {
    name: 'Pink',
    lightSquareStyle: { backgroundColor: '#fce4ec' },
    darkSquareStyle: { backgroundColor: '#e91e63' },
    lastMoveHighlight: {
      from: { backgroundColor: 'rgba(76, 175, 80, 0.4)' },
      to: { backgroundColor: 'rgba(76, 175, 80, 0.6)' }
    }
  }
}

interface ChessBoardProps {
  position: string
  boardOrientation: BoardOrientation
  onPieceDrop: (args: PieceDropHandlerArgs) => boolean
  game: any
  children: React.ReactNode
  showCoordinates?: boolean
  boardTheme?: string
  onThemeChange?: (theme: string) => void
  onCoordinatesToggle?: (show: boolean) => void
}

export function ChessBoard({
  position,
  boardOrientation,
  onPieceDrop,
  game,
  children,
  showCoordinates = true,
  boardTheme = 'default',
  onThemeChange,
  onCoordinatesToggle
}: ChessBoardProps) {
  const [showStyleSelector, setShowStyleSelector] = useState(false)
  const lastMove = getLastMove(game)
  const currentTheme = boardThemes[boardTheme] || boardThemes.default

  // Debug logging to see if theme is changing
  console.log('ChessBoard render - boardTheme:', boardTheme, 'currentTheme:', currentTheme.name)

  // Memoize custom square styles for better performance
  const customSquareStyles = useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {}

    // Add last move highlighting
    if (lastMove) {
      styles[lastMove.from] = currentTheme.lastMoveHighlight.from
      styles[lastMove.to] = currentTheme.lastMoveHighlight.to
    }

    return styles
  }, [lastMove, currentTheme])

  // Force key change when theme changes to make react-chessboard re-render
  const chessboardKey = useMemo(() => `chessboard-${boardTheme}-${position}`, [boardTheme, position])

  // Properly typed chessboard options - recreated when theme changes
  const chessboardOptions = useMemo(() => {
    const opts: ChessboardOptions = {
      boardOrientation: boardOrientation,
      position: position,
      onPieceDrop: onPieceDrop,
      squareStyles: customSquareStyles,
      lightSquareStyle: currentTheme.lightSquareStyle,
      darkSquareStyle: currentTheme.darkSquareStyle,
      showNotation: showCoordinates,
      allowDrawingArrows: true,
      boardStyle: {
        width: '350px',
        height: '350px'
        // borderRadius: '8px',
        // boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
      },
      lightSquareNotationStyle: {
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#666'
      },
      darkSquareNotationStyle: {
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#666'
      }
    }
    return opts
  }, [
    boardOrientation,
    position,
    onPieceDrop,
    customSquareStyles,
    currentTheme.lightSquareStyle,
    currentTheme.darkSquareStyle,
    showCoordinates
  ])

  // Compact style selector dropdown
  const StyleSelector = () => (
    <div className="absolute top-2 right-2 z-20">
      <button
        onClick={() => setShowStyleSelector(!showStyleSelector)}
        className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center text-sm"
        title="Board themes"
      >
        🎨
      </button>

      {showStyleSelector && (
        <>
          {/* Backdrop to close selector */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowStyleSelector(false)}
          />

          {/* Compact dropdown menu */}
          <div className="absolute top-10 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 py-2 min-w-[140px] z-20">
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Themes
            </div>

            {Object.entries(boardThemes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => {
                  console.log('Theme clicked:', key) // Debug log
                  onThemeChange?.(key)
                  setShowStyleSelector(false)
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${boardTheme === key
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300'
                  }`}
              >
                <div className="flex">
                  <div
                    className="w-3 h-3 border border-gray-300 dark:border-gray-500"
                    style={theme.lightSquareStyle}
                  />
                  <div
                    className="w-3 h-3 border border-gray-300 dark:border-gray-500"
                    style={theme.darkSquareStyle}
                  />
                </div>
                <span className="flex-1">{theme.name}</span>
                {boardTheme === key && (
                  <span className="text-blue-600 dark:text-blue-400 text-xs">✓</span>
                )}
              </button>
            ))}

            <hr className="my-1 border-gray-200 dark:border-gray-600" />

            <button
              onClick={() => {
                onCoordinatesToggle?.(!showCoordinates)
                setShowStyleSelector(false)
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              <span>Coordinates</span>
              <span className={`text-xs ${showCoordinates ? 'text-green-600' : 'text-gray-400'}`}>
                {showCoordinates ? '✓' : '○'}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  )
  console.log("AAA", chessboardKey, chessboardOptions);
  return (
    <div className="flex justify-center lg:justify-start">
      <div className="relative shadow-xl rounded-2xl overflow-auto bg-white dark:bg-gray-800 p-3">
        <StyleSelector />
        <Chessboard
          key={chessboardKey}
          options={chessboardOptions}
        />
        {children}
      </div>
    </div>
  )
}
