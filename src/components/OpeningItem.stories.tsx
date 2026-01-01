import type { Meta, StoryObj } from '@storybook/react';
import { OpeningItem } from './OpeningItem';
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
  title: 'Components/OpeningItem',
  component: OpeningItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['list', 'expanded'],
    },
    mode: {
      control: 'select',
      options: ['practice', 'explore', 'search', 'popular', 'favourites'],
    },
  },
  args: {
    opening: sampleOpening,
    isFavourite: false,
    toggleFavourite: () => {},
    onStudy: () => {},
  },
} satisfies Meta<typeof OpeningItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ListVariant: Story = {
  args: {
    variant: 'list',
    mode: 'popular',
    showIndex: 1,
  },
};

export const ListVariantFavourite: Story = {
  args: {
    variant: 'list',
    mode: 'popular',
    showIndex: 1,
    isFavourite: true,
  },
};

export const ExpandedVariant: Story = {
  args: {
    variant: 'expanded',
    mode: 'practice',
  },
};

export const ExpandedVariantFavourite: Story = {
  args: {
    variant: 'expanded',
    mode: 'practice',
    isFavourite: true,
  },
};

export const LongName: Story = {
  args: {
    variant: 'list',
    mode: 'popular',
    showIndex: 1,
    opening: {
      ...sampleOpening,
      name: 'Ruy Lopez: Morphy Defense, Modern Steinitz Defense, Siesta Variation',
    },
  },
};

export const LowPopularity: Story = {
  args: {
    variant: 'list',
    mode: 'popular',
    showIndex: 1,
    opening: {
      ...sampleOpening,
      popularity: 15,
    },
  },
};
