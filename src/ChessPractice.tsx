import React, { useReducer, useMemo, useCallback, useEffect } from 'react'
import { Chess } from 'chess.js'
import { PieceDropHandlerArgs } from 'react-chessboard'
import { toast } from 'react-toastify'
import ecoA from './eco.json/ecoA.json'
import ecoB from './eco.json/ecoB.json'
import ecoC from './eco.json/ecoC.json'
import ecoD from './eco.json/ecoD.json'
import ecoE from './eco.json/ecoE.json'
import type { Opening, ChessMode, BoardOrientation } from './types'
import { ChessBoard } from './components/ChessBoard'
import { ModeSelector } from './components/ModeSelector'
import { GameStatus } from './components/GameStatus'
import { OpeningControls } from './components/OpeningControls'
import { SearchOpenings } from './components/SearchOpenings'
import { SuggestedMoves } from './components/SuggestedMoves'
import { PopularOpenings } from './components/PopularOpenings'
import { FavouriteOpenings } from './components/FavouriteOpenings'
import { calculatePopularity, parseMovesString } from './utils/chessUtils'

interface ChessState {
  game: Chess
  mode: ChessMode
  openings: Opening[]
  moveHistory: string[]
  matchedOpening: Opening | null
  fenToOpening: Map<string, Opening>
  popularIndex: number
  popularMovesIndex: number
  isPlayingOpening: boolean
  searchQuery: string
  searchResults: Opening[]
  boardOrientation: BoardOrientation
  openingsLoaded: boolean
  favouriteIds: string[]
}

type ChessAction =
  | { type: 'SET_GAME_STATE'; payload: { game: Chess; moveHistory: string[]; popularMovesIndex: number } }
  | { type: 'SET_MODE'; payload: ChessMode }
  | { type: 'SET_OPENINGS_DATA'; payload: { openings: Opening[]; fenToOpening: Map<string, Opening> } }
  | { type: 'SET_MATCHED_OPENING'; payload: Opening | null }
  | { type: 'SET_POPULAR_INDEX'; payload: number }
  | { type: 'SET_IS_PLAYING_OPENING'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: Opening[] }
  | { type: 'SET_BOARD_ORIENTATION'; payload: BoardOrientation }
  | { type: 'SET_FAVOURITE_IDS'; payload: string[] }
  | { type: 'RESET_GAME' }
  | { type: 'EXIT_OPENING_STUDY' }

function chessReducer(state: ChessState, action: ChessAction): ChessState {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return {
        ...state,
        game: action.payload.game,
        moveHistory: action.payload.moveHistory,
        popularMovesIndex: action.payload.popularMovesIndex
      }
    case 'SET_MODE':
      return { ...state, mode: action.payload }
    case 'SET_OPENINGS_DATA':
      return {
        ...state,
        openings: action.payload.openings,
        fenToOpening: action.payload.fenToOpening,
        openingsLoaded: true
      }
    case 'SET_MATCHED_OPENING':
      return { ...state, matchedOpening: action.payload }
    case 'SET_POPULAR_INDEX':
      return { ...state, popularIndex: action.payload }
    case 'SET_IS_PLAYING_OPENING':
      return { ...state, isPlayingOpening: action.payload }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload }
    case 'SET_BOARD_ORIENTATION':
      return { ...state, boardOrientation: action.payload }
    case 'SET_FAVOURITE_IDS':
      return { ...state, favouriteIds: action.payload }
    case 'RESET_GAME':
      return {
        ...state,
        game: new Chess(),
        moveHistory: [],
        matchedOpening: null,
        popularMovesIndex: 0,
        isPlayingOpening: false
      }
    case 'EXIT_OPENING_STUDY':
      return {
        ...state,
        isPlayingOpening: false,
        popularMovesIndex: 0
      }
    default:
      return state
  }
}

