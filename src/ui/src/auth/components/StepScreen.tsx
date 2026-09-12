import type { ReactNode } from 'react';
import { Button, List } from '@telegram-apps/telegram-ui';

interface StepScreenProps {
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
  disabled?: boolean;
  footer?: ReactNode;
}

export function StepScreen({
  children,
  actionLabel,
  onAction,
  loading = false,
  disabled = false,
  footer,
}: StepScreenProps) {
  return (
    <List className="auth-step">
      {children}
      {actionLabel ? (
        <div className="auth-step-action">
          <Button
            mode="filled"
            size="l"
            stretched
            loading={loading}
            disabled={disabled || loading}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      ) : null}
      {footer}
    </List>
  );
}
