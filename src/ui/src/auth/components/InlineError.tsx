import type { ReactNode } from 'react';
import { Caption } from '@telegram-apps/telegram-ui';

export function InlineError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <Caption level="1" className="auth-inline-error">
      {children}
    </Caption>
  );
}
