import type { Meta, StoryObj } from '@storybook/react';
import { GameStatus } from './GameStatus';
import type { Opening } from '../types';

const sampleOpening: Opening = {
  name: 'Italian Game',
  eco: 'C50',
  fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
  moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
  popularity: 95,
  src: 'eco_tsv',
  isEcoRoot: true,
  aliases: {},
};

const longOpening: Opening = {
  name: 'Ruy Lopez: Morphy Defense, Modern Steinitz Defense, Siesta Variation',
  eco: 'C78',
  fen: 'r1bqk2r/2ppbppp/p1n2n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQR1K1 w kq - 0 7',
  moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6'],
  popularity: 78,
  src: 'eco_tsv',
  isEcoRoot: true,
  aliases: {},
};

const meta = {
  title: 'Components/GameStatus',
  component: GameStatus,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['practice', 'explore', 'search', 'popular', 'favourites'],
    },
  },
  args: {
    onStudyOpening: () => {},
    toggleFavourite: () => {},
    logAction: () => {},
    favouriteIds: [],
    openingsCount: 3450,
  },
} satisfies Meta<typeof GameStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FreePlay: Story = {
  args: {
    isPlayingOpening: false,
    matchedOpening: null,
    popularMovesIndex: 0,
    moveHistory: [],
    mode: 'practice',
  },
};

export const FreePlayWithMoves: Story = {
  args: {
    isPlayingOpening: false,
    matchedOpening: null,
    popularMovesIndex: 0,
    moveHistory: ['e4', 'e5', 'Nf3'],
    mode: 'practice',
  },
};

export const MatchedOpeningNotPlaying: Story = {
  args: {
    isPlayingOpening: false,
    matchedOpening: sampleOpening,
    popularMovesIndex: 3,
    moveHistory: ['e4', 'e5', 'Nf3'],
    mode: 'practice',
  },
};

export const PlayingOpeningStart: Story = {
  args: {
    isPlayingOpening: true,
    matchedOpening: sampleOpening,
    popularMovesIndex: 0,
    moveHistory: [],
    mode: 'popular',
  },
};

export const PlayingOpeningMiddle: Story = {
  args: {
    isPlayingOpening: true,
    matchedOpening: sampleOpening,
    popularMovesIndex: 3,
    moveHistory: ['e4', 'e5', 'Nf3'],
    mode: 'popular',
  },
};

export const PlayingOpeningEnd: Story = {
  args: {
    isPlayingOpening: true,
    matchedOpening: sampleOpening,
    popularMovesIndex: 5,
    moveHistory: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
    mode: 'popular',
  },
};

export const LongOpeningName: Story = {
  args: {
    isPlayingOpening: true,
    matchedOpening: longOpening,
    popularMovesIndex: 10,
    moveHistory: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7'],
    mode: 'popular',
  },
};

export const OpeningAsFavourite: Story = {
  args: {
    isPlayingOpening: true,
    matchedOpening: sampleOpening,
    popularMovesIndex: 3,
    moveHistory: ['e4', 'e5', 'Nf3'],
    mode: 'popular',
    favouriteIds: ['C50'],
  },
};

export const ExploreMode: Story = {
  args: {
    isPlayingOpening: false,
    matchedOpening: sampleOpening,
    popularMovesIndex: 3,
    moveHistory: ['e4', 'e5', 'Nf3'],
    mode: 'explore',
  },
};

export const SearchMode: Story = {
  args: {
    isPlayingOpening: false,
    matchedOpening: sampleOpening,
    popularMovesIndex: 0,
    moveHistory: [],
    mode: 'search',
  },
};
