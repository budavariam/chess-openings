import { useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

export default function ChessPractice() {
  const location = useLocation();
  const navigate = useNavigate();
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

  // Sync mode with URL
  useEffect(() => {
    const pathToMode: Record<string, ChessMode> = {
      "/practice": "practice",
      "/explore": "explore",
      "/search": "search",
      "/popular": "popular",
      "/favourites": "favourites",
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
      } catch (error: any) {
        toast.error(`Invalid move: ${error.message}`);
        return false;
      }
    },
    [gameState.game, gameState.isPlayingOpening, gameState.moveHistory, dispatch],
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

  // Get legal moves from selected piece (already have this)
  const moves = gameState.game.moves({
    square: clickToMove.selectedSquare as Square,
    verbose: true,
  }) as Move[];

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
  
  // Calculate openings for selected piece in explore mode
  const selectedPieceOpenings_v0 = useMemo(() => {
    if (gameState.mode !== "explore" || !clickToMove.selectedSquare) {
      return [];
    }

    // Get all possible moves from the selected square in SAN notation
    const moves = gameState.game.moves({
      square: clickToMove.selectedSquare as Square,
      verbose: true,
    }) as Move[];

    const sanMoves = moves.map((m) => m.san);

    // Filter openings where the next move matches any of the selected piece's moves
    const filtered = openings.filter((opening) => {
      if (opening.moves.length <= gameState.moveHistory.length) return false;

      // Check if all previous moves match
      const historyMatches = gameState.moveHistory.every(
        (move, i) => opening.moves[i] === move
      );
      if (!historyMatches) return false;

      // Check if the next move is one of the selected piece's moves
      const nextMove = opening.moves[gameState.moveHistory.length];
      return sanMoves.includes(nextMove);
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
      } catch (error: any) {
        console.error("Error starting opening:", error);
        toast.error(`Failed to start opening: ${error.message}`);
      }
    },
    [popularSorted, updateGameState, dispatch, resetGame],
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
      } catch (error: any) {
        console.error("Error starting opening:", error);
        toast.error(`Failed to start opening: ${error.message}`);
      }
    },
    [popularSorted, updateGameState, dispatch, resetGame],
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

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <ChessBoard
        position={gameState.game.fen()}
        boardOrientation={gameState.boardOrientation}
        onPieceDrop={gameState.mode === "explore" ? () => false : onPieceDrop}
        onSquareClick={clickToMove.onSquareClick}
        game={gameState.game}
        boardTheme={preferences.boardTheme}
        showCoordinates={preferences.showCoordinates}
        clickToMoveMode={gameState.mode === "explore"}
        selectedSquare={clickToMove.selectedSquare}
        possibleMoves={clickToMove.possibleMoves}
        captureMoves={clickToMove.captureMoves}
        piecesWithMoves={clickToMove.piecesWithMoves}
      >
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
      </ChessBoard>

      <div className="flex-1 space-y-4 min-w-0 max-w-2xl">
        <SuggestedMoves suggestions={suggestions} makeMove={makeMove} />

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
          />
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
          />
        )}

        {gameState.mode === "favourites" && (
          <FavouriteOpenings
            favouriteOpenings={favouriteOpenings}
            startSearchResult={startSearchResult}
            toggleFavourite={preferences.toggleFavourite}
            favouriteIds={preferences.favouriteIds}
            mode={gameState.mode}
          />
        )}
      </div>
    </div>
  );
}
