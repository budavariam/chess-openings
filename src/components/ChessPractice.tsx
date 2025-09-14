import React, { useEffect, useMemo, useState, useCallback } from 'react'
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
  const [mode, setMode] = useState<'practice' | 'popular' | 'search'>('practice')
  const [openings, setOpenings] = useState<Opening[]>([])
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [matchedOpening, setMatchedOpening] = useState<Opening | null>(null)
  const [fenToOpening, setFenToOpening] = useState<Map<string, Opening>>(new Map())

  // For the "popular" mode stepper
  const [popularIndex, setPopularIndex] = useState(0)
  const [popularMovesIndex, setPopularMovesIndex] = useState(0)
  const [isPlayingOpening, setIsPlayingOpening] = useState(false)

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Opening[]>([])

  // UI preferences
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

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

  // Enhanced logging function
  const logAction = useCallback((action: string, details?: any) => {
    console.log(`[ChessPractice] ${action}`, details || '')
  }, [])

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    logAction('Dark mode toggled', { isDarkMode: !isDarkMode })
  }

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Make a move programmatically (for suggested moves)
  const makeMove = useCallback((moveStr: string) => {
    try {
      const g = new Chess(game.fen())
      const move = g.move(moveStr)

      if (move) {
        logAction('Programmatic move successful', { move: moveStr, san: move.san })
        setGame(g)
        setMoveHistory([...g.history()])

        // Reset opening playback if user makes manual move during playback
        if (isPlayingOpening) {
          logAction('Manual move during opening playback - resetting')
          setIsPlayingOpening(false)
          setPopularMovesIndex(0)
        }

        return true
      } else {
        logAction('Programmatic move failed', { move: moveStr })
        return false
      }
    } catch (error: any) {
      logAction('ERROR: Programmatic move exception', { move: moveStr, error: error.message })
      return false
    }
  }, [game, isPlayingOpening, logAction])

  useEffect(() => {
    logAction('Initializing ECO data...')

    try {
      // Combine all ECO files
      const allEcoData = { ...ecoA, ...ecoB, ...ecoC, ...ecoD, ...ecoE }
      logAction('Combined ECO files', { totalEntries: Object.keys(allEcoData).length })

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

      logAction('Processed openings', {
        total: mapped.length,
        sources: [...new Set(mapped.map(o => o.src))],
        ecoRoots: mapped.filter(o => o.isEcoRoot).length
      })

      setOpenings(mapped)
      setFenToOpening(fenMap)
    } catch (error) {
      logAction('ERROR: Failed to initialize ECO data', error)
    }
  }, [logAction])

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results = openings.filter(opening => {
      // Search by name
      if (opening.name.toLowerCase().includes(query)) return true

      // Search by ECO code
      if (opening.eco && opening.eco.toLowerCase().includes(query)) return true

      // Search by move sequence
      const moveSequence = opening.moves.join(' ').toLowerCase()
      if (moveSequence.includes(query)) return true

      // Search by aliases
      if (opening.aliases) {
        const aliasValues = Object.values(opening.aliases).join(' ').toLowerCase()
        if (aliasValues.includes(query)) return true
      }

      return false
    }).slice(0, 50) // Limit results

    logAction('Search completed', { query, resultCount: results.length })
    setSearchResults(results)
  }, [searchQuery, openings, logAction])

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
      logAction('Opening matched by FEN', { name: match.name, eco: match.eco })
      setMatchedOpening(match)
      return
    }

    // Method 2: Try position-only matching (first part of FEN)
    const positionPart = currentFen.split(' ')[0]
    for (const [fen, opening] of fenToOpening.entries()) {
      if (fen.split(' ')[0] === positionPart) {
        logAction('Opening matched by position', { name: opening.name, eco: opening.eco })
        setMatchedOpening(opening)
        return
      }
    }

    // Method 3: Fallback to move sequence matching
    const moveSequenceMatch = openings.find(o => {
      if (o.moves.length < hist.length) return false
      return hist.every((move, i) => o.moves[i] === move)
    })

    if (moveSequenceMatch) {
      logAction('Opening matched by move sequence', {
        name: moveSequenceMatch.name,
        eco: moveSequenceMatch.eco,
        matchedMoves: hist.length,
        totalMoves: moveSequenceMatch.moves.length
      })
    } else {
      logAction('No opening match found', { moveHistory: hist })
    }

    setMatchedOpening(moveSequenceMatch || null)
  }, [moveHistory, game, fenToOpening, openings, logAction])

  const position = useMemo(() => game.fen(), [game])

  type OnPieceDropType = ({ piece, sourceSquare, targetSquare, }: PieceDropHandlerArgs) => boolean;
  const onPieceDrop: OnPieceDropType = ({
    piece,
    sourceSquare,
    targetSquare
  }): boolean => {
    if (!targetSquare) {
      logAction('Invalid drop - no target square')
      return false
    }

    logAction('Attempting move', { from: sourceSquare, to: targetSquare, piece })

    const g = new Chess(game.fen())

    try {
      const move = g.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })

      if (!move) {
        logAction('Move rejected by chess.js', { from: sourceSquare, to: targetSquare })
        return false
      }

      logAction('Move successful', {
        move: move.san,
        from: sourceSquare,
        to: targetSquare,
        newFen: g.fen()
      })

      setGame(g)
      setMoveHistory([...g.history()])

      // Reset opening playback if user makes manual move during playback
      if (isPlayingOpening) {
        logAction('User made manual move during opening playback - resetting')
        setIsPlayingOpening(false)
        setPopularMovesIndex(0)
      }

      return true

    } catch (error: any) {
      logAction('ERROR: Invalid move attempted', {
        from: sourceSquare,
        to: targetSquare,
        error: error.message
      })
      return false
    }
  }

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
    try {
      const chosen = popularSorted[index]
      if (!chosen) {
        logAction('ERROR: No opening found at index', { index })
        return
      }

      logAction('Starting popular opening', {
        index,
        name: chosen.name,
        eco: chosen.eco,
        totalMoves: chosen.moves.length
      })

      const g = new Chess()
      setPopularIndex(index)
      setPopularMovesIndex(0)
      setGame(g)
      setMoveHistory([])
      setMatchedOpening(chosen)
      setIsPlayingOpening(true)
      setMode('popular')

    } catch (error) {
      logAction('ERROR: Failed to start popular opening', { index, error })
    }
  }

  function startSearchResult(opening: Opening) {
    try {
      logAction('Starting opening from search', {
        name: opening.name,
        eco: opening.eco,
        totalMoves: opening.moves.length
      })

      const g = new Chess()
      setGame(g)
      setMoveHistory([])
      setMatchedOpening(opening)
      setIsPlayingOpening(true)
      setPopularMovesIndex(0)
      // Find index in popularSorted for consistency
      const index = popularSorted.findIndex(o => o.fen === opening.fen)
      setPopularIndex(Math.max(0, index))
      setMode('popular')

    } catch (error) {
      logAction('ERROR: Failed to start opening from search', { opening: opening.name, error })
    }
  }

  function popularStepForward() {
    try {
      const chosen = matchedOpening || popularSorted[popularIndex]
      if (!chosen || popularMovesIndex >= chosen.moves.length) {
        logAction('Cannot step forward', {
          hasOpening: !!chosen,
          currentIndex: popularMovesIndex,
          totalMoves: chosen?.moves.length || 0
        })
        return
      }

      const moveSAN = chosen.moves[popularMovesIndex]
      const g = new Chess(game.fen())

      logAction('Stepping forward', {
        moveIndex: popularMovesIndex,
        move: moveSAN,
        currentFen: game.fen()
      })

      const move = g.move(moveSAN)
      if (move) {
        setGame(g)
        setMoveHistory([...g.history()])
        setPopularMovesIndex(popularMovesIndex + 1)
        logAction('Step forward successful', {
          newIndex: popularMovesIndex + 1,
          newFen: g.fen()
        })
      } else {
        logAction('ERROR: Failed to apply move', { move: moveSAN })
      }
    } catch (error: any) {
      logAction('ERROR: Exception during step forward', {
        error: error.message,
        moveIndex: popularMovesIndex
      })
    }
  }

  function popularStepBack() {
    try {
      if (popularMovesIndex > 0) {
        logAction('Stepping back', {
          currentIndex: popularMovesIndex,
          currentFen: game.fen()
        })

        const g = new Chess(game.fen())
        g.undo()
        setGame(g)
        setMoveHistory([...g.history()])
        setPopularMovesIndex(popularMovesIndex - 1)

        logAction('Step back successful', {
          newIndex: popularMovesIndex - 1,
          newFen: g.fen()
        })
      } else {
        logAction('Cannot step back - already at start')
      }
    } catch (error: any) {
      logAction('ERROR: Exception during step back', { error: error.message })
    }
  }

  function resetGame() {
    try {
      logAction('Resetting game')
      const g = new Chess()
      setGame(g)
      setMoveHistory([])
      setMatchedOpening(null)
      setPopularMovesIndex(0)
      setIsPlayingOpening(false)
      logAction('Game reset successful')
    } catch (error) {
      logAction('ERROR: Failed to reset game', error)
    }
  }

  // Movement control functions
  function goToStart() {
    try {
      logAction('Going to start position')
      const g = new Chess()
      setGame(g)
      setMoveHistory([])
      setPopularMovesIndex(0)
      if (isPlayingOpening && matchedOpening) {
        logAction('Reset to start of opening', { opening: matchedOpening.name })
      }
    } catch (error) {
      logAction('ERROR: Failed to go to start', error)
    }
  }

  function goToEnd() {
    try {
      const chosen = matchedOpening || popularSorted[popularIndex]
      if (!chosen) return

      logAction('Going to end of opening', { totalMoves: chosen.moves.length })

      const g = new Chess()
      for (let i = 0; i < chosen.moves.length; i++) {
        const move = g.move(chosen.moves[i])
        if (!move) {
          logAction('ERROR: Failed to apply move during go-to-end', {
            moveIndex: i,
            move: chosen.moves[i]
          })
          break
        }
      }

      setGame(g)
      setMoveHistory([...g.history()])
      setPopularMovesIndex(chosen.moves.length)

    } catch (error) {
      logAction('ERROR: Exception during go-to-end', error)
    }
  }

  const currentOpeningProgress = matchedOpening ?
    `${popularMovesIndex}/${matchedOpening.moves.length}` : '0/0'

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header with controls */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chess Opening Trainer</h1>
          <div className="flex items-center gap-4">
            {/* Board Orientation Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Board:</span>
              <button
                className={`px-3 py-1 rounded text-sm border ${boardOrientation === 'white'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                onClick={() => {
                  setBoardOrientation('white')
                  logAction('Board orientation changed to white')
                }}
              >
                ♔ White
              </button>
              <button
                className={`px-3 py-1 rounded text-sm border ${boardOrientation === 'black'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                onClick={() => {
                  setBoardOrientation('black')
                  logAction('Board orientation changed to black')
                }}
              >
                ♚ Black
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Theme:</span>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Toggle dark mode"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
        <div className="shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-gray-800 p-4">
          <Chessboard
            options={{
              boardOrientation: boardOrientation,
              position: position,
              onPieceDrop: onPieceDrop,
            }}
          />
        </div>

        <div className="flex-1 space-y-4 max-w-2xl">
          {/* Mode and Status */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Training Mode</h2>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded text-sm ${mode === 'practice' ? 'bg-blue-600 text-white' : 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  onClick={() => {
                    setMode('practice')
                    setIsPlayingOpening(false)
                    logAction('Switched to practice mode')
                  }}
                >
                  Practice
                </button>
                <button
                  className={`px-3 py-1 rounded text-sm ${mode === 'popular' ? 'bg-blue-600 text-white' : 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  onClick={() => {
                    setMode('popular')
                    logAction('Switched to popular mode')
                  }}
                >
                  Popular
                </button>
                <button
                  className={`px-3 py-1 rounded text-sm ${mode === 'search' ? 'bg-blue-600 text-white' : 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  onClick={() => {
                    setMode('search')
                    logAction('Switched to search mode')
                  }}
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
            </div>

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

            {/* Movement Controls - Always visible when playing opening */}
            {isPlayingOpening && matchedOpening && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm font-medium mb-3 text-blue-900 dark:text-blue-100">
                  Opening Controls
                </div>
                <div className="flex gap-2 justify-center mb-3">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm font-medium"
                    onClick={goToStart}
                    title="Go to start"
                  >
                    ⏮ Start
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm font-medium"
                    onClick={popularStepBack}
                    disabled={popularMovesIndex === 0}
                    title="Previous move"
                  >
                    ⏪ Back
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                    onClick={popularStepForward}
                    disabled={popularMovesIndex >= (matchedOpening.moves || []).length}
                    title="Next move"
                  >
                    ⏩ Forward
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm font-medium"
                    onClick={goToEnd}
                    title="Go to end"
                  >
                    ⏭ End
                  </button>
                </div>
                {popularMovesIndex < (matchedOpening.moves || []).length && (
                  <div className="text-center">
                    <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                      Next move:
                    </div>
                    <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded-lg font-mono text-lg">
                      {matchedOpening.moves[popularMovesIndex]}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Matched Opening</h3>
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
                    <div className="font-semibold text-gray-900 dark:text-white">{matchedOpening.name}</div>
                  </div>
                ) : (
                  <div className="text-gray-500">No match</div>
                )}
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Move History</h3>
                <div className="text-sm text-gray-400">
                  {moveHistory.length > 0 ? moveHistory.join(' ') : '—'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {openings.length} openings loaded
                </div>
              </div>
            </div>
          </div>

          {/* Search Mode */}
          {mode === 'search' && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Search Openings</h3>
              <input
                type="text"
                placeholder="Search by name, ECO code, or moves (e.g., 'Sicilian', 'B20', '1.e4 c5')..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {searchResults.length > 0 && (
                <div className="mt-3 space-y-2 max-h-64 overflow-auto">
                  {searchResults.map((opening, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>{opening.eco}</span>
                          {opening.src && (
                            <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">
                              {opening.src}
                            </span>
                          )}
                          {opening.isEcoRoot && (
                            <span className="text-xs bg-blue-200 dark:bg-blue-600 px-1 rounded">
                              ROOT
                            </span>
                          )}
                        </div>
                        <div className="font-medium truncate text-gray-900 dark:text-white">{opening.name}</div>
                        <div className="text-xs text-gray-500">
                          {opening.moves.slice(0, 4).join(' ')}
                          {opening.moves.length > 4 && '...'}
                        </div>
                      </div>
                      <button
                        className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 ml-2"
                        onClick={() => startSearchResult(opening)}
                      >
                        Play
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <div className="mt-3 text-gray-500 text-center">No results found</div>
              )}
            </div>
          )}

          {/* Suggested Moves - Now Clickable */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Suggested Next Moves</h3>
            {suggestions.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {suggestions.map((move, i) => (
                  <button
                    key={i}
                    className="px-3 py-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium transition-colors border border-blue-200 dark:border-blue-700"
                    onClick={() => makeMove(move)}
                    title={`Play ${move}`}
                  >
                    {move}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No suggestions available</div>
            )}
          </div>

          {/* Popular Openings */}
          {mode === 'popular' && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Popular Openings</h3>
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
                      <div className="font-medium truncate text-gray-900 dark:text-white">{o.name}</div>
                      <div className="text-xs text-gray-500">
                        {o.moves.slice(0, 3).join(' ')}... ({o.moves.length} moves)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{o.popularity}</span>
                      <button
                        className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                        onClick={() => startPopularAt(i)}
                      >
                        Study
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
