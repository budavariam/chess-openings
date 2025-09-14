import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Chess } from 'chess.js'
import { PieceDropHandlerArgs } from 'react-chessboard'
import { toast } from 'react-toastify'
import ecoA from './eco.json/ecoA.json'
import ecoB from './eco.json/ecoB.json'
import ecoC from './eco.json/ecoC.json'
import ecoD from './eco.json/ecoD.json'
import ecoE from './eco.json/ecoE.json'
import type { Opening, ChessMode, BoardOrientation } from './types'
import { BoardOrientationControl } from './components/BoardOrientation'
import { ChessBoard } from './components/ChessBoard'
import { ModeSelector } from './components/ModeSelector'
import { GameStatus } from './components/GameStatus'
import { OpeningControls } from './components/OpeningControls'
import { SearchOpenings } from './components/SearchOpenings'
import { SuggestedMoves } from './components/SuggestedMoves'
import { PopularOpenings } from './components/PopularOpenings'
import { calculatePopularity, parseMovesString } from './utils/chessUtils'

export default function ChessPractice() {
  const [game, setGame] = useState(() => new Chess())
  const [mode, setMode] = useState<ChessMode>('practice')
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
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>('white')

  // Enhanced logging function
  const logAction = useCallback((action: string, details?: any) => {
    console.log(`[ChessPractice] ${action}`, details || '')
  }, [])

  // Make a move programmatically (for suggested moves)
  const makeMove = useCallback((moveStr: string): boolean => {
    try {
      const g = new Chess(game.fen())
      const move = g.move(moveStr)

      if (move) {
        logAction('Programmatic move successful', { move: moveStr, san: move.san })
        setGame(g)
        setMoveHistory([...g.history()])
        toast.success(`Played ${move.san}`)

        // Reset opening playbook if user makes manual move during playback
        if (isPlayingOpening) {
          logAction('Manual move during opening playback - resetting')
          setIsPlayingOpening(false)
          setPopularMovesIndex(0)
          toast.info('Exited opening study mode')
        }

        return true
      } else {
        logAction('Programmatic move failed', { move: moveStr })
        toast.error(`Invalid move: ${moveStr}`)
        return false
      }
    } catch (error: any) {
      const errorMessage = error && typeof error === 'object' && error.message ? error.message : String(error)
      logAction('ERROR: Programmatic move exception', { move: moveStr, error: errorMessage })
      toast.error(`Move failed: ${errorMessage}`)
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
      toast.success(`Loaded ${mapped.length} chess openings`)
    } catch (error: any) {
      const errorMessage = error && typeof error === 'object' && error.message ? error.message : String(error)
      logAction('ERROR: Failed to initialize ECO data', errorMessage)
      toast.error(`Failed to load openings: ${errorMessage}`)
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

  // SIMPLIFIED: Skip automatic matching when studying an opening
  useEffect(() => {
    // FIXED: Skip all automatic matching when in study mode
    if (isPlayingOpening) {
      logAction('Skipping automatic opening matching - in study mode')
      return
    }

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
  }, [moveHistory, game, fenToOpening, openings, logAction, isPlayingOpening])

  const position = useMemo(() => game.fen(), [game])

  const onPieceDrop = useCallback((args: PieceDropHandlerArgs): boolean => {
    const { piece, sourceSquare, targetSquare } = args

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
        toast.error('Invalid move!')
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
        toast.info('Exited opening study mode')
      }

      return true

    } catch (error: any) {
      const errorMessage = error && typeof error === 'object' && error.message ? error.message : String(error)
      logAction('ERROR: Invalid move attempted', {
        from: sourceSquare,
        to: targetSquare,
        error: errorMessage
      })
      toast.error(`Invalid move: ${errorMessage}`)
      return false
    }
  }, [game, isPlayingOpening, logAction])

  // Get suggested next moves based on current position - FIXED for both sides
  const suggestions = useMemo(() => {
    // Always show suggestions, even at the start
    const matches = openings.filter(o => {
      if (o.moves.length <= moveHistory.length) return false

      // If no moves played yet, suggest first moves
      if (moveHistory.length === 0) return true

      // Check if current move history matches the opening prefix
      for (let i = 0; i < moveHistory.length; i++) {
        if (o.moves[i] !== moveHistory[i]) return false
      }
      return true
    })

    const uniqueMoves = Array.from(new Set(
      matches.map(m => m.moves[moveHistory.length]).filter(Boolean)
    ))

    // Sort moves by popularity
    const movesWithPopularity = uniqueMoves.map(move => {
      const openingsWithMove = matches.filter(o => o.moves[moveHistory.length] === move)
      const avgPopularity = openingsWithMove.reduce((sum, o) => sum + o.popularity, 0) / openingsWithMove.length
      return { move, popularity: avgPopularity }
    })

    movesWithPopularity.sort((a, b) => b.popularity - a.popularity)

    logAction('Suggestions calculated', {
      moveHistory,
      matchCount: matches.length,
      suggestionCount: movesWithPopularity.length
    })

    return movesWithPopularity.slice(0, 8).map(item => item.move)
  }, [moveHistory, openings, logAction])

  // FIXED: Filter popular openings by current position/moves when playing an opening
  const popularSorted = useMemo(() => {
    let filteredOpenings = openings

    // If we're currently in a position with moves, filter to show continuations
    if (moveHistory.length > 0) {
      filteredOpenings = openings.filter(o => {
        // Show openings that start with our current move sequence
        if (o.moves.length <= moveHistory.length) return false
        return moveHistory.every((move, i) => o.moves[i] === move)
      })

      logAction('Filtered openings by current position', {
        originalCount: openings.length,
        filteredCount: filteredOpenings.length,
        moveHistory
      })
    }

    return filteredOpenings
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
  }, [openings, moveHistory, logAction])

  // FIXED: Set matched opening IMMEDIATELY before setting isPlayingOpening
  const startPopularAt = useCallback((index: number) => {
    try {
      const chosen = popularSorted[index]
      if (!chosen) {
        logAction('ERROR: No opening found at index', { index })
        toast.error('Opening not found')
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

      // FIXED: Set matched opening IMMEDIATELY, before setting isPlayingOpening
      setMatchedOpening(chosen)
      setIsPlayingOpening(true) // Now both conditions are true
      setMode('popular')

      toast.success(`Started studying: ${chosen.name}`)

    } catch (error: any) {
      const errorMessage = error && typeof error === 'object' && error.message ? error.message : String(error)
      logAction('ERROR: Failed to start popular opening', { index, error: errorMessage })
      toast.error(`Failed to start opening: ${errorMessage}`)
    }
  }, [popularSorted, logAction])

  // FIXED: Set matched opening IMMEDIATELY before setting isPlayingOpening
  const startSearchResult = useCallback((opening: Opening) => {
    try {
      logAction('Starting opening from search', {
        name: opening.name,
        eco: opening.eco,
        totalMoves: opening.moves.length
      })

      const g = new Chess()
      setGame(g)
      setMoveHistory([])

      // FIXED: Set matched opening IMMEDIATELY, before setting isPlayingOpening
      setMatchedOpening(opening)
      setIsPlayingOpening(true) // Now both conditions are true
      setPopularMovesIndex(0)

      // Find index in popularSorted for consistency
      const index = popularSorted.findIndex(o => o.fen === opening.fen)
      setPopularIndex(Math.max(0, index))
      setMode('popular')

      toast.success(`Started studying: ${opening.name}`)

    } catch (error: any) {
      const errorMessage = error && typeof error === 'object' && error.message ? error.message : String(error)
      logAction('ERROR: Failed to start opening from search', { opening: opening.name, error: errorMessage })
      toast.error(`Failed to start opening: ${errorMessage}`)
    }
  }, [popularSorted, logAction])

  const popularStepForward = useCallback(() => {
    try {
      const chosen = matchedOpening || popularSorted[popularIndex]
      if (!chosen || popularMovesIndex >= chosen.moves.length) {
        logAction('Cannot step forward', {
          hasOpening: !!chosen,
          currentIndex: popularMovesIndex,
          totalMoves: chosen?.moves.length || 0
        })
        toast.warning('No more moves in this opening')
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
        toast.info(`Played: ${move.san}`)
      } else {
        logAction('ERROR: Failed to apply move', { move: moveSAN })
        toast.error(`Failed to play move: ${moveSAN}`)
      }
    } catch (error: any) {
      const errorMessage = error && typeof error === 'object' && error.message ? error.message : String(error)
      logAction('ERROR: Exception during step forward', {
        error: errorMessage,
        moveIndex: popularMovesIndex
      })
      toast.error(`Error stepping forward: ${errorMessage}`)
    }
  }, [matchedOpening, popularSorted, popularIndex, popularMovesIndex, game, logAction])

  const popularStepBack = useCallback(() => {
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
        toast.info('Stepped back one move')
      } else {
        logAction('Cannot step back - already at start')
        toast.warning('Already at the beginning')
      }
    } catch (error: any) {
      const errorMessage = error && typeof error === 'object' && error.message ? error.message : String(error)
      logAction('ERROR: Exception during step back', { error: errorMessage })
      toast.error(`Error stepping back: ${errorMessage}`)
    }
  }, [popularMovesIndex, game, logAction])

  const resetGame = useCallback(() => {
    try {
      logAction('Resetting game')
      const g = new Chess()
      setGame(g)
      setMoveHistory([])
      setMatchedOpening(null)
      setPopularMovesIndex(0)
      setIsPlayingOpening(false)
      logAction('Game reset successful')
      toast.success('Game reset')
    } catch (error: any) {
      const errorMessage = error && typeof error === 'object' && error.message ? error.message : String(error)
      logAction('ERROR: Failed to reset game', errorMessage)
      toast.error(`Reset failed: ${errorMessage}`)
    }
  }, [logAction])

  // Movement control functions
  const goToStart = useCallback(() => {
    try {
      logAction('Going to start position')
      const g = new Chess()
      setGame(g)
      setMoveHistory([])
      setPopularMovesIndex(0)
      if (isPlayingOpening && matchedOpening) {
        logAction('Reset to start of opening', { opening: matchedOpening.name })
      }
      toast.info('Moved to start position')
    } catch (error: any) {
      const errorMessage = error && typeof error === 'object' && error.message ? error.message : String(error)
      logAction('ERROR: Failed to go to start', errorMessage)
      toast.error(`Failed to go to start: ${errorMessage}`)
    }
  }, [isPlayingOpening, matchedOpening, logAction])

  const goToEnd = useCallback(() => {
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
      toast.info(`Moved to end of opening (${chosen.moves.length} moves)`)

    } catch (error: any) {
      const errorMessage = error && typeof error === 'object' && error.message ? error.message : String(error)
      logAction('ERROR: Exception during go-to-end', errorMessage)
      toast.error(`Failed to go to end: ${errorMessage}`)
    }
  }, [matchedOpening, popularSorted, popularIndex, logAction])

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Chessboard with last move highlighting */}
      <ChessBoard
        position={position}
        boardOrientation={boardOrientation}
        onPieceDrop={onPieceDrop}
        game={game}
      />

      <div className="flex-1 space-y-4 min-w-0 max-w-2xl">
        <BoardOrientationControl
          boardOrientation={boardOrientation}
          setBoardOrientation={setBoardOrientation}
          logAction={logAction}
        />
        {/* Suggested Moves */}
        <SuggestedMoves
          suggestions={suggestions}
          makeMove={makeMove}
        />

        {/* Mode and Status */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Training Mode</h2>
            <ModeSelector
              mode={mode}
              setMode={setMode}
              setIsPlayingOpening={setIsPlayingOpening}
              resetGame={resetGame}
              logAction={logAction}
            />
          </div>

          <GameStatus
            isPlayingOpening={isPlayingOpening}
            matchedOpening={matchedOpening}
            popularMovesIndex={popularMovesIndex}
            moveHistory={moveHistory}
            openingsCount={openings.length}
          />

          <OpeningControls
            isPlayingOpening={isPlayingOpening}
            matchedOpening={matchedOpening}
            popularMovesIndex={popularMovesIndex}
            goToStart={goToStart}
            popularStepBack={popularStepBack}
            popularStepForward={popularStepForward}
            goToEnd={goToEnd}
          />
        </div>

        {/* Search Mode */}
        {mode === 'search' && (
          <SearchOpenings
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            startSearchResult={startSearchResult}
          />
        )}

        {/* Popular Openings */}
        {mode === 'popular' && (
          <PopularOpenings
            moveHistory={moveHistory}
            popularSorted={popularSorted}
            startPopularAt={startPopularAt}
          />
        )}
      </div>
    </div>
  )
}