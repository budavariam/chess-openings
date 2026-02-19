import { useMemo, useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Chess, Square, Move } from "chess.js";
import { PieceDropHandlerArgs } from "react-chessboard";
import { useToast } from "./hooks/useToast";
import type { Opening, ChessMode, BoardOrientation } from "./types";
import { ChessBoard } from "./components/ChessBoard";
import { ModeSelector } from "./components/ModeSelector";
import { GameStatus } from "./components/GameStatus";
import { OpeningControls } from "./components/OpeningControls";
import { SearchOpenings } from "./components/SearchOpenings";
import { SuggestedMoves } from "./components/SuggestedMoves";
import { PopularOpenings, OpeningsList } from "./components/PopularOpenings";
import { FavouriteOpenings } from "./components/FavouriteOpenings";
import { getOpeningId } from "./components/OpeningItem";
import { useOpenings, useOpeningMatch } from "./hooks/useOpenings";
import { usePreferences } from "./hooks/usePreferences";
import { useGameState, useSuggestions } from "./hooks/useGameState";
import { useClickToMove } from "./hooks/useClickToMove";

type SightTrainingMode =
  | "square-recognition"
  | "move-by-notation";

type SquareRecognitionSide = "white" | "black";
type SightTrainingScoreKey =
  | "square-recognition-white"
  | "square-recognition-black"
  | "move-by-notation";

interface SightTrainingMoveChallenge {
  from: string;
  to: string;
  san: string;
}

function getRandomSquare(): string {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];
  return `${files[Math.floor(Math.random() * files.length)]}${ranks[Math.floor(Math.random() * ranks.length)]}`;
}

