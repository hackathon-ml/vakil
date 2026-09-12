import { useEffect } from 'react';
import { backButton, miniApp } from '@telegram-apps/sdk-react';
import { useNavStore } from './navStore';

export function useAppBackButton(onExit?: () => void) {
  const ticketId = useNavStore((state) => state.ticketId);
  const addingService = useNavStore((state) => state.addingService);
  const goBack = useNavStore((state) => state.goBack);
  const visible = Boolean(ticketId || addingService);

  useEffect(() => {
    if (backButton.mount.isAvailable() && !backButton.isMounted()) {
      backButton.mount();
    }

    if (visible) {
      if (backButton.show.isAvailable()) backButton.show();
    } else if (backButton.hide.isAvailable()) {
      backButton.hide();
    }

    const unsubscribe = backButton.onClick.isAvailable()
      ? backButton.onClick(() => {
          const result = goBack();
          if (result === 'exit') {
            onExit?.();
            if (miniApp.close.isAvailable()) miniApp.close();
          }
        })
      : undefined;

    return () => {
      unsubscribe?.();
    };
  }, [visible, ticketId, addingService, goBack, onExit]);
}
