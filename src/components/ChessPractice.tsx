import React, { useEffect, useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard, DraggingPieceDataType, PieceDropHandlerArgs } from 'react-chessboard'
// Import individual ECO files and combine them
import ecoA from '../eco.json/ecoA.json'
import ecoB from '../eco.json/ecoB.json'
import ecoC from '../eco.json/ecoC.json'
import ecoD from '../eco.json/ecoD.json'
import ecoE from '../eco.json/ecoE.json'
import type { Square } from 'chess.js'

type Opening = {
  name: string
  eco?: string
  moves: string[]
  popularity: number
  fen: string
  src?: string // eco_tsv, eco_js, scid, interpolated
  scid?: string
  isEcoRoot?: boolean
  aliases?: Record<string, string>
}

export default function ChessPractice() {
  const [game, setGame] = useState(() => new Chess())
  const [mode, setMode] = useState<'practice' | 'popular'>('practice')
  const [openings, setOpenings] = useState<Opening[]>([])
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [matchedOpening, setMatchedOpening] = useState<Opening | null>(null)
  const [fenToOpening, setFenToOpening] = useState<Map<string, Opening>>(new Map())

  // For the "popular" mode stepper
  const [popularIndex, setPopularIndex] = useState(0)
  const [popularMovesIndex, setPopularMovesIndex] = useState(0)

  // Calculate popularity based on eco.json source quality
  function calculatePopularity(data: any): number {
    if (data.src === 'eco_tsv') return 100 // Lichess data is most authoritative
    if (data.isEcoRoot) return 95 // Root variations are important
    if (data.src === 'eco_js') return 80
    if (data.src === 'scid') return 70
    if (data.src === 'eco_wikip') return 60
    if (data.src === 'interpolated') return 30 // Lower priority for gap-filling
    return 25
  }

  // Parse move string into clean array
  function parseMovesString(movesStr: string): string[] {
    if (!movesStr) return []
    return movesStr.split(/\s+/).filter((move: string) => {
      const trimmed = move.trim()
      return trimmed && !trimmed.match(/^\d+\.+$/)
    })
  }

  useEffect(() => {
    // Combine all ECO files
    const allEcoData = { ...ecoA, ...ecoB, ...ecoC, ...ecoD, ...ecoE }

    // Convert eco.json format: { "fen": { opening_data } }
    const mapped: Opening[] = []
    const fenMap = new Map<string, Opening>()

    Object.entries(allEcoData as Record<string, any>).forEach(([fen, data]) => {
      const movesArray = parseMovesString(data.moves || '')

      if (movesArray.length > 0) {
        const opening: Opening = {
          name: data.name || 'Unknown Opening',
          eco: data.eco,
          moves: movesArray,
          popularity: calculatePopularity(data),
          fen: fen,
          src: data.src,
          scid: data.scid,
          isEcoRoot: data.isEcoRoot || false,
          aliases: data.aliases || {}
        }

        mapped.push(opening)
        fenMap.set(fen, opening)
      }
    })

    setOpenings(mapped)
    setFenToOpening(fenMap)
  }, [])

  useEffect(() => {
    // Use FEN-based matching (eco.json's primary identification method)
    const currentFen = game.fen()
    const hist = moveHistory

    if (hist.length === 0) {
      setMatchedOpening(null)
      return
    }

    // Method 1: Direct FEN lookup (most reliable with eco.json)
    let match = fenToOpening.get(currentFen)
    if (match) {
      setMatchedOpening(match)
      return
    }

    // Method 2: Try position-only matching (first part of FEN)
    const positionPart = currentFen //currentFen.split(' ')
    for (const [fen, opening] of fenToOpening.entries()) {
      if (fen.startsWith(positionPart)) {
        setMatchedOpening(opening)
        return
      }
    }

    // Method 3: Fallback to move sequence matching
    const moveSequenceMatch = openings.find(o => {
      if (o.moves.length !== hist.length) return false
      return o.moves.every((move, i) => move === hist[i])
    })

    setMatchedOpening(moveSequenceMatch || null)
  }, [moveHistory, game, fenToOpening, openings])

  const position = useMemo(() => game.fen(), [game])


  
  type OnPieceDropType = ({ piece, sourceSquare, targetSquare, }: PieceDropHandlerArgs) => boolean;
  const onPieceDrop: OnPieceDropType = ({
    piece,
    sourceSquare,
    targetSquare
  }): boolean => {
    if (!targetSquare) {
      return false
    }

    const g = new Chess(game.fen())

    try {
      const move = g.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })

      // If move is null or undefined, it's invalid
      if (!move) {
        return false
      }

      // Move was successful, update state
      setGame(g)
      setMoveHistory([...g.history()])
      return true

    } catch (error) {
      // Invalid move - chess.js threw an exception
      console.warn(`Invalid move attempted: ${sourceSquare} to ${targetSquare}`, error)
      return false
    }
  }


  // // If PieceDropHandlerArgs is exported, you can use it
  // const onPieceDrop: OnPieceDropType = ({
  //   piece,
  //   sourceSquare,
  //   targetSquare
  // }): boolean => {
  //   if (!targetSquare) {
  //     return false
  //   }
  //   const g = new Chess(game.fen())
  //   const move = g.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
  //   if (!move) return false
  //   setGame(g)
  //   setMoveHistory([...g.history()])
  //   return true
  // }



  // Get suggested next moves based on current position
  const suggestions = useMemo(() => {
    if (moveHistory.length === 0) return []

    const matches = openings.filter(o => {
      if (o.moves.length <= moveHistory.length) return false
      for (let i = 0; i < moveHistory.length; i++) {
        if (o.moves[i] !== moveHistory[i]) return false
      }
      return true
    })

    const uniqueMoves = Array.from(new Set(
      matches.map(m => m.moves[moveHistory.length]).filter(Boolean)
    ))

    return uniqueMoves.slice(0, 8)
  }, [moveHistory, openings])

  // Popular openings sorted by eco.json quality metrics
  const popularSorted = useMemo(() => {
    return openings
      .slice()
      .sort((a, b) => {
        if (b.popularity !== a.popularity) return b.popularity - a.popularity
        if (a.src === 'eco_tsv' && b.src !== 'eco_tsv') return -1
        if (b.src === 'eco_tsv' && a.src !== 'eco_tsv') return 1
        if (a.isEcoRoot && !b.isEcoRoot) return -1
        if (b.isEcoRoot && !a.isEcoRoot) return 1
        return 0
      })
      .slice(0, 100)
  }, [openings])

  function startPopularAt(index: number) {
    const chosen = popularSorted[index]
    if (!chosen) return

    const g = new Chess()
    setPopularIndex(index)
    setPopularMovesIndex(0)
    setGame(g)
    setMoveHistory([])
    setMatchedOpening(chosen)
    setMode('popular')
  }

  function popularStepForward() {
    const chosen = popularSorted[popularIndex]
    if (!chosen || popularMovesIndex >= chosen.moves.length) return

    const moveSAN = chosen.moves[popularMovesIndex]
    const g = new Chess(game.fen())

    try {
      const move = g.move(moveSAN)
      if (move) {
        setGame(g)
        setMoveHistory([...g.history()])
        setPopularMovesIndex(popularMovesIndex + 1)
      }
    } catch (e) {
      console.warn(`Could not apply move: ${moveSAN}`, e)
    }
  }

  function popularStepBack() {
    if (popularMovesIndex > 0) {
      const g = new Chess(game.fen())
      g.undo()
      setGame(g)
      setMoveHistory([...g.history()])
      setPopularMovesIndex(popularMovesIndex - 1)
    }
  }

  function resetGame() {
    const g = new Chess()
    setGame(g)
    setMoveHistory([])
    setMatchedOpening(null)
    setPopularMovesIndex(0)
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-gray-800 p-4">
        <Chessboard
          options={{
            boardOrientation: "white",
            position: position,
            onPieceDrop: onPieceDrop,
          }}
        />
      </div>

      <div className="flex-1 space-y-4 max-w-xl">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Opening Trainer</h2>
            <div className="flex gap-2">
              <button
                className={'px-3 py-1 rounded ' + (mode === 'practice' ? 'bg-blue-600 text-white' : 'bg-transparent border')}
                onClick={() => setMode('practice')}
              >
                Practice
              </button>
              <button
                className={'px-3 py-1 rounded ' + (mode === 'popular' ? 'bg-blue-600 text-white' : 'bg-transparent border')}
                onClick={() => setMode('popular')}
              >
                Popular
              </button>
              <button
                className="px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={resetGame}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Matched Opening</h3>
              {matchedOpening ? (
                <div>
                  <div className="text-sm text-gray-400 flex gap-2">
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
                  <div className="font-semibold">{matchedOpening.name}</div>
                </div>
              ) : (
                <div className="text-gray-500">No match</div>
              )}
            </div>

            <div>
              <h3 className="font-medium">Move History</h3>
              <div className="text-sm text-gray-400">
                {moveHistory.length > 0 ? moveHistory.join(' ') : '—'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {openings.length} openings loaded
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h3 className="font-medium mb-2">Suggested Next Moves</h3>
          {suggestions.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {suggestions.map((s, i) => (
                <span key={i} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No suggestions available</div>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h3 className="font-medium mb-2">Popular Openings</h3>
          <div className="space-y-2 max-h-64 overflow-auto">
            {popularSorted.slice(0, 50).map((o, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{o.eco}</span>
                    {o.src && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">
                        {o.src}
                      </span>
                    )}
                    {o.isEcoRoot && (
                      <span className="text-xs bg-blue-200 dark:bg-blue-600 px-1 rounded">
                        ROOT
                      </span>
                    )}
                  </div>
                  <div className="font-medium truncate">{o.name}</div>
                  <div className="text-xs text-gray-500">
                    {o.moves.slice(0, 3).join(' ')}...
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                    onClick={() => startPopularAt(i)}
                  >
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>

          {mode === 'popular' && matchedOpening && (
            <div className="mt-4">
              <h4 className="font-semibold">Stepping: {matchedOpening.name}</h4>
              <div className="text-xs text-gray-500 mb-2">
                Source: {matchedOpening.src} | ECO: {matchedOpening.eco}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={popularStepBack}
                  disabled={popularMovesIndex === 0}
                >
                  Back
                </button>
                <button
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                  onClick={popularStepForward}
                  disabled={popularMovesIndex >= (matchedOpening.moves || []).length}
                >
                  Forward
                </button>
                <div className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800">
                  {popularMovesIndex}/{(matchedOpening.moves || []).length}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Moves: {(matchedOpening.moves || []).slice(0, popularMovesIndex).join(' ')}
              </div>
              {popularMovesIndex < (matchedOpening.moves || []).length && (
                <div className="mt-1 text-sm text-blue-600">
                  Next: {matchedOpening.moves[popularMovesIndex]}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
