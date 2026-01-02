import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { DEFAULT_TOAST_SETTINGS } from '../types/toastSettings';
import type { ToastSettings } from '../types/toastSettings';
import { ToastSettingsProvider } from '../contexts/ToastSettingsContext';

const meta = {
  title: 'Components/SettingsModal',
  component: SettingsModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastSettingsProvider>
        <Story />
      </ToastSettingsProvider>
    ),
  ],
} satisfies Meta<typeof SettingsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

function SettingsModalWrapper(props: Partial<typeof SettingsModal>) {
  const [settings, setSettings] = useState<ToastSettings>(
    props.settings || DEFAULT_TOAST_SETTINGS
  );

  const handleUpdateNotificationType = (
    type: 'success' | 'error' | 'info',
    updates: Partial<ToastSettings[typeof type]>
  ) => {
    setSettings((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...updates,
      },
    }));
  };

  const handleUpdateSettings = (updates: Partial<ToastSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleReset = () => {
    setSettings(DEFAULT_TOAST_SETTINGS);
  };

  return (
    <SettingsModal
      isOpen={props.isOpen ?? true}
      onClose={props.onClose || (() => console.log('Close clicked'))}
      settings={settings}
      onUpdateNotificationType={handleUpdateNotificationType}
      onUpdateSettings={handleUpdateSettings}
      onReset={handleReset}
    />
  );
}

export const Default: Story = {
  render: () => <SettingsModalWrapper />,
};

export const AllEnabled: Story = {
  render: () => (
    <SettingsModalWrapper
      settings={{
        version: '1.1.0',
        success: { enabled: true, duration: 3000 },
        error: { enabled: true, duration: 5000 },
        info: { enabled: true, duration: 3000 },
        position: 'bottom-right',
        showProgressBar: true,
        pauseOnHover: true,
        closeOnClick: true,
        newestOnTop: false,
      }}
    />
  ),
};

export const AllDisabled: Story = {
  render: () => (
    <SettingsModalWrapper
      settings={{
        version: '1.1.0',
        success: { enabled: false, duration: 3000 },
        error: { enabled: false, duration: 5000 },
        info: { enabled: false, duration: 3000 },
        position: 'bottom-right',
        showProgressBar: false,
        pauseOnHover: false,
        closeOnClick: false,
        newestOnTop: false,
      }}
    />
  ),
};

export const OnlyErrors: Story = {
  render: () => (
    <SettingsModalWrapper
      settings={{
        version: '1.1.0',
        success: { enabled: false, duration: 3000 },
        error: { enabled: true, duration: 5000 },
        info: { enabled: false, duration: 3000 },
        position: 'bottom-right',
        showProgressBar: true,
        pauseOnHover: true,
        closeOnClick: true,
        newestOnTop: false,
      }}
    />
  ),
};

export const LongDurations: Story = {
  render: () => (
    <SettingsModalWrapper
      settings={{
        version: '1.1.0',
        success: { enabled: true, duration: 10000 },
        error: { enabled: true, duration: 10000 },
        info: { enabled: true, duration: 10000 },
        position: 'bottom-right',
        showProgressBar: true,
        pauseOnHover: true,
        closeOnClick: true,
        newestOnTop: false,
      }}
    />
  ),
};

export const ShortDurations: Story = {
  render: () => (
    <SettingsModalWrapper
      settings={{
        version: '1.1.0',
        success: { enabled: true, duration: 1000 },
        error: { enabled: true, duration: 1000 },
        info: { enabled: true, duration: 1000 },
        position: 'bottom-right',
        showProgressBar: true,
        pauseOnHover: true,
        closeOnClick: true,
        newestOnTop: false,
      }}
    />
  ),
};

export const TopLeftPosition: Story = {
  render: () => (
    <SettingsModalWrapper
      settings={{
        version: '1.1.0',
        success: { enabled: true, duration: 3000 },
        error: { enabled: true, duration: 5000 },
        info: { enabled: true, duration: 3000 },
        position: 'top-left',
        showProgressBar: true,
        pauseOnHover: true,
        closeOnClick: true,
        newestOnTop: true,
      }}
    />
  ),
};
