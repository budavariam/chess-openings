import React, { Children } from 'react'
import { Chessboard, PieceDropHandlerArgs } from 'react-chessboard'
import { getLastMove } from '../utils/chessUtils'
import type { BoardOrientation } from '../types'

interface ChessBoardProps {
  position: string
  boardOrientation: BoardOrientation
  onPieceDrop: (args: PieceDropHandlerArgs) => boolean
  game: any,
  children: React.ReactNode
}

export function ChessBoard({ position, boardOrientation, onPieceDrop, game, children }: ChessBoardProps) {
  const lastMove = getLastMove(game)

  return (
    <div className="flex justify-center lg:justify-start">
      <div
        className="shadow-xl rounded-2xl overflow-auto bg-white dark:bg-gray-800 p-3"
      >
        <Chessboard
          style={{ width: '380px', height: '380px' }}
          options={{
            boardOrientation: boardOrientation,
            position: position,
            onPieceDrop: onPieceDrop,
            boardStyle: {
              width: '350px',
              height: '350px'
            },
            customSquareStyles: lastMove ? {
              [lastMove.from]: {
                backgroundColor: 'rgba(255, 255, 0, 0.4)'
              },
              [lastMove.to]: {
                backgroundColor: 'rgba(255, 255, 0, 0.6)'
              }
            } : {}
          }}
        />
        {children}
      </div>
    </div>
  )
}
