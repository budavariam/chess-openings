import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '../test/test-utils';
import { useGameState } from './useGameState';
import type { Opening } from '../types';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useGameState - Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Opening Study Mode Navigation', () => {
    it('should navigate to the start position', () => {
      const { result } = renderHook(() => useGameState());

      const testOpening: Opening = {
        name: 'Italian Game',
        eco: 'C50',
        fen: 'test-fen',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
        popularity: 100,
        src: 'eco_tsv',
      };

      // Set up opening study mode
      act(() => {
        result.current.dispatch({
          type: 'SET_MATCHED_OPENING',
          payload: testOpening,
        });
        result.current.dispatch({
          type: 'SET_IS_PLAYING_OPENING',
          payload: true,
        });
      });

      // Navigate to start
      act(() => {
        result.current.navigateToMove(0, [testOpening]);
      });

      expect(result.current.state.popularMovesIndex).toBe(0);
      expect(result.current.state.game.history().length).toBe(0);
    });

    it('should navigate to the end position', () => {
      const { result } = renderHook(() => useGameState());

      const testOpening: Opening = {
        name: 'Italian Game',
        eco: 'C50',
        fen: 'test-fen',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
        popularity: 100,
        src: 'eco_tsv',
      };

      // Set up opening study mode
      act(() => {
        result.current.dispatch({
          type: 'SET_MATCHED_OPENING',
          payload: testOpening,
        });
        result.current.dispatch({
          type: 'SET_IS_PLAYING_OPENING',
          payload: true,
        });
      });

      // Navigate to end
      act(() => {
        result.current.navigateToMove(testOpening.moves.length, [testOpening]);
      });

      expect(result.current.state.popularMovesIndex).toBe(5);
      expect(result.current.state.game.history().length).toBe(5);
    });

    it('should not go below 0 when navigating backward', () => {
      const { result } = renderHook(() => useGameState());

      const testOpening: Opening = {
        name: 'Italian Game',
        eco: 'C50',
        fen: 'test-fen',
        moves: ['e4', 'e5', 'Nf3'],
        popularity: 100,
        src: 'eco_tsv',
      };

      act(() => {
        result.current.dispatch({
          type: 'SET_MATCHED_OPENING',
          payload: testOpening,
        });
        result.current.dispatch({
          type: 'SET_IS_PLAYING_OPENING',
          payload: true,
        });
        result.current.navigateToMove(0, [testOpening]);
      });

      // Try to navigate before the start
      act(() => {
        result.current.navigateToMove(-1, [testOpening]);
      });

      expect(result.current.state.popularMovesIndex).toBe(0);
    });
  });

  describe('Explore Mode Navigation', () => {
    it('should trim move history when navigating backward in explore mode', () => {
      const { result } = renderHook(() => useGameState());

      // Switch to explore mode
      act(() => {
        result.current.dispatch({
          type: 'SET_MODE',
          payload: 'explore',
        });
      });

      // Make some moves (one at a time to allow state updates)
      act(() => {
        result.current.makeMove('e4');
      });
      act(() => {
        result.current.makeMove('e5');
      });
      act(() => {
        result.current.makeMove('Nf3');
      });
      act(() => {
        result.current.makeMove('Nc6');
      });

      expect(result.current.state.moveHistory).toEqual(['e4', 'e5', 'Nf3', 'Nc6']);
      expect(result.current.state.popularMovesIndex).toBe(4);

      // Navigate back to position 2
      act(() => {
        result.current.navigateToMove(2, []);
      });

      // History should be trimmed to allow exploring different branches
      expect(result.current.state.moveHistory).toEqual(['e4', 'e5']);
      expect(result.current.state.popularMovesIndex).toBe(2);
      expect(result.current.state.game.history()).toEqual(['e4', 'e5']);
    });

    it('should not trim move history in practice mode', () => {
      const { result } = renderHook(() => useGameState());

      // Stay in practice mode (default)
      expect(result.current.state.mode).toBe('practice');

      // Make some moves (one at a time to allow state updates)
      act(() => {
        result.current.makeMove('e4');
      });
      act(() => {
        result.current.makeMove('e5');
      });
      act(() => {
        result.current.makeMove('Nf3');
      });
      act(() => {
        result.current.makeMove('Nc6');
      });

      expect(result.current.state.moveHistory).toEqual(['e4', 'e5', 'Nf3', 'Nc6']);
      expect(result.current.state.popularMovesIndex).toBe(4);

      // Navigate back to position 2
      act(() => {
        result.current.navigateToMove(2, []);
      });

      // History should NOT be trimmed in practice mode
      expect(result.current.state.moveHistory).toEqual(['e4', 'e5', 'Nf3', 'Nc6']);
      expect(result.current.state.popularMovesIndex).toBe(2);
      expect(result.current.state.game.history()).toEqual(['e4', 'e5']);
    });

    it('should allow exploring different branches after navigating back in explore mode', () => {
      const { result } = renderHook(() => useGameState());

      // Switch to explore mode
      act(() => {
        result.current.dispatch({
          type: 'SET_MODE',
          payload: 'explore',
        });
      });

      // Make initial moves (one at a time to allow state updates)
      act(() => {
        result.current.makeMove('e4');
      });
      act(() => {
        result.current.makeMove('e5');
      });
      act(() => {
        result.current.makeMove('Nf3');
      });

      expect(result.current.state.moveHistory).toEqual(['e4', 'e5', 'Nf3']);

      // Navigate back to position 2
      act(() => {
        result.current.navigateToMove(2, []);
      });

      // History should be trimmed
      expect(result.current.state.moveHistory).toEqual(['e4', 'e5']);

      // Now make a different move (explore a different branch)
      act(() => {
        result.current.makeMove('d4');
      });

      // Should have the new branch
      expect(result.current.state.moveHistory).toEqual(['e4', 'e5', 'd4']);
      // Verify the position is correct (e4 e5 d4 leads to a specific position)
      expect(result.current.state.game.fen().split(' ')[0]).toBe('rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR');
    });
  });
});
