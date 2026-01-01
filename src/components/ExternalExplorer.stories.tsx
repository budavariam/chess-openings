import type { Meta, StoryObj } from '@storybook/react';
import { ExternalExplorer } from './ExternalExplorer';
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
  title: 'Components/ExternalExplorer',
  component: ExternalExplorer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    logAction: () => {},
  },
} satisfies Meta<typeof ExternalExplorer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoOpening: Story = {
  args: {
    matchedOpening: null,
    popularMovesIndex: 0,
  },
};

export const WithOpening: Story = {
  args: {
    matchedOpening: sampleOpening,
    popularMovesIndex: 5,
  },
};

export const OpeningPartial: Story = {
  args: {
    matchedOpening: sampleOpening,
    popularMovesIndex: 3,
  },
};

export const OpeningStart: Story = {
  args: {
    matchedOpening: sampleOpening,
    popularMovesIndex: 0,
  },
};

export const LongOpeningName: Story = {
  args: {
    matchedOpening: longOpening,
    popularMovesIndex: 14,
  },
};
