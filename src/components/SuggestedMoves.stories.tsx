import type { Meta, StoryObj } from '@storybook/react';
import { SuggestedMoves } from './SuggestedMoves';

const meta = {
  title: 'Components/SuggestedMoves',
  component: SuggestedMoves,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    makeMove: () => false,
  },
} satisfies Meta<typeof SuggestedMoves>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoSuggestions: Story = {
  args: {
    suggestions: [],
  },
};

export const FewSuggestions: Story = {
  args: {
    suggestions: ['e4', 'd4', 'Nf3'],
  },
};

export const ManySuggestions: Story = {
  args: {
    suggestions: ['e4', 'e5', 'd4', 'd5', 'Nf3', 'Nc3', 'c4', 'f4', 'g3', 'b3'],
  },
};

export const SingleSuggestion: Story = {
  args: {
    suggestions: ['e4'],
  },
};

export const ComplexMoves: Story = {
  args: {
    suggestions: ['Nxe5', 'O-O', 'Qh5+', 'Bxf7+', 'Nd5'],
  },
};
