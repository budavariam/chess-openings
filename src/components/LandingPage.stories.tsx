import type { Meta, StoryObj } from '@storybook/react';
import { LandingPage } from './LandingPage';

const meta = {
  title: 'Components/LandingPage',
  component: LandingPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-gray-900 text-gray-100 p-6">
        <Story />
      </div>
    ),
  ],
};
