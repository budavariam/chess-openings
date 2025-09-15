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

  const [popularIndex, setPopularIndex] = useState(0)
  const [popularMovesIndex, setPopularMovesIndex] = useState(0)
  const [isPlayingOpening, setIsPlayingOpening] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Opening[]>([])
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>('white')

  const logAction = useCallback((action: string, details?: any) => {
    console.log(`[ChessPractice] ${action}`, details || '')
  }, [])

  const makeMove = useCallback((moveStr: string): boolean => {
    try {
      const g = new Chess(game.fen())
      const move = g.move(moveStr)

      if (move) {
        logAction('Programmatic move successful', { move: moveStr, san: move.san })
        setGame(g)
        setMoveHistory([...g.history()])
        toast.success(`Played ${move.san}`)

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
      const errorMessage = error?.message || String(error)
      logAction('ERROR: Programmatic move exception', { move: moveStr, error: errorMessage })
      toast.error(`Move failed: ${errorMessage}`)
      return false
    }
  }, [game, isPlayingOpening, logAction])

  useEffect(() => {
    logAction('Initializing ECO data...')

    try {
      const allEcoData = { ...ecoA, ...ecoB, ...ecoC, ...ecoD, ...ecoE }
      logAction('Combined ECO files', { totalEntries: Object.keys(allEcoData).length })

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
      const errorMessage = error?.message || String(error)
      logAction('ERROR: Failed to initialize ECO data', errorMessage)
      toast.error(`Failed to load openings: ${errorMessage}`)
    }
  }, [logAction])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results = openings.filter(opening => {
      if (opening.name.toLowerCase().includes(query)) return true
      if (opening.eco?.toLowerCase().includes(query)) return true

      const moveSequence = opening.moves.join(' ').toLowerCase()
      if (moveSequence.includes(query)) return true

      if (opening.aliases) {
        const aliasValues = Object.values(opening.aliases).join(' ').toLowerCase()
        if (aliasValues.includes(query)) return true
      }

      return false
    }).slice(0, 50)

    logAction('Search completed', { query, resultCount: results.length })
    setSearchResults(results)
  }, [searchQuery, openings, logAction])

  useEffect(() => {
    if (isPlayingOpening) {
      logAction('Skipping automatic opening matching - in study mode')
      return
    }

    const currentFen = game.fen()
    const hist = moveHistory

    if (hist.length === 0) {
      setMatchedOpening(null)
      return
    }

    let match = fenToOpening.get(currentFen)
    if (match) {
      logAction('Opening matched by FEN', { name: match.name, eco: match.eco })
      setMatchedOpening(match)
      return
    }

    const positionPart = currentFen.split(' ')
    for (const [fen, opening] of fenToOpening.entries()) {
      if (fen.split(' ') === positionPart) {
        logAction('Opening matched by position', { name: opening.name, eco: opening.eco })
        setMatchedOpening(opening)
        return
      }
    }

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

      if (isPlayingOpening) {
        logAction('User made manual move during opening playback - resetting')
        setIsPlayingOpening(false)
        setPopularMovesIndex(0)
        toast.info('Exited opening study mode')
      }

      return true

    } catch (error: any) {
      const errorMessage = error?.message || String(error)
      logAction('ERROR: Invalid move attempted', {
        from: sourceSquare,
        to: targetSquare,
        error: errorMessage
      })
      toast.error(`Invalid move: ${errorMessage}`)
      return false
    }
  }, [game, isPlayingOpening, logAction])

  const suggestions = useMemo(() => {
    const matches = openings.filter(o => {
      if (o.moves.length <= moveHistory.length) return false
      if (moveHistory.length === 0) return true

      for (let i = 0; i < moveHistory.length; i++) {
        if (o.moves[i] !== moveHistory[i]) return false
      }
      return true
    })

    const uniqueMoves = Array.from(new Set(
      matches.map(m => m.moves[moveHistory.length]).filter(Boolean)
    ))

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

  const popularSorted = useMemo(() => {
    let filteredOpenings = openings

    if (moveHistory.length > 0) {
      filteredOpenings = openings.filter(o => {
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
      setMatchedOpening(chosen)
      setIsPlayingOpening(true)
      setMode('popular')

      toast.success(`Started studying: ${chosen.name}`)

    } catch (error: any) {
      const errorMessage = error?.message || String(error)
      logAction('ERROR: Failed to start popular opening', { index, error: errorMessage })
      toast.error(`Failed to start opening: ${errorMessage}`)
    }
  }, [popularSorted, logAction])

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
      setMatchedOpening(opening)
      setIsPlayingOpening(true)
      setPopularMovesIndex(0)

      const index = popularSorted.findIndex(o => o.fen === opening.fen)
      setPopularIndex(Math.max(0, index))
      setMode('popular')

      toast.success(`Started studying: ${opening.name}`)

    } catch (error: any) {
      const errorMessage = error?.message || String(error)
      logAction('ERROR: Failed to start opening from search', { opening: opening.name, error: errorMessage })
      toast.error(`Failed to start opening: ${errorMessage}`)
    }
  }, [popularSorted, logAction])

  const navigateToMove = useCallback((targetIndex: number) => {
    try {
      const chosen = matchedOpening || popularSorted[popularIndex]
      if (!chosen) {
        logAction('Cannot navigate - no opening selected')
        toast.error('No opening selected')
        return
      }

      const maxMoves = chosen.moves.length
      const safeIndex = Math.max(0, Math.min(targetIndex, maxMoves))

      logAction('Navigating to move', {
        targetIndex,
        safeIndex,
        maxMoves,
        currentIndex: popularMovesIndex
      })

      const g = new Chess()
      for (let i = 0; i < safeIndex; i++) {
        if (i < chosen.moves.length) {
          const move = g.move(chosen.moves[i])
          if (!move) {
            logAction('ERROR: Failed to apply move during navigation', {
              moveIndex: i,
              move: chosen.moves[i]
            })
            break
          }
        }
      }

      setGame(g)
      setMoveHistory([...g.history()])
      setPopularMovesIndex(safeIndex)

      if (safeIndex === 0) {
        toast.info('Moved to start position')
      } else if (safeIndex === maxMoves) {
        toast.info(`Moved to end of opening (${maxMoves} moves)`)
      } else {
        toast.info(`Moved to move ${safeIndex}`)
      }

    } catch (error: any) {
      const errorMessage = error?.message || String(error)
      logAction('ERROR: Exception during navigation', { targetIndex, error: errorMessage })
      toast.error(`Navigation failed: ${errorMessage}`)
    }
  }, [matchedOpening, popularSorted, popularIndex, popularMovesIndex, logAction])

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
      const errorMessage = error?.message || String(error)
      logAction('ERROR: Failed to reset game', errorMessage)
      toast.error(`Reset failed: ${errorMessage}`)
    }
  }, [logAction])

  return (
    <div className="flex flex-col lg:flex-row gap-4">
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

        <SuggestedMoves
          suggestions={suggestions}
          makeMove={makeMove}
        />

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
            onStudyOpening={startSearchResult} 
          />

          <OpeningControls
            isPlayingOpening={isPlayingOpening}
            matchedOpening={matchedOpening}
            popularMovesIndex={popularMovesIndex}
            onNavigate={navigateToMove}
            gameHistoryLength={moveHistory.length}
          />
        </div>

        {mode === 'search' && (
          <SearchOpenings
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            startSearchResult={startSearchResult}
          />
        )}

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
