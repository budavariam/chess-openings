import type { Meta, StoryObj } from '@storybook/react';
import { OpeningControls } from './OpeningControls';
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

const meta = {
  title: 'Components/OpeningControls',
  component: OpeningControls,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    boardOrientation: {
      control: 'select',
      options: ['white', 'black'],
    },
    boardTheme: {
      control: 'select',
      options: ['default', 'blue', 'green', 'brown', 'purple'],
    },
  },
  args: {
    onNavigate: () => {},
    setBoardOrientation: () => {},
    onThemeChange: () => {},
    onCoordinatesToggle: () => {},
    logAction: () => {},
  },
} satisfies Meta<typeof OpeningControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotPlayingOpening: Story = {
  args: {
    isPlayingOpening: false,
    matchedOpening: null,
    popularMovesIndex: 0,
    gameHistoryLength: 0,
    boardOrientation: 'white',
    boardTheme: 'default',
    showCoordinates: true,
  },
};

export const PlayingOpeningStart: Story = {
  args: {
    isPlayingOpening: true,
    matchedOpening: sampleOpening,
    popularMovesIndex: 0,
    gameHistoryLength: 0,
    boardOrientation: 'white',
    boardTheme: 'default',
    showCoordinates: true,
  },
};

export const PlayingOpeningMiddle: Story = {
  args: {
    isPlayingOpening: true,
    matchedOpening: sampleOpening,
    popularMovesIndex: 3,
    gameHistoryLength: 3,
    boardOrientation: 'white',
    boardTheme: 'default',
    showCoordinates: true,
  },
};

export const PlayingOpeningEnd: Story = {
  args: {
    isPlayingOpening: true,
    matchedOpening: sampleOpening,
    popularMovesIndex: 5,
    gameHistoryLength: 5,
    boardOrientation: 'white',
    boardTheme: 'default',
    showCoordinates: true,
  },
};

export const BlackOrientation: Story = {
  args: {
    isPlayingOpening: true,
    matchedOpening: sampleOpening,
    popularMovesIndex: 2,
    gameHistoryLength: 2,
    boardOrientation: 'black',
    boardTheme: 'default',
    showCoordinates: true,
  },
};

export const BlueTheme: Story = {
  args: {
    isPlayingOpening: true,
    matchedOpening: sampleOpening,
    popularMovesIndex: 2,
    gameHistoryLength: 2,
    boardOrientation: 'white',
    boardTheme: 'blue',
    showCoordinates: true,
  },
};

export const NoCoordinates: Story = {
  args: {
    isPlayingOpening: true,
    matchedOpening: sampleOpening,
    popularMovesIndex: 2,
    gameHistoryLength: 2,
    boardOrientation: 'white',
    boardTheme: 'default',
    showCoordinates: false,
  },
};
