import type { Meta, StoryObj } from '@storybook/react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';

// Create Chess instances for different positions
const startGame = new Chess();

const middleGame = new Chess();
middleGame.move('e4');
middleGame.move('e5');
middleGame.move('Nf3');
middleGame.move('Nc6');

const italianGame = new Chess();
italianGame.move('e4');
italianGame.move('e5');
italianGame.move('Nf3');
italianGame.move('Nc6');
italianGame.move('Bc4');

const meta = {
  title: 'Components/ChessBoard',
  component: ChessBoard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    boardOrientation: {
      control: 'select',
      options: ['white', 'black'],
    },
    boardTheme: {
      control: 'select',
      options: ['default', 'green', 'blue', 'brown', 'purple', 'pink'],
    },
  },
  args: {
    onPieceDrop: () => false,
    children: null,
  },
} satisfies Meta<typeof ChessBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StartPosition: Story = {
  args: {
    position: startGame.fen(),
    boardOrientation: 'white',
    game: startGame,
    showCoordinates: true,
    boardTheme: 'default',
  },
};

export const MiddleGame: Story = {
  args: {
    position: middleGame.fen(),
    boardOrientation: 'white',
    game: middleGame,
    showCoordinates: true,
    boardTheme: 'default',
  },
};

export const ItalianGame: Story = {
  args: {
    position: italianGame.fen(),
    boardOrientation: 'white',
    game: italianGame,
    showCoordinates: true,
    boardTheme: 'default',
  },
};

export const BlackOrientation: Story = {
  args: {
    position: middleGame.fen(),
    boardOrientation: 'black',
    game: middleGame,
    showCoordinates: true,
    boardTheme: 'default',
  },
};

export const NoCoordinates: Story = {
  args: {
    position: startGame.fen(),
    boardOrientation: 'white',
    game: startGame,
    showCoordinates: false,
    boardTheme: 'default',
  },
};

export const GreenTheme: Story = {
  args: {
    position: middleGame.fen(),
    boardOrientation: 'white',
    game: middleGame,
    showCoordinates: true,
    boardTheme: 'green',
  },
};

export const BlueTheme: Story = {
  args: {
    position: middleGame.fen(),
    boardOrientation: 'white',
    game: middleGame,
    showCoordinates: true,
    boardTheme: 'blue',
  },
};

export const BrownTheme: Story = {
  args: {
    position: middleGame.fen(),
    boardOrientation: 'white',
    game: middleGame,
    showCoordinates: true,
    boardTheme: 'brown',
  },
};

export const PurpleTheme: Story = {
  args: {
    position: middleGame.fen(),
    boardOrientation: 'white',
    game: middleGame,
    showCoordinates: true,
    boardTheme: 'purple',
  },
};

export const PinkTheme: Story = {
  args: {
    position: middleGame.fen(),
    boardOrientation: 'white',
    game: middleGame,
    showCoordinates: true,
    boardTheme: 'pink',
  },
};

export const ClickToMoveMode: Story = {
  args: {
    position: startGame.fen(),
    boardOrientation: 'white',
    game: startGame,
    showCoordinates: true,
    boardTheme: 'default',
    clickToMoveMode: true,
    piecesWithMoves: ['e2', 'd2', 'b1', 'g1'],
  },
};

export const ClickToMoveModeWithSelection: Story = {
  args: {
    position: startGame.fen(),
    boardOrientation: 'white',
    game: startGame,
    showCoordinates: true,
    boardTheme: 'default',
    clickToMoveMode: true,
    selectedSquare: 'e2',
    possibleMoves: ['e3', 'e4'],
    piecesWithMoves: ['e2', 'd2', 'b1', 'g1'],
  },
};
