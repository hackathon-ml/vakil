import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { miniApp, useSignal } from '@telegram-apps/sdk-react';
import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';
import App from './App.tsx';
import { initTelegram } from './init.ts';

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: false },
  },
});

function Root() {
  useEffect(() => {
    try {
      initTelegram();
    } catch (error) {
      console.warn('Telegram SDK init skipped', error);
    }
  }, []);

  const isDark = useSignal(miniApp.isDark);

  return (
    <AppRoot appearance={isDark ? 'dark' : 'light'} platform="ios">
      <App />
    </AppRoot>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Root />
    </QueryClientProvider>
  </StrictMode>,
);
