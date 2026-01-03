import type { Meta, StoryObj } from '@storybook/react';
import { InteractiveMovesDisplay } from './InteractiveMovesDisplay';

const meta = {
  title: 'Components/InteractiveMovesDisplay',
  component: InteractiveMovesDisplay,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onMoveClick: { action: 'move clicked' },
  },
} satisfies Meta<typeof InteractiveMovesDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMoves = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'd6', 'd4', 'exd4', 'cxd4', 'Bb4+', 'Bd2', 'Bxd2+', 'Nxd2', 'Nf6'];

export const Default: Story = {
  args: {
    moves: sampleMoves,
  },
};

export const Interactive: Story = {
  args: {
    moves: sampleMoves,
    onMoveClick: (moveIndex) => {
      console.log(`Clicked move at index ${moveIndex}`);
    },
  },
};

export const WithMaxMoves: Story = {
  args: {
    moves: sampleMoves,
    maxMoves: 8,
    onMoveClick: (moveIndex) => {
      console.log(`Clicked move at index ${moveIndex}`);
    },
  },
};

export const ShortGame: Story = {
  args: {
    moves: ['e4', 'e5', 'Nf3'],
    onMoveClick: (moveIndex) => {
      console.log(`Clicked move at index ${moveIndex}`);
    },
  },
};

export const LongGame: Story = {
  args: {
    moves: [
      'e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6',
      'Nc3', 'a6', 'Be3', 'e5', 'Nb3', 'Be6', 'f3', 'Be7',
      'Qd2', 'O-O', 'O-O-O', 'Nbd7', 'g4', 'b5', 'g5', 'b4',
      'Ne2', 'Ne8', 'f4', 'a5', 'f5', 'a4', 'Nbd4', 'Bxd4'
    ],
    onMoveClick: (moveIndex) => {
      console.log(`Clicked move at index ${moveIndex}`);
    },
  },
};

export const EmptyMoves: Story = {
  args: {
    moves: [],
  },
};

export const NoCallback: Story = {
  args: {
    moves: sampleMoves,
    onMoveClick: undefined,
  },
};

export const CustomClassName: Story = {
  args: {
    moves: sampleMoves,
    className: 'text-lg font-bold text-blue-600',
    onMoveClick: (moveIndex) => {
      console.log(`Clicked move at index ${moveIndex}`);
    },
  },
};
