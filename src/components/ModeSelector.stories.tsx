import type { Meta, StoryObj } from '@storybook/react';
import { ModeSelector } from './ModeSelector';

const meta = {
  title: 'Components/ModeSelector',
  component: ModeSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['practice', 'explore', 'search', 'popular', 'favourites'],
    },
  },
  args: {
    setIsPlayingOpening: () => {},
    resetGame: () => {},
    logAction: () => {},
  },
} satisfies Meta<typeof ModeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Practice: Story = {
  args: {
    mode: 'practice',
  },
};

export const Explore: Story = {
  args: {
    mode: 'explore',
  },
};

export const Search: Story = {
  args: {
    mode: 'search',
  },
};

export const Popular: Story = {
  args: {
    mode: 'popular',
  },
};

export const Favourites: Story = {
  args: {
    mode: 'favourites',
  },
};