function readHighScore(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

export default function ChessPractice() {
  const location = useLocation();
  const toast = useToast();

  const { openings, fenToOpening, openingMovesIndex } = useOpenings();
  const preferences = usePreferences();
  const {
    state: gameState,
    dispatch,
    makeMove,
    navigateToMove,
    resetGame,
    updateGameState,
  } = useGameState();
  const [initialSightTrainingSquare] = useState(() => getRandomSquare());
  const [sightTrainingMode, setSightTrainingMode] = useState<SightTrainingMode>(
    "square-recognition",
  );
  const [squareRecognitionSide, setSquareRecognitionSide] = useState<SquareRecognitionSide>("white");
  const [sightTrainingGame, setSightTrainingGame] = useState(() => new Chess());
  const [sightTrainingPrompt, setSightTrainingPrompt] = useState(
    `Click square ${initialSightTrainingSquare.toUpperCase()}`,
  );
  const [sightTrainingExpectedSquare, setSightTrainingExpectedSquare] = useState(
    initialSightTrainingSquare,
  );
  const [sightTrainingMoveChallenge, setSightTrainingMoveChallenge] =
    useState<SightTrainingMoveChallenge | null>(null);
  const [sightTrainingScores, setSightTrainingScores] = useState<Record<SightTrainingScoreKey, number>>({
    "square-recognition-white": 0,
    "square-recognition-black": 0,
    "move-by-notation": 0,
  });
  const [sightTrainingHighScores, setSightTrainingHighScores] = useState<Record<SightTrainingScoreKey, number>>({
    "square-recognition-white": readHighScore("sight-training-high-score-square-recognition-white"),
    "square-recognition-black": readHighScore("sight-training-high-score-square-recognition-black"),
    "move-by-notation": readHighScore("sight-training-high-score-move-by-notation"),
  });
  const [sightTrainingTurnLabel, setSightTrainingTurnLabel] = useState("White");

  const updateSightTrainingHighScore = useCallback((key: SightTrainingScoreKey, score: number) => {
    setSightTrainingHighScores((prev) => {
      if (score <= prev[key]) return prev;
      const next = { ...prev, [key]: score };
      try {
        window.localStorage.setItem(`sight-training-high-score-${key}`, String(score));
      } catch {
        // Ignore localStorage failures
      }
      return next;
    });
  }, []);

  const resetSightTrainingScore = useCallback((key: SightTrainingScoreKey) => {
    setSightTrainingScores((prev) => ({ ...prev, [key]: 0 }));
  }, []);

  const incrementSightTrainingScore = useCallback((key: SightTrainingScoreKey) => {
    setSightTrainingScores((prev) => {
      const nextScore = prev[key] + 1;
      updateSightTrainingHighScore(key, nextScore);
      return { ...prev, [key]: nextScore };
    });
  }, [updateSightTrainingHighScore]);

  const getSquareRecognitionScoreKey = useCallback(
    (side: SquareRecognitionSide): SightTrainingScoreKey =>
      side === "white" ? "square-recognition-white" : "square-recognition-black",
    [],
  );

  const startSquareRecognitionChallenge = useCallback((
    resetScore: boolean = false,
    side: SquareRecognitionSide = squareRecognitionSide,
  ) => {
    const square = getRandomSquare();

    setSightTrainingMode("square-recognition");
    setSquareRecognitionSide(side);
    setSightTrainingGame(new Chess());
    setSightTrainingPrompt(`Click square ${square.toUpperCase()}`);
    setSightTrainingExpectedSquare(square);
    setSightTrainingMoveChallenge(null);
    setSightTrainingTurnLabel(side === "white" ? "White" : "Black");
    if (resetScore) {
      resetSightTrainingScore(getSquareRecognitionScoreKey(side));
    }
  }, [getSquareRecognitionScoreKey, resetSightTrainingScore, squareRecognitionSide]);

  const startMoveByNotationChallenge = useCallback(
    (
      resetScore: boolean = false,
    ) => {
    const game = new Chess();
    const pliesToPlay = 6 + Math.floor(Math.random() * 14);

    for (let i = 0; i < pliesToPlay; i++) {
      const legalMoves = game.moves({ verbose: true }) as Move[];
      if (legalMoves.length === 0) break;
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      game.move(randomMove);
    }

      const legalMoves = game.moves({ verbose: true }) as Move[];
      if (legalMoves.length === 0) {
        startSquareRecognitionChallenge(resetScore);
        return;
      }

      const challengeMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];

      setSightTrainingMode("move-by-notation");
    setSightTrainingGame(game);
    setSightTrainingPrompt(`Play ${challengeMove.san}`);
    setSightTrainingExpectedSquare(challengeMove.to);
    setSightTrainingMoveChallenge({
      from: challengeMove.from,
      to: challengeMove.to,
      san: challengeMove.san,
    });
    setSightTrainingTurnLabel(game.turn() === "w" ? "White" : "Black");
    if (resetScore) {
        resetSightTrainingScore("move-by-notation");
    }
    },
    [resetSightTrainingScore, startSquareRecognitionChallenge],
  );

  const handleSightTrainingSquareClick = useCallback((square: string) => {
    if (sightTrainingMode !== "square-recognition") return;

    if (square.toLowerCase() === sightTrainingExpectedSquare.toLowerCase()) {
      incrementSightTrainingScore(getSquareRecognitionScoreKey(squareRecognitionSide));
      toast.success("Correct!");
      startSquareRecognitionChallenge(false, squareRecognitionSide);
      return;
    }

    toast.error(`Not correct. Try ${sightTrainingPrompt}.`);
  }, [
    incrementSightTrainingScore,
    getSquareRecognitionScoreKey,
    squareRecognitionSide,
    sightTrainingMode,
    sightTrainingExpectedSquare,
    sightTrainingPrompt,
    startSquareRecognitionChallenge,
    toast,
  ]);

  const onSightTrainingPieceDrop = useCallback(
    (args: PieceDropHandlerArgs): boolean => {
      if (sightTrainingMode !== "move-by-notation" || !sightTrainingMoveChallenge) {
        return false;
      }
      const { sourceSquare, targetSquare } = args;
      if (!targetSquare) return false;

      const isCorrectFrom =
        sourceSquare.toLowerCase() === sightTrainingMoveChallenge.from.toLowerCase();
      const isCorrectTo =
        targetSquare.toLowerCase() === sightTrainingMoveChallenge.to.toLowerCase();

      if (!isCorrectFrom || !isCorrectTo) {
        toast.error(
          `Wrong move. Expected ${sightTrainingMoveChallenge.san} (${sightTrainingMoveChallenge.from.toUpperCase()} to ${sightTrainingMoveChallenge.to.toUpperCase()}).`,
        );
        return false;
      }

      incrementSightTrainingScore("move-by-notation");
      toast.success("Correct move!");
      startMoveByNotationChallenge(false);
      return false;
    },
    [
      incrementSightTrainingScore,
      sightTrainingMode,
      sightTrainingMoveChallenge,
      startMoveByNotationChallenge,
      toast,
    ],
  );

  // Sync mode with URL
  useEffect(() => {
    const pathToMode: Record<string, ChessMode> = {
      "/practice": "practice",
      "/explore": "explore",
      "/search": "search",
      "/popular": "popular",
      "/favourites": "favourites",
      "/sight-training": "sight-training",
    };

    const modeFromPath = pathToMode[location.pathname];
    if (modeFromPath && gameState.mode !== modeFromPath) {
      dispatch({ type: "SET_MODE", payload: modeFromPath });
    }
  }, [location.pathname, gameState.mode, dispatch]);

  const matchedOpening = useOpeningMatch(
    gameState.moveHistory,
    fenToOpening,
    openings,
    gameState.game.fen(),
    gameState.isPlayingOpening,
    gameState.matchedOpening,
  );

  useEffect(() => {
    dispatch({ type: "SET_MATCHED_OPENING", payload: matchedOpening });
  }, [matchedOpening, dispatch]);

  const clickToMove = useClickToMove(
    gameState.game,
    gameState.mode,
    openingMovesIndex,
    gameState.moveHistory,
    (from: string, to: string) => {
      const g = new Chess(gameState.game.fen());
      const move = g.move({
        from: from as Square,
        to: to as Square,
        promotion: "q",
      });

      if (move) {
        console.log("[ChessPractice] Move made:", {
          move: move.san,
          beforeHistory: gameState.moveHistory,
          afterHistory: g.history(),
          willBeHistory: [...gameState.moveHistory, move.san],
        });

        // Manually preserve move history since Chess instances created from FEN
        // don't retain the history of moves that led to that position
        const newMoveHistory = [...gameState.moveHistory, move.san];

        dispatch({
          type: "SET_GAME_STATE",
          payload: {
            game: g,
            moveHistory: newMoveHistory,
            popularMovesIndex: newMoveHistory.length,
          },
        });

        if (gameState.isPlayingOpening) {
          dispatch({ type: "EXIT_OPENING_STUDY" });
          toast.info("Exited opening study mode");
        }
      } else {
        toast.error("Invalid move!");
      }
    },
  );

  const favouriteOpenings = useMemo(() => {
    return openings
      .filter((opening) =>
        preferences.favouriteIds.includes(getOpeningId(opening)),
      )
      .sort((a, b) => b.popularity - a.popularity);
  }, [openings, preferences.favouriteIds]);

  const suggestions = useSuggestions(gameState.moveHistory, openings);

  const onPieceDrop = useCallback(
    (args: PieceDropHandlerArgs): boolean => {
      const { sourceSquare, targetSquare } = args;
      if (!targetSquare) return false;

      const g = new Chess(gameState.game.fen());

      try {
        const move = g.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });
        if (!move) {
          toast.error("Invalid move!");
          return false;
        }

        // Manually preserve move history since Chess instances created from FEN
        // don't retain the history of moves that led to that position
        const newMoveHistory = [...gameState.moveHistory, move.san];

        dispatch({
          type: "SET_GAME_STATE",
          payload: {
            game: g,
            moveHistory: newMoveHistory,
            popularMovesIndex: newMoveHistory.length,
          },
        });

        if (gameState.isPlayingOpening) {
          dispatch({ type: "EXIT_OPENING_STUDY" });
          toast.info("Exited opening study mode");
        }
        return true;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        toast.error(`Invalid move: ${message}`);
        return false;
      }
    },
    [gameState.game, gameState.isPlayingOpening, gameState.moveHistory, dispatch, toast],
  );

  const searchResults = useMemo(() => {
    if (!gameState.searchQuery.trim()) return [];

    const query = gameState.searchQuery.toLowerCase();
    const results = openings
      .filter((opening) => {
        if (opening.name.toLowerCase().includes(query)) return true;
        if (opening.eco?.toLowerCase().includes(query)) return true;
        const moveSequence = opening.moves.join(" ").toLowerCase();
        if (moveSequence.includes(query)) return true;
        if (opening.aliases) {
          const aliasValues = Object.values(opening.aliases)
            .join(" ")
            .toLowerCase();
          if (aliasValues.includes(query)) return true;
        }
        return false;
      })
      .slice(0, 50);

    return results;
  }, [gameState.searchQuery, openings]);

  useEffect(() => {
    dispatch({ type: "SET_SEARCH_RESULTS", payload: searchResults });
  }, [searchResults, dispatch]);

  const popularSorted = useMemo(() => {
    let filteredOpenings = openings;
    if (gameState.moveHistory.length > 0) {
      filteredOpenings = openings.filter((o) => {
        if (o.moves.length <= gameState.moveHistory.length) return false;
        return gameState.moveHistory.every((move, i) => o.moves[i] === move);
      });
    }

    return filteredOpenings
      .slice()
      .sort((a, b) => {
        if (b.popularity !== a.popularity) return b.popularity - a.popularity;
        if (a.src === "eco_tsv" && b.src !== "eco_tsv") return -1;
        if (b.src === "eco_tsv" && a.src !== "eco_tsv") return 1;
        if (a.isEcoRoot && !b.isEcoRoot) return -1;
        if (b.isEcoRoot && !a.isEcoRoot) return 1;
        return 0;
      })
      .slice(0, 100);
  }, [openings, gameState.moveHistory]);

