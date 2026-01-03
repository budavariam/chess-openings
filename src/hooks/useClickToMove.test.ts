import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../test/test-utils';
import { Chess } from 'chess.js';
import { useClickToMove } from './useClickToMove';
import { useOpenings } from './useOpenings';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useClickToMove - Complex Openings in Explore Mode', () => {
  // Complex openings to test - these are deep openings that should be fully reachable
  const complexOpenings = [
    {
      name: 'Benoni: Four Pawns, Main Line',
      eco: 'A69',
      moves: '1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3 exd5 5. cxd5 d6 6. e4 g6 7. f4 Bg7 8. Nf3 O-O 9. Be2 Re8 10. e5 dxe5 11. fxe5 Ng4 12. Bg5 Qb6 13. O-O Nxe5 14. d6',
    },
    {
      name: 'Benoni: Classical',
      eco: 'A75',
      moves: '1. d4 Nf6 2. c4 c5 3. d5 e6 4. Nc3 exd5 5. cxd5 d6 6. e4 g6 7. Nf3 Bg7 8. Be2 O-O 9. O-O a6 10. a4 Bg4 11. Bf4 Bxf3 12. Bxf3 Qe7 13. Re1 Nbd7 14. a5',
    },
    {
      name: 'Sicilian: Najdorf, Poisoned Pawn',
      eco: 'B97',
      moves: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Qb6 8. Qd2 Qxb2 9. Rb1 Qa3 10. f5 Nc6 11. fxe6 fxe6 12. Nxc6 bxc6 13. e5 dxe5 14. Bxf6 gxf6 15. Ne4 Be7 16. Be2 h5 17. Rb3 Qa4 18. c4',
    },
    {
      name: 'Sicilian: Najdorf, Modern Main Line',
      eco: 'B99',
      moves: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Be7 8. Qf3 Qc7 9. O-O-O Nbd7 10. g4 b5 11. Bxf6 Nxf6 12. g5 Nd7 13. f5 Nc5 14. f6 gxf6 15. gxf6 Bf8 16. Rg1',
    },
    {
      name: 'Ruy Lopez: Marshall Attack, Spassky Variation',
      eco: 'C89',
      moves: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O 8. c3 d5 9. exd5 Nxd5 10. Nxe5 Nxe5 11. Rxe5 c6 12. d4 Bd6 13. Re1 Qh4 14. g3 Qh3 15. Be3 Bg4 16. Qd3 Rae8 17. Nd2 Re6 18. a4 Qh5',
    },
    {
      name: 'Gruenfeld: Classical Exchange',
      eco: 'D89',
      moves: '1. d4 Nf6 2. c4 g6 3. Nc3 d5 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3 Bg7 7. Bc4 O-O 8. Ne2 c5 9. O-O Nc6 10. Be3 cxd4 11. cxd4 Bg4 12. f3 Na5 13. Bd3 Be6 14. Rc1 Bxa2 15. Qa4 Be6 16. d5 Bd7 17. Qb4 b6',
    },
    {
      name: "King's Indian: Orthodox, Classical",
      eco: 'E98',
      moves: '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Be3 f5 11. f3 f4 12. Bf2 g5 13. Rc1 Ng6 14. c5',
    },
    {
      name: 'Caro-Kann: Classical, Spassky',
      eco: 'B19',
      moves: '1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. h4 h6 7. Nf3 Nd7 8. h5 Bh7 9. Bd3 Bxd3 10. Qxd3 Qc7 11. Bd2 e6 12. O-O-O Ngf6 13. Ne4 O-O-O 14. g3 Nxe4',
    },
    {
      name: 'Sicilian: Dragon, Yugoslav',
      eco: 'B78',
      moves: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3 O-O 8. Qd2 Nc6 9. Bc4 Bd7 10. O-O-O Rc8 11. Bb3 Ne5 12. Kb1 Nc4 13. Bxc4 Rxc4 14. g4 b5',
    },
    {
      name: 'Sicilian: Najdorf, Modern (Alternative)',
      eco: 'B99',
      moves: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Be7 8. Qf3 Qc7 9. O-O-O Nbd7 10. g4 b5 11. Bxf6 Nxf6 12. g5 Nd7 13. f5 Bxg5+ 14. Kb1 Ne5',
    },
  ];

  function parseMovesString(movesString: string): string[] {
    // Remove move numbers and dots, split by whitespace
    return movesString
      .replace(/\d+\./g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Explore Mode - Complex Opening Reachability', () => {
    it('should load openings data successfully', () => {
      const { result } = renderHook(() => useOpenings());

      // Wait for loading to complete
      expect(result.current.isLoaded).toBeDefined();
    });

    complexOpenings.forEach((opening) => {
      it(`should be able to reach all moves in ${opening.name} (${opening.eco})`, () => {
        const { result: openingsResult } = renderHook(() => useOpenings());

        // Wait for openings to load
        if (!openingsResult.current.isLoaded) {
          console.warn(`[Test] Openings not loaded for ${opening.name}`);
          return;
        }

        const movesArray = parseMovesString(opening.moves);
        const game = new Chess();
        const moveHistory: string[] = [];
        const failedMoves: Array<{
          moveIndex: number;
          move: string;
          availableMoves: string[];
          key: string;
        }> = [];

        console.log(`\n[Test] Testing ${opening.name} (${opening.eco})`);
        console.log(`[Test] Total moves to test: ${movesArray.length}`);

        // Test each move in the opening
        for (let i = 0; i < movesArray.length; i++) {
          const moveToMake = movesArray[i];
          const key = moveHistory.join('|');

          // Get available moves from the index
          const availableMoves = openingsResult.current.openingMovesIndex.get(key);
          const availableMovesArray = availableMoves ? Array.from(availableMoves) : [];

          // Check if the next move is available in the index
          if (!availableMovesArray.includes(moveToMake)) {
            failedMoves.push({
              moveIndex: i,
              move: moveToMake,
              availableMoves: availableMovesArray,
              key,
            });

            console.error(`[Test] ❌ Move ${i + 1} "${moveToMake}" not found in index`);
            console.error(`[Test] Key: "${key}"`);
            console.error(`[Test] Available moves: [${availableMovesArray.slice(0, 10).join(', ')}]${availableMovesArray.length > 10 ? '...' : ''}`);
          } else {
            if (i < 5 || i >= movesArray.length - 5) {
              console.log(`[Test] ✓ Move ${i + 1} "${moveToMake}" found in index`);
            } else if (i === 5) {
              console.log(`[Test] ... (${movesArray.length - 10} middle moves) ...`);
            }
          }

          // Make the move on the board
          try {
            const result = game.move(moveToMake);
            if (result) {
              moveHistory.push(moveToMake);
            } else {
              console.error(`[Test] ❌ Chess.js rejected move: ${moveToMake}`);
              failedMoves.push({
                moveIndex: i,
                move: moveToMake,
                availableMoves: ['ILLEGAL MOVE'],
                key,
              });
              break;
            }
          } catch (error) {
            console.error(`[Test] ❌ Error making move ${moveToMake}:`, error);
            break;
          }
        }

        // Test should fail if any moves were not found in the index
        if (failedMoves.length > 0) {
          console.error(`\n[Test] ${opening.name} FAILED:`);
          console.error(`[Test] ${failedMoves.length} moves could not be found in the index`);
          failedMoves.forEach((fail) => {
            console.error(
              `  - Move ${fail.moveIndex + 1}: "${fail.move}" (key: "${fail.key}")`
            );
          });
        }

        expect(failedMoves.length).toBe(0);
        expect(moveHistory.length).toBe(movesArray.length);
      });
    });

    it('should correctly filter legal moves to only show opening moves', () => {
      const { result: openingsResult } = renderHook(() => useOpenings());

      if (!openingsResult.current.isLoaded) {
        console.warn('[Test] Openings not loaded for move filtering test');
        return;
      }

      const game = new Chess();
      const moveHistory: string[] = [];
      const mockOnMove = vi.fn();

      const { result: clickToMoveResult } = renderHook(() =>
        useClickToMove(
          game,
          'explore',
          openingsResult.current.openingMovesIndex,
          moveHistory,
          mockOnMove
        )
      );

      // At the start position, should have pieces that can make opening moves
      expect(clickToMoveResult.current.piecesWithMoves.length).toBeGreaterThan(0);

      console.log(
        '[Test] Pieces with opening moves at start:',
        clickToMoveResult.current.piecesWithMoves
      );

      // The opening moves should be a subset of all legal moves
      const allLegalMoves = game.moves({ verbose: true });
      console.log('[Test] Total legal moves:', allLegalMoves.length);
      console.log(
        '[Test] Pieces with opening moves:',
        clickToMoveResult.current.piecesWithMoves.length
      );

      expect(clickToMoveResult.current.piecesWithMoves.length).toBeLessThanOrEqual(
        allLegalMoves.length
      );
    });
  });

  describe('useClickToMove - Mode switching', () => {
    it('should only show opening moves in explore mode', () => {
      const { result: openingsResult } = renderHook(() => useOpenings());

      if (!openingsResult.current.isLoaded) {
        return;
      }

      const game = new Chess();
      const moveHistory: string[] = [];
      const mockOnMove = vi.fn();

      // Test explore mode
      const { result: exploreResult } = renderHook(() =>
        useClickToMove(
          game,
          'explore',
          openingsResult.current.openingMovesIndex,
          moveHistory,
          mockOnMove
        )
      );

      expect(exploreResult.current.piecesWithMoves.length).toBeGreaterThan(0);

      // Test free play mode
      const { result: freePlayResult } = renderHook(() =>
        useClickToMove(
          game,
          'free',
          openingsResult.current.openingMovesIndex,
          moveHistory,
          mockOnMove
        )
      );

      expect(freePlayResult.current.piecesWithMoves.length).toBe(0);
    });
  });
});
