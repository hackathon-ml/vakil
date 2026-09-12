import {
  backButton,
  init as initSDK,
  miniApp,
  mockTelegramEnv,
  themeParams,
  viewport,
} from '@telegram-apps/sdk-react';

const MOCK_THEME = {
  bg_color: '#ffffff',
  text_color: '#000000',
  hint_color: '#707579',
  link_color: '#3390ec',
  button_color: '#3390ec',
  button_text_color: '#ffffff',
  secondary_bg_color: '#efeff3',
  header_bg_color: '#ffffff',
  accent_text_color: '#3390ec',
  section_bg_color: '#ffffff',
  section_header_text_color: '#707579',
  subtitle_text_color: '#707579',
  destructive_text_color: '#e53935',
  section_separator_color: '#c8c7cb',
  bottom_bar_bg_color: '#efeff3',
} as const;

function mockBrowserEnv() {
  const now = Math.floor(Date.now() / 1000);
  mockTelegramEnv({
    resetPostMessage: true,
    launchParams: {
      tgWebAppPlatform: 'tdesktop',
      tgWebAppVersion: '8.4',
      tgWebAppThemeParams: MOCK_THEME,
      tgWebAppData: new URLSearchParams({
        user: JSON.stringify({
          id: 1,
          first_name: 'Vakil',
          last_name: 'Tester',
          username: 'vakil_tester',
          language_code: 'en',
        }),
        auth_date: String(now),
        hash: 'mock',
        signature: 'mock',
      }),
    },
  });
}

function safeCall(fn: () => void) {
  try {
    fn();
  } catch {
    // Outside Telegram some SDK methods are unavailable even after mocking.
  }
}

export function initTelegram() {
  try {
    mockBrowserEnv();
  } catch {
    // Already in a Telegram web client, or mock params were rejected.
  }

  safeCall(() => initSDK());

  safeCall(() => {
    if (backButton.mount.isAvailable()) {
      backButton.mount();
    }
  });

  safeCall(() => {
    if (miniApp.mountSync.isAvailable()) {
      miniApp.mountSync();
      if (miniApp.bindCssVars.isAvailable()) {
        miniApp.bindCssVars();
      }
    }
  });

  safeCall(() => {
    if (themeParams.mountSync.isAvailable()) {
      themeParams.mountSync();
      if (themeParams.bindCssVars.isAvailable()) {
        themeParams.bindCssVars();
      }
    }
  });

  safeCall(() => {
    if (viewport.mount.isAvailable()) {
      void viewport.mount().then(() => {
        if (viewport.bindCssVars.isAvailable()) {
          viewport.bindCssVars();
        }
        if (viewport.expand.isAvailable()) {
          viewport.expand();
        }
      });
    }
  });
}