export default function ChessPractice() {
  // Initialize with lazy loading of favorites from localStorage
  const [state, dispatch] = useReducer(chessReducer, undefined, () => {
    let favouriteIds: string[] = []
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('chess-opening-favourites')
        favouriteIds = saved ? JSON.parse(saved) : []
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error)
    }

    return {
      game: new Chess(),
      mode: 'practice' as ChessMode,
      openings: [],
      moveHistory: [],
      matchedOpening: null,
      fenToOpening: new Map(),
      popularIndex: 0,
      popularMovesIndex: 0,
      isPlayingOpening: false,
      searchQuery: '',
      searchResults: [],
      boardOrientation: 'white' as BoardOrientation,
      openingsLoaded: false,
      favouriteIds
    }
  })

  const logAction = useCallback((action: string, details?: any) => {
    console.log(`[ChessPractice] ${action}`, details || '')
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('chess-opening-favourites', JSON.stringify(state.favouriteIds))
      logAction('Saved favorites to localStorage', { count: state.favouriteIds.length })
    } catch (error: any) {
      logAction('ERROR: Failed to save favorites to localStorage', error.message)
    }
  }, [state.favouriteIds, logAction])

  // Toggle favorite function
  const toggleFavourite = useCallback((openingId: string) => {
    try {
      const isCurrentlyFavourite = state.favouriteIds.includes(openingId)
      let newFavouriteIds: string[]

      if (isCurrentlyFavourite) {
        // Remove from favorites
        newFavouriteIds = state.favouriteIds.filter(id => id !== openingId)
        logAction('Removed from favorites', { openingId })
        toast.info('Removed from favorites')
      } else {
        // Add to favorites
        newFavouriteIds = [...state.favouriteIds, openingId]
        logAction('Added to favorites', { openingId })
        toast.success('Added to favorites')
      }

      dispatch({ type: 'SET_FAVOURITE_IDS', payload: newFavouriteIds })
    } catch (error: any) {
      const errorMessage = error?.message || String(error)
      logAction('ERROR: Failed to toggle favorite', { openingId, error: errorMessage })
      toast.error(`Failed to toggle favorite: ${errorMessage}`)
    }
  }, [state.favouriteIds, logAction])

  // Get favorite openings
  const favouriteOpenings = useMemo(() => {
    return state.openings.filter(opening =>
      state.favouriteIds.includes(opening.fen || opening.eco || opening.name)
    ).sort((a, b) => b.popularity - a.popularity)
  }, [state.openings, state.favouriteIds])

  // Unified function to update game state
  const updateGameState = useCallback((game: Chess, safeIndex?: number) => {
    const moveHistory = [...game.history()]
    const popularMovesIndex = safeIndex ?? moveHistory.length

    dispatch({
      type: 'SET_GAME_STATE',
      payload: { game, moveHistory, popularMovesIndex }
    })
  }, [])

  // Initialize ECO data - only useEffect we keep
  useEffect(() => {
    if (state.openingsLoaded) return

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

      dispatch({
        type: 'SET_OPENINGS_DATA',
        payload: { openings: mapped, fenToOpening: fenMap }
      })

      toast.success(`Loaded ${mapped.length} chess openings`)
    } catch (error: any) {
      const errorMessage = error?.message || String(error)
      logAction('ERROR: Failed to initialize ECO data', errorMessage)
      toast.error(`Failed to load openings: ${errorMessage}`)
    }
  }, [state.openingsLoaded, logAction])

  // Search results computation
  const searchResults = useMemo(() => {
    if (!state.searchQuery.trim()) return []

    const query = state.searchQuery.toLowerCase()
    const results = state.openings.filter(opening => {
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
    return results
  }, [state.searchQuery, state.openings, logAction])

  // Update search results when they change
  useEffect(() => {
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: searchResults })
  }, [searchResults])

  // Opening matching computation
  const matchedOpening = useMemo(() => {
    if (state.isPlayingOpening) return state.matchedOpening
    if (state.moveHistory.length === 0) return null

    const currentFen = state.game.fen()

    // Try FEN match first
    let match = state.fenToOpening.get(currentFen)
    if (match) {
      logAction('Opening matched by FEN', { name: match.name, eco: match.eco })
      return match
    }

    // Try position match
    const positionPart = currentFen.split(' ')
    for (const [fen, opening] of state.fenToOpening.entries()) {
      if (fen.split(' ') === positionPart) {
        logAction('Opening matched by position', { name: opening.name, eco: opening.eco })
        return opening
      }
    }

    // Try move sequence match
    const moveSequenceMatch = state.openings.find(o => {
      if (o.moves.length < state.moveHistory.length) return false
      return state.moveHistory.every((move, i) => o.moves[i] === move)
    })

    if (moveSequenceMatch) {
      logAction('Opening matched by move sequence', {
        name: moveSequenceMatch.name,
        eco: moveSequenceMatch.eco,
        matchedMoves: state.moveHistory.length,
        totalMoves: moveSequenceMatch.moves.length
      })
    } else {
      logAction('No opening match found', { moveHistory: state.moveHistory })
    }

    return moveSequenceMatch || null
  }, [state.moveHistory, state.game, state.fenToOpening, state.openings, state.isPlayingOpening, state.matchedOpening, logAction])

  // Update matched opening when it changes
  useEffect(() => {
    dispatch({ type: 'SET_MATCHED_OPENING', payload: matchedOpening })
  }, [matchedOpening])

  const makeMove = useCallback((moveStr: string): boolean => {
    try {
      const g = new Chess(state.game.fen())
      const move = g.move(moveStr)
      if (move) {
        logAction('Programmatic move successful', { move: moveStr, san: move.san })
        updateGameState(g)
        toast.success(`Played ${move.san}`)

        if (state.isPlayingOpening) {
          logAction('Manual move during opening playback - resetting')
          dispatch({ type: 'EXIT_OPENING_STUDY' })
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
  }, [state.game, state.isPlayingOpening, logAction, updateGameState])

  const onPieceDrop = useCallback((args: PieceDropHandlerArgs): boolean => {
    const { piece, sourceSquare, targetSquare } = args
    if (!targetSquare) {
      logAction('Invalid drop - no target square')
      return false
    }

    logAction('Attempting move', { from: sourceSquare, to: targetSquare, piece })
    const g = new Chess(state.game.fen())

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

      updateGameState(g)

      if (state.isPlayingOpening) {
        logAction('User made manual move during opening playback - resetting')
        dispatch({ type: 'EXIT_OPENING_STUDY' })
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
  }, [state.game, state.isPlayingOpening, logAction, updateGameState])

  const suggestions = useMemo(() => {
    const matches = state.openings.filter(o => {
      if (o.moves.length <= state.moveHistory.length) return false
      if (state.moveHistory.length === 0) return true
      for (let i = 0; i < state.moveHistory.length; i++) {
        if (o.moves[i] !== state.moveHistory[i]) return false
      }
      return true
    })

    const uniqueMoves = Array.from(new Set(
      matches.map(m => m.moves[state.moveHistory.length]).filter(Boolean)
    ))

    const movesWithPopularity = uniqueMoves.map(move => {
      const openingsWithMove = matches.filter(o => o.moves[state.moveHistory.length] === move)
      const avgPopularity = openingsWithMove.reduce((sum, o) => sum + o.popularity, 0) / openingsWithMove.length
      return { move, popularity: avgPopularity }
    })

    movesWithPopularity.sort((a, b) => b.popularity - a.popularity)

    logAction('Suggestions calculated', {
      moveHistory: state.moveHistory,
      matchCount: matches.length,
      suggestionCount: movesWithPopularity.length
    })

    return movesWithPopularity.slice(0, 8).map(item => item.move)
  }, [state.moveHistory, state.openings, logAction])

  const popularSorted = useMemo(() => {
    let filteredOpenings = state.openings
    if (state.moveHistory.length > 0) {
      filteredOpenings = state.openings.filter(o => {
        if (o.moves.length <= state.moveHistory.length) return false
        return state.moveHistory.every((move, i) => o.moves[i] === move)
      })
      logAction('Filtered openings by current position', {
        originalCount: state.openings.length,
        filteredCount: filteredOpenings.length,
        moveHistory: state.moveHistory
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
  }, [state.openings, state.moveHistory, logAction])

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
      dispatch({ type: 'SET_POPULAR_INDEX', payload: index })
      dispatch({ type: 'SET_MATCHED_OPENING', payload: chosen })
      dispatch({ type: 'SET_IS_PLAYING_OPENING', payload: true })
      dispatch({ type: 'SET_MODE', payload: 'popular' })
      updateGameState(g, 0)

      toast.success(`Started studying: ${chosen.name}`)
    } catch (error: any) {
      const errorMessage = error?.message || String(error)
      logAction('ERROR: Failed to start popular opening', { index, error: errorMessage })
      toast.error(`Failed to start opening: ${errorMessage}`)
    }
  }, [popularSorted, logAction, updateGameState])

  const startSearchResult = useCallback((opening: Opening, resumeAtLastPosition: boolean = true) => {
    try {
      logAction('Starting opening from search', {
        name: opening.name,
        eco: opening.eco,
        totalMoves: opening.moves.length,
        resumeAtLastPosition
      })

      const g = new Chess()
      const targetIndex = resumeAtLastPosition ? opening.moves.length : 0

      // Play moves up to target position
      for (let i = 0; i < targetIndex; i++) {
        if (i < opening.moves.length) {
          const move = g.move(opening.moves[i])
          if (!move) {
            logAction('ERROR: Failed to apply move during opening start', {
              moveIndex: i,
              move: opening.moves[i]
            })
            break
          }
        }
      }

      dispatch({ type: 'SET_MATCHED_OPENING', payload: opening })
      dispatch({ type: 'SET_IS_PLAYING_OPENING', payload: true })
      dispatch({ type: 'SET_MODE', payload: 'popular' })

      const index = popularSorted.findIndex(o => o.fen === opening.fen)
      dispatch({ type: 'SET_POPULAR_INDEX', payload: Math.max(0, index) })

      updateGameState(g, targetIndex)

      toast.success(`Started studying: ${opening.name}${resumeAtLastPosition ? ' (at final position)' : ''}`)
    } catch (error: any) {
      const errorMessage = error?.message || String(error)
      logAction('ERROR: Failed to start opening from search', { opening: opening.name, error: errorMessage })
      toast.error(`Failed to start opening: ${errorMessage}`)
    }
  }, [popularSorted, logAction, updateGameState])

  const navigateToMove = useCallback((targetIndex: number) => {
    try {
      const chosen = state.matchedOpening || popularSorted[state.popularIndex]
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
        currentIndex: state.popularMovesIndex
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

      updateGameState(g, safeIndex)

      if (safeIndex === 0) {
        toast.info('Moved to start position')
      } else {
        toast.info(`Moved to ${chosen.moves[safeIndex - 1]}`)
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error)
      logAction('ERROR: Exception during navigation', { targetIndex, error: errorMessage })
      toast.error(`Navigation failed: ${errorMessage}`)
    }
  }, [state.matchedOpening, popularSorted, state.popularIndex, state.popularMovesIndex, logAction, updateGameState])

  const resetGame = useCallback(() => {
    try {
      logAction('Resetting game')
      dispatch({ type: 'RESET_GAME' })
      logAction('Game reset successful')
      toast.success('Game reset')
    } catch (error: any) {
      const errorMessage = error?.message || String(error)
      logAction('ERROR: Failed to reset game', errorMessage)
      toast.error(`Reset failed: ${errorMessage}`)
    }
  }, [logAction])

  const handleSearchQueryChange = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
  }, [])

  const handleModeChange = useCallback((mode: ChessMode) => {
    dispatch({ type: 'SET_MODE', payload: mode })
  }, [])

  const handleSetIsPlayingOpening = useCallback((isPlaying: boolean) => {
    dispatch({ type: 'SET_IS_PLAYING_OPENING', payload: isPlaying })
  }, [])

  const handleBoardOrientationChange = useCallback((orientation: BoardOrientation) => {
    dispatch({ type: 'SET_BOARD_ORIENTATION', payload: orientation })
  }, [])

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <ChessBoard
        position={state.game.fen()}
        boardOrientation={state.boardOrientation}
        onPieceDrop={onPieceDrop}
        game={state.game}
        // position={state.game.fen()}
        // boardOrientation={state.boardOrientation}
        // onPieceDrop={onPieceDrop}
        // game={state.game}
        // boardTheme={state.boardTheme}
        // showCoordinates={state.showCoordinates}
        // onThemeChange={handleThemeChange}
        // onCoordinatesToggle={handleCoordinatesToggle}
      >

        <OpeningControls
          isPlayingOpening={state.isPlayingOpening}
          matchedOpening={state.matchedOpening}
          popularMovesIndex={state.popularMovesIndex}
          onNavigate={navigateToMove}
          gameHistoryLength={state.moveHistory.length}
          boardOrientation={state.boardOrientation}
          setBoardOrientation={handleBoardOrientationChange}
          logAction={logAction}
        />
      </ChessBoard>

      <div className="flex-1 space-y-4 min-w-0 max-w-2xl">
        <SuggestedMoves
          suggestions={suggestions}
          makeMove={makeMove}
        />

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Training Mode</h2>
            <ModeSelector
              mode={state.mode}
              setMode={handleModeChange}
              setIsPlayingOpening={handleSetIsPlayingOpening}
              resetGame={resetGame}
              logAction={logAction}
            />
          </div>
          <GameStatus
            isPlayingOpening={state.isPlayingOpening}
            matchedOpening={state.matchedOpening}
            popularMovesIndex={state.popularMovesIndex}
            moveHistory={state.moveHistory}
            openingsCount={state.openings.length}
            onStudyOpening={startSearchResult}
            logAction={logAction}
          />
        </div>

        {state.mode === 'search' && (
          <SearchOpenings
            searchQuery={state.searchQuery}
            setSearchQuery={handleSearchQueryChange}
            searchResults={state.searchResults}
            startSearchResult={startSearchResult}
            toggleFavourite={toggleFavourite}
            favouriteIds={state.favouriteIds}
          />
        )}

        {state.mode === 'popular' && (
          <PopularOpenings
            moveHistory={state.moveHistory}
            popularSorted={popularSorted}
            startPopularAt={startPopularAt}
            toggleFavourite={toggleFavourite}
            favouriteIds={state.favouriteIds}
          />
        )}

        {state.mode === 'favourites' && (
          <FavouriteOpenings
            favouriteOpenings={favouriteOpenings}
            startSearchResult={startSearchResult}
            toggleFavourite={toggleFavourite}
            favouriteIds={state.favouriteIds}
          />
        )}
      </div>
    </div>
  )
}
