import type { Meta, StoryObj } from '@storybook/react';
import { PopularOpenings } from './PopularOpenings';
import type { Opening } from '../types';

const sampleOpenings: Opening[] = [
  {
    name: 'Italian Game',
    eco: 'C50',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
    popularity: 95,
    src: 'eco_tsv',
    isEcoRoot: true,
    aliases: {},
  },
  {
    name: 'Sicilian Defense',
    eco: 'B20',
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    moves: ['e4', 'c5'],
    popularity: 98,
    src: 'eco_tsv',
    isEcoRoot: true,
    aliases: {},
  },
  {
    name: 'French Defense',
    eco: 'C00',
    fen: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    moves: ['e4', 'e6'],
    popularity: 85,
    src: 'eco_tsv',
    isEcoRoot: true,
    aliases: {},
  },
  {
    name: "Caro-Kann Defense",
    eco: 'B10',
    fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    moves: ['e4', 'c6'],
    popularity: 82,
    src: 'eco_tsv',
    isEcoRoot: true,
    aliases: {},
  },
  {
    name: 'Pirc Defense',
    eco: 'B07',
    fen: 'rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
    moves: ['e4', 'd6', 'd4', 'Nf6'],
    popularity: 70,
    src: 'eco_tsv',
    isEcoRoot: true,
    aliases: {},
  },
];

const filteredOpenings: Opening[] = [
  {
    name: 'Italian Game',
    eco: 'C50',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
    popularity: 95,
    src: 'eco_tsv',
    isEcoRoot: true,
    aliases: {},
  },
  {
    name: 'Ruy Lopez',
    eco: 'C60',
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    popularity: 92,
    src: 'eco_tsv',
    isEcoRoot: true,
    aliases: {},
  },
];

const meta = {
  title: 'Components/PopularOpenings',
  component: PopularOpenings,
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
    startPopularAt: () => {},
    toggleFavourite: () => {},
    favouriteIds: [],
    mode: 'popular',
  },
} satisfies Meta<typeof PopularOpenings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllOpenings: Story = {
  args: {
    moveHistory: [],
    popularSorted: sampleOpenings,
  },
};

export const Filtered: Story = {
  args: {
    moveHistory: ['e4', 'e5', 'Nf3', 'Nc6'],
    popularSorted: filteredOpenings,
  },
};

export const WithFavourites: Story = {
  args: {
    moveHistory: [],
    popularSorted: sampleOpenings,
    favouriteIds: ['C50', 'B20'],
  },
};

export const SingleOpening: Story = {
  args: {
    moveHistory: [],
    popularSorted: [sampleOpenings[0]],
  },
};

export const Empty: Story = {
  args: {
    moveHistory: [],
    popularSorted: [],
  },
};

export const ManyOpenings: Story = {
  args: {
    moveHistory: [],
    popularSorted: [...sampleOpenings, ...sampleOpenings, ...sampleOpenings],
  },
};
