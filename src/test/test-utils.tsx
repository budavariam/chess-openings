import { renderHook as originalRenderHook, render as originalRender } from '@testing-library/react';
import { ToastSettingsProvider } from '../contexts/ToastSettingsContext';
import type { ReactNode } from 'react';

const AllProviders = ({ children }: { children: ReactNode }) => (
  <ToastSettingsProvider>{children}</ToastSettingsProvider>
);

export const renderHook: typeof originalRenderHook = (hook, options) => {
  return originalRenderHook(hook, {
    wrapper: AllProviders,
    ...options,
  });
};

export const render: typeof originalRender = (ui, options) => {
  return originalRender(ui, {
    wrapper: AllProviders,
    ...options,
  });
};

// Re-export everything else
export * from '@testing-library/react';
