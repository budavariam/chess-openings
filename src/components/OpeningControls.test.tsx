import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { OpeningControls } from './OpeningControls';
import type { Opening } from '../types';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    info: vi.fn(),
  },
}));

describe('OpeningControls - Navigation Buttons', () => {
  const mockOpening: Opening = {
    name: 'Italian Game',
    eco: 'C50',
    fen: 'test-fen',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
    popularity: 100,
    src: 'eco_tsv',
  };

  const defaultProps = {
    isPlayingOpening: true,
    matchedOpening: mockOpening,
    popularMovesIndex: 2,
    onNavigate: vi.fn(),
    gameHistoryLength: 0,
    boardOrientation: 'white' as const,
    setBoardOrientation: vi.fn(),
    boardTheme: 'default',
    showCoordinates: true,
    onThemeChange: vi.fn(),
    onCoordinatesToggle: vi.fn(),
    logAction: vi.fn(),
  };

  it('should call onNavigate with 0 when start button is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(<OpeningControls {...defaultProps} onNavigate={onNavigate} />);

    const startButton = screen.getByTitle('Go to start');
    await user.click(startButton);

    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  it('should call onNavigate with index-1 when previous button is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <OpeningControls
        {...defaultProps}
        popularMovesIndex={3}
        onNavigate={onNavigate}
      />
    );

    const prevButton = screen.getByTitle('Previous move');
    await user.click(prevButton);

    expect(onNavigate).toHaveBeenCalledWith(2);
  });

  it('should call onNavigate with index+1 when next button is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <OpeningControls
        {...defaultProps}
        popularMovesIndex={2}
        onNavigate={onNavigate}
      />
    );

    const nextButton = screen.getByTitle('Next move');
    await user.click(nextButton);

    expect(onNavigate).toHaveBeenCalledWith(3);
  });

  it('should call onNavigate with max index when end button is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <OpeningControls
        {...defaultProps}
        popularMovesIndex={2}
        onNavigate={onNavigate}
      />
    );

    const endButton = screen.getByTitle('Go to end');
    await user.click(endButton);

    expect(onNavigate).toHaveBeenCalledWith(5);
  });

  it('should disable previous button when at start position', () => {
    render(
      <OpeningControls {...defaultProps} popularMovesIndex={0} />
    );

    const prevButton = screen.getByTitle('Previous move');
    expect(prevButton.hasAttribute('disabled')).toBe(true);
  });

  it('should not disable previous button when not at start', () => {
    render(
      <OpeningControls {...defaultProps} popularMovesIndex={2} />
    );

    const prevButton = screen.getByTitle('Previous move');
    expect(prevButton.hasAttribute('disabled')).toBe(false);
  });

  it('should handle multiple previous button clicks correctly', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    const { rerender } = render(
      <OpeningControls
        {...defaultProps}
        popularMovesIndex={3}
        onNavigate={onNavigate}
      />
    );

    // First click
    const prevButton = screen.getByTitle('Previous move');
    await user.click(prevButton);
    expect(onNavigate).toHaveBeenCalledWith(2);

    // Simulate state update
    rerender(
      <OpeningControls
        {...defaultProps}
        popularMovesIndex={2}
        onNavigate={onNavigate}
      />
    );

    // Second click
    await user.click(prevButton);
    expect(onNavigate).toHaveBeenCalledWith(1);

    // Simulate state update
    rerender(
      <OpeningControls
        {...defaultProps}
        popularMovesIndex={1}
        onNavigate={onNavigate}
      />
    );

    // Third click
    await user.click(prevButton);
    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  it('should work with practice mode (gameHistoryLength)', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <OpeningControls
        {...defaultProps}
        isPlayingOpening={false}
        matchedOpening={null}
        popularMovesIndex={3}
        gameHistoryLength={5}
        onNavigate={onNavigate}
      />
    );

    const prevButton = screen.getByTitle('Previous move');
    await user.click(prevButton);

    expect(onNavigate).toHaveBeenCalledWith(2);
  });

  it('should show debug info in development mode', () => {
    // Set DEV mode
    const originalEnv = import.meta.env.DEV;
    (import.meta.env as any).DEV = true;

    render(<OpeningControls {...defaultProps} />);

    // Look for debug details element
    const debugSection = screen.queryByText('Debug Info');
    expect(debugSection).toBeTruthy();

    // Restore
    (import.meta.env as any).DEV = originalEnv;
  });
});