const selectedPieceOpenings = useMemo(() => {
  if (gameState.mode !== "explore" || !clickToMove.selectedSquare) {
    return [];
  }

  // Create a map of SAN -> from square for ALL legal moves in current position
  // Only ONE Chess instance created here!
  const sanToFromMap = new Map<string, string>();
  const allLegalMoves = gameState.game.moves({ verbose: true }) as Move[];
  allLegalMoves.forEach(move => {
    sanToFromMap.set(move.san, move.from);
  });

  // Now filter openings using the pre-built map (O(1) lookups)
  const filtered = openings.filter((opening) => {
    if (opening.moves.length <= gameState.moveHistory.length) return false;

    // Check if all previous moves match
    const historyMatches = gameState.moveHistory.every(
      (move, i) => opening.moves[i] === move
    );
    if (!historyMatches) return false;

    // Get the next move in the opening
    const nextMove = opening.moves[gameState.moveHistory.length];
    
    // Check if this move exists and comes from the selected square
    const fromSquare = sanToFromMap.get(nextMove);
    return fromSquare === clickToMove.selectedSquare;
  });

  // Sort by popularity
  return filtered
    .slice()
    .sort((a, b) => {
      if (b.popularity !== a.popularity) return b.popularity - a.popularity;
      if (a.src === "eco_tsv" && b.src !== "eco_tsv") return -1;
      if (b.src === "eco_tsv" && a.src !== "eco_tsv") return 1;
      if (a.isEcoRoot && !b.isEcoRoot) return -1;
      if (b.isEcoRoot && !a.isEcoRoot) return 1;
      return 0;
    })
    .slice(0, 20);
}, [
  gameState.mode,
  gameState.game,
  gameState.moveHistory,
  clickToMove.selectedSquare,
  openings,
]);

  const startPopularAt = useCallback(
    (index: number, startAtFinalPosition: boolean = false) => {
      try {
        const chosen = popularSorted[index];
        if (!chosen) {
          toast.error("Opening not found");
          return;
        }

        resetGame();

        const g = new Chess();
        const targetIndex = startAtFinalPosition ? chosen.moves.length : 0;

        for (let i = 0; i < targetIndex; i++) {
          if (i < chosen.moves.length) {
            const moveStr = chosen.moves[i];
            const move = g.move(moveStr);
            if (!move) {
              console.error("Failed to apply move during opening start:", {
                moveIndex: i,
                move: moveStr,
                currentFen: g.fen(),
                movesSoFar: g.history(),
              });
              toast.error(`Invalid move in opening at position ${i + 1}: ${moveStr}`);
              break;
            }
          }
        }

        dispatch({ type: "SET_POPULAR_INDEX", payload: index });
        dispatch({ type: "SET_MATCHED_OPENING", payload: chosen });
        dispatch({ type: "SET_IS_PLAYING_OPENING", payload: true });
        dispatch({ type: "SET_MODE", payload: "popular" });
        updateGameState(g, targetIndex);

        toast.success(
          `Started studying: ${chosen.name}${startAtFinalPosition ? " (at final position)" : ""}`,
        );
      } catch (error: unknown) {
        console.error("Error starting opening:", error);
        const message = error instanceof Error ? error.message : String(error);
        toast.error(`Failed to start opening: ${message}`);
      }
    },
    [popularSorted, updateGameState, dispatch, resetGame, toast],
  );

  const startSearchResult = useCallback(
    (opening: Opening, startAtFinalPosition: boolean = false) => {
      try {
        resetGame();

        const g = new Chess();
        const targetIndex = startAtFinalPosition ? opening.moves.length : 0;

        for (let i = 0; i < targetIndex; i++) {
          if (i < opening.moves.length) {
            const moveStr = opening.moves[i];
            const move = g.move(moveStr);
            if (!move) {
              console.error("Failed to apply move during opening start:", {
                moveIndex: i,
                move: moveStr,
                currentFen: g.fen(),
                movesSoFar: g.history(),
              });
              toast.error(`Invalid move in opening at position ${i + 1}: ${moveStr}`);
              break;
            }
          }
        }

        dispatch({ type: "SET_MATCHED_OPENING", payload: opening });
        dispatch({ type: "SET_IS_PLAYING_OPENING", payload: true });
        dispatch({ type: "SET_MODE", payload: "popular" });

        const index = popularSorted.findIndex((o) => o.fen === opening.fen);
        dispatch({ type: "SET_POPULAR_INDEX", payload: Math.max(0, index) });

        updateGameState(g, targetIndex);

        toast.success(
          `Started studying: ${opening.name}${startAtFinalPosition ? " (at final position)" : ""}`,
        );
      } catch (error: unknown) {
        console.error("Error starting opening:", error);
        const message = error instanceof Error ? error.message : String(error);
        toast.error(`Failed to start opening: ${message}`);
      }
    },
    [popularSorted, updateGameState, dispatch, resetGame, toast],
  );

  const handleSearchQueryChange = useCallback((query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  }, [dispatch]);

  const handleSetIsPlayingOpening = useCallback((isPlaying: boolean) => {
    dispatch({ type: "SET_IS_PLAYING_OPENING", payload: isPlaying });
  }, [dispatch]);

  const handleBoardOrientationChange = useCallback(
    (orientation: BoardOrientation) => {
      dispatch({ type: "SET_BOARD_ORIENTATION", payload: orientation });
    },
    [dispatch],
  );

  const sightTrainingPosition = sightTrainingMode === "square-recognition"
    ? "8/8/8/8/8/8/8/8 w - - 0 1"
    : sightTrainingGame.fen();
  const sightTrainingOrientation: BoardOrientation =
    gameState.mode === "sight-training" &&
      sightTrainingMode === "square-recognition" &&
      squareRecognitionSide === "black"
      ? "black"
      : gameState.mode === "sight-training" &&
      sightTrainingMode === "move-by-notation" &&
      sightTrainingTurnLabel === "Black"
      ? "black"
        : gameState.boardOrientation;
  const currentSightTrainingLabel = sightTrainingMode === "square-recognition"
    ? "Square Recognition"
    : "Move by Notation";

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <ChessBoard
        position={gameState.mode === "sight-training" ? sightTrainingPosition : gameState.game.fen()}
        boardOrientation={sightTrainingOrientation}
        onPieceDrop={gameState.mode === "sight-training"
          ? onSightTrainingPieceDrop
          : gameState.mode === "explore"
            ? () => false
            : onPieceDrop}
        onSquareClick={
          gameState.mode === "sight-training" && sightTrainingMode === "square-recognition"
            ? handleSightTrainingSquareClick
            : clickToMove.onSquareClick
        }
        game={gameState.mode === "sight-training" ? sightTrainingGame : gameState.game}
        boardTheme={preferences.boardTheme}
        showCoordinates={preferences.showCoordinates}
        clickToMoveMode={gameState.mode === "explore"}
        selectedSquare={clickToMove.selectedSquare}
        possibleMoves={clickToMove.possibleMoves}
        captureMoves={clickToMove.captureMoves}
        piecesWithMoves={clickToMove.piecesWithMoves}
      >
        {gameState.mode !== "sight-training" && (
          <OpeningControls
            isPlayingOpening={gameState.isPlayingOpening}
            matchedOpening={gameState.matchedOpening}
            popularMovesIndex={gameState.popularMovesIndex}
            onNavigate={(index) => navigateToMove(index, popularSorted)}
            gameHistoryLength={gameState.moveHistory.length}
            boardOrientation={gameState.boardOrientation}
            setBoardOrientation={handleBoardOrientationChange}
            boardTheme={preferences.boardTheme}
            showCoordinates={preferences.showCoordinates}
            onThemeChange={preferences.setBoardTheme}
            onCoordinatesToggle={preferences.setShowCoordinates}
            logAction={() => {}}
            mode={gameState.mode}
            openingMovesCount={openingMovesIndex.get(gameState.moveHistory.join("|"))?.size || 0}
          />
        )}
      </ChessBoard>

      <div className="flex-1 space-y-4 min-w-0 max-w-2xl">
        {gameState.mode !== "sight-training" && (
          <SuggestedMoves suggestions={suggestions} makeMove={makeMove} />
        )}

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Training Mode
            </h2>
            <ModeSelector
              mode={gameState.mode}
              setIsPlayingOpening={handleSetIsPlayingOpening}
              resetGame={resetGame}
              logAction={() => {}}
            />
          </div>
          {gameState.mode === "sight-training" ? (
            <div className="space-y-3">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {sightTrainingMode === "square-recognition"
                    ? "Square Recognition • Empty board square click"
                    : "Move by Notation"}
                  {sightTrainingMode !== "square-recognition" && (
                    <span className="ml-2">
                      • {sightTrainingTurnLabel} to move
                      {sightTrainingTurnLabel === "Black" && <span className="ml-1">♟</span>}
                      {sightTrainingTurnLabel === "White" && <span className="ml-1">♙</span>}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-lg font-semibold text-blue-700 dark:text-blue-300">
                  {sightTrainingPrompt}
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {sightTrainingMode === "square-recognition"
                    ? "Click the named square."
                    : "Drag the correct piece to the destination square (do not just click)."}
                </div>
                <button
                  onClick={() =>
                    sightTrainingMode === "square-recognition"
                      ? startSquareRecognitionChallenge(false)
                      : startMoveByNotationChallenge(false)
                  }
                  className="mt-3 px-3 py-2 rounded-md text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-fit"
                >
                  Skip
                </button>
              </div>
              <div className="text-sm p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 space-y-3">
                <div className="font-medium">
                  {sightTrainingMode === "square-recognition"
                    ? `${currentSightTrainingLabel} (${squareRecognitionSide === "white" ? "White" : "Black"}): ${sightTrainingScores[getSquareRecognitionScoreKey(squareRecognitionSide)]} | High: ${sightTrainingHighScores[getSquareRecognitionScoreKey(squareRecognitionSide)]}`
                    : `${currentSightTrainingLabel}: ${sightTrainingScores["move-by-notation"]} | High: ${sightTrainingHighScores["move-by-notation"]}`}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Axis Labels:</span>
                  <button
                    onClick={() =>
                      preferences.setShowCoordinates(!preferences.showCoordinates)
                    }
                    className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-fit"
                  >
                    {preferences.showCoordinates ? "On" : "Off"}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {sightTrainingMode === "square-recognition" && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Play As:</span>
                      <button
                        onClick={() =>
                          startSquareRecognitionChallenge(
                            false,
                            squareRecognitionSide === "white" ? "black" : "white",
                          )
                        }
                        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-fit"
                      >
                        {squareRecognitionSide === "white" ? "White" : "Black"}
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg w-fit">
                  <button
                    onClick={() => startSquareRecognitionChallenge(true)}
                    className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                      sightTrainingMode === "square-recognition"
                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    Square Recognition
                  </button>
                  <button
                    onClick={() => startMoveByNotationChallenge(true)}
                    className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                      sightTrainingMode === "move-by-notation"
                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    Move by Notation
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <GameStatus
              isPlayingOpening={gameState.isPlayingOpening}
              matchedOpening={gameState.matchedOpening}
              popularMovesIndex={gameState.popularMovesIndex}
              moveHistory={gameState.moveHistory}
              openingsCount={openings.length}
              onStudyOpening={startSearchResult}
              logAction={() => {}}
              toggleFavourite={preferences.toggleFavourite}
              favouriteIds={preferences.favouriteIds}
              mode={gameState.mode}
              onMoveClick={(index) => navigateToMove(index, popularSorted)}
            />
          )}
        </div>

        {gameState.mode === "search" && (
          <SearchOpenings
            searchQuery={gameState.searchQuery}
            setSearchQuery={handleSearchQueryChange}
            searchResults={gameState.searchResults}
            startSearchResult={startSearchResult}
            toggleFavourite={preferences.toggleFavourite}
            favouriteIds={preferences.favouriteIds}
            mode={gameState.mode}
            onMoveClick={(opening, moveIndex) => {
              // Start the opening at the clicked position
              resetGame();
              const g = new Chess();

              // Play moves up to the clicked position
              for (let i = 0; i < moveIndex && i < opening.moves.length; i++) {
                const move = g.move(opening.moves[i]);
                if (!move) {
                  console.error("Failed to apply move:", {
                    moveIndex: i,
                    move: opening.moves[i],
                  });
                  break;
                }
              }

              dispatch({ type: "SET_MATCHED_OPENING", payload: opening });
              dispatch({ type: "SET_IS_PLAYING_OPENING", payload: true });
              dispatch({ type: "SET_MODE", payload: "popular" });

              const index = popularSorted.findIndex((o) => o.fen === opening.fen);
              dispatch({ type: "SET_POPULAR_INDEX", payload: Math.max(0, index) });

              updateGameState(g, moveIndex);

              toast.success(`Jumped to move ${moveIndex} in ${opening.name}`);
            }}
          />
        )}

        {gameState.mode === "explore" && clickToMove.selectedSquare && (
          <OpeningsList
            title="Possible Openings"
            subtitle={`from ${clickToMove.selectedSquare.toUpperCase()}`}
            moveHistory={gameState.moveHistory}
            openings={selectedPieceOpenings}
            startPopularAt={startPopularAt}
            toggleFavourite={preferences.toggleFavourite}
            favouriteIds={preferences.favouriteIds}
            mode={gameState.mode}
            maxItems={15}
            onMoveClick={(opening, moveIndex) => {
              // Find the opening index
              const openingIndex = selectedPieceOpenings.findIndex(
                (o) => getOpeningId(o) === getOpeningId(opening)
              );
              if (openingIndex !== -1) {
                // Start the opening first
                resetGame();
                const g = new Chess();

                // Play moves up to the clicked position
                for (let i = 0; i < moveIndex && i < opening.moves.length; i++) {
                  const move = g.move(opening.moves[i]);
                  if (!move) {
                    console.error("Failed to apply move:", {
                      moveIndex: i,
                      move: opening.moves[i],
                    });
                    break;
                  }
                }

                const popularIndex = popularSorted.findIndex(
                  (o) => getOpeningId(o) === getOpeningId(opening)
                );
                dispatch({ type: "SET_POPULAR_INDEX", payload: Math.max(0, popularIndex) });
                dispatch({ type: "SET_MATCHED_OPENING", payload: opening });
                dispatch({ type: "SET_IS_PLAYING_OPENING", payload: true });
                dispatch({ type: "SET_MODE", payload: "popular" });
                updateGameState(g, moveIndex);

                toast.success(`Jumped to move ${moveIndex} in ${opening.name}`);
              }
            }}
          />
        )}

        {gameState.mode === "popular" && (
          <PopularOpenings
            moveHistory={gameState.moveHistory}
            popularSorted={popularSorted}
            startPopularAt={startPopularAt}
            toggleFavourite={preferences.toggleFavourite}
            favouriteIds={preferences.favouriteIds}
            mode={gameState.mode}
            onMoveClick={(opening, moveIndex) => {
              // Find the opening index in popularSorted
              const openingIndex = popularSorted.findIndex(
                (o) => getOpeningId(o) === getOpeningId(opening)
              );
              if (openingIndex !== -1) {
                // Start the opening first
                resetGame();
                const g = new Chess();

                // Play moves up to the clicked position
                for (let i = 0; i < moveIndex && i < opening.moves.length; i++) {
                  const move = g.move(opening.moves[i]);
                  if (!move) {
                    console.error("Failed to apply move:", {
                      moveIndex: i,
                      move: opening.moves[i],
                    });
                    break;
                  }
                }

                dispatch({ type: "SET_POPULAR_INDEX", payload: openingIndex });
                dispatch({ type: "SET_MATCHED_OPENING", payload: opening });
                dispatch({ type: "SET_IS_PLAYING_OPENING", payload: true });
                dispatch({ type: "SET_MODE", payload: "popular" });
                updateGameState(g, moveIndex);

                toast.success(`Jumped to move ${moveIndex} in ${opening.name}`);
              }
            }}
          />
        )}

        {gameState.mode === "favourites" && (
          <FavouriteOpenings
            favouriteOpenings={favouriteOpenings}
            startSearchResult={startSearchResult}
            toggleFavourite={preferences.toggleFavourite}
            favouriteIds={preferences.favouriteIds}
            mode={gameState.mode}
            onMoveClick={(opening, moveIndex) => {
              // Start the opening at the clicked position
              resetGame();
              const g = new Chess();

              // Play moves up to the clicked position
              for (let i = 0; i < moveIndex && i < opening.moves.length; i++) {
                const move = g.move(opening.moves[i]);
                if (!move) {
                  console.error("Failed to apply move:", {
                    moveIndex: i,
                    move: opening.moves[i],
                  });
                  break;
                }
              }

              dispatch({ type: "SET_MATCHED_OPENING", payload: opening });
              dispatch({ type: "SET_IS_PLAYING_OPENING", payload: true });
              dispatch({ type: "SET_MODE", payload: "popular" });

              const index = popularSorted.findIndex((o) => o.fen === opening.fen);
              dispatch({ type: "SET_POPULAR_INDEX", payload: Math.max(0, index) });

              updateGameState(g, moveIndex);

              toast.success(`Jumped to move ${moveIndex} in ${opening.name}`);
            }}
          />
        )}
      </div>
    </div>
  );
}
