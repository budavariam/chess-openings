import type { Meta, StoryObj } from '@storybook/react';
import { FavouriteOpenings } from './FavouriteOpenings';
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
];

const meta = {
  title: 'Components/FavouriteOpenings',
  component: FavouriteOpenings,
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
    startSearchResult: () => {},
    toggleFavourite: () => {},
    mode: 'favourites',
  },
} satisfies Meta<typeof FavouriteOpenings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    favouriteOpenings: [],
    favouriteIds: [],
  },
};

export const SingleFavourite: Story = {
  args: {
    favouriteOpenings: [sampleOpenings[0]],
    favouriteIds: ['C50'],
  },
};

export const MultipleFavourites: Story = {
  args: {
    favouriteOpenings: sampleOpenings,
    favouriteIds: ['C50', 'B20', 'C00'],
  },
};

export const ManyFavourites: Story = {
  args: {
    favouriteOpenings: [...sampleOpenings, ...sampleOpenings, ...sampleOpenings],
    favouriteIds: ['C50', 'B20', 'C00'],
  },
};
