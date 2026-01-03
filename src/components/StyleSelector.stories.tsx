import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { StyleSelector } from './StyleSelector';
import type { BoardOrientation } from '../types';

const meta = {
  title: 'Components/StyleSelector',
  component: StyleSelector,
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
      options: ['default', 'brown', 'blue', 'green'],
    },
    showCoordinates: {
      control: 'boolean',
    },
  },
  args: {
    logAction: (action: string, details?: Record<string, unknown>) => {
      console.log('Action:', action, details);
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '3rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StyleSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WhiteOrientation: Story = {
  args: {
    boardOrientation: 'white',
    boardTheme: 'default',
    showCoordinates: true,
  },
  render: function Render(args) {
    const [orientation, setOrientation] = useState<BoardOrientation>(args.boardOrientation);
    const [theme, setTheme] = useState(args.boardTheme);
    const [coordinates, setCoordinates] = useState(args.showCoordinates);

    return (
      <StyleSelector
        {...args}
        boardOrientation={orientation}
        setBoardOrientation={setOrientation}
        boardTheme={theme}
        showCoordinates={coordinates}
        onThemeChange={setTheme}
        onCoordinatesToggle={setCoordinates}
      />
    );
  },
};

export const BlackOrientation: Story = {
  args: {
    boardOrientation: 'black',
    boardTheme: 'brown',
    showCoordinates: false,
  },
  render: function Render(args) {
    const [orientation, setOrientation] = useState<BoardOrientation>(args.boardOrientation);
    const [theme, setTheme] = useState(args.boardTheme);
    const [coordinates, setCoordinates] = useState(args.showCoordinates);

    return (
      <StyleSelector
        {...args}
        boardOrientation={orientation}
        setBoardOrientation={setOrientation}
        boardTheme={theme}
        showCoordinates={coordinates}
        onThemeChange={setTheme}
        onCoordinatesToggle={setCoordinates}
      />
    );
  },
};

export const WithDarkMode: Story = {
  args: {
    boardOrientation: 'white',
    boardTheme: 'blue',
    showCoordinates: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: function Render(args) {
    const [orientation, setOrientation] = useState<BoardOrientation>(args.boardOrientation);
    const [theme, setTheme] = useState(args.boardTheme);
    const [coordinates, setCoordinates] = useState(args.showCoordinates);

    return (
      <div className="dark">
        <StyleSelector
          {...args}
          boardOrientation={orientation}
          setBoardOrientation={setOrientation}
          boardTheme={theme}
          showCoordinates={coordinates}
          onThemeChange={setTheme}
          onCoordinatesToggle={setCoordinates}
        />
      </div>
    );
  },
};
