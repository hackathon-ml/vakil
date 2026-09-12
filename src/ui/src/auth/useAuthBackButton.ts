import { useEffect } from 'react';
import { backButton, miniApp } from '@telegram-apps/sdk-react';
import { useAuthStore } from './authStore';

export function useAuthBackButton(onExit?: () => void) {
  const step = useAuthStore((state) => state.step);
  const phonePhase = useAuthStore((state) => state.phonePhase);
  const goBack = useAuthStore((state) => state.goBack);
  const visible = step !== 'connected';

  useEffect(() => {
    if (backButton.mount.isAvailable() && !backButton.isMounted()) {
      backButton.mount();
    }

    if (visible) {
      if (backButton.show.isAvailable()) {
        backButton.show();
      }
    } else if (backButton.hide.isAvailable()) {
      backButton.hide();
    }

    const unsubscribe = backButton.onClick.isAvailable()
      ? backButton.onClick(() => {
          const result = goBack();
          if (result === 'exit') {
            onExit?.();
            if (miniApp.close.isAvailable()) {
              miniApp.close();
            }
          }
        })
      : undefined;

    return () => {
      unsubscribe?.();
      if (backButton.hide.isAvailable()) {
        backButton.hide();
      }
    };
  }, [visible, step, phonePhase, goBack, onExit]);
}
