import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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
});
