import { Button } from '@telegram-apps/telegram-ui';
import { ExplainStep } from './steps/ExplainStep';
import { PhoneStep } from './steps/PhoneStep';
import { CodeStep } from './steps/CodeStep';
import { TwoFactorStep } from './steps/TwoFactorStep';
import { MandateStep } from './steps/MandateStep';
import { ConnectedStep } from './steps/ConnectedStep';
import { MockDevPanel } from './components/MockDevPanel';
import { useAuthStore } from './authStore';
import { useAuthBackButton } from './useAuthBackButton';
import type { Session, TwoFactorStatus } from '../types';
import './auth.css';

export interface AuthMandateFlowProps {
  onComplete: (session: Session) => void;
  onExit?: () => void;
  twoFactorStatus?: TwoFactorStatus;
}

function BrowserBackFallback({ onExit }: { onExit?: () => void }) {
  const step = useAuthStore((state) => state.step);
  const goBack = useAuthStore((state) => state.goBack);

  if (!import.meta.env.DEV || step === 'connected') {
    return null;
  }

  return (
    <div className="auth-browser-back">
      <Button
        mode="plain"
        size="s"
        onClick={() => {
          const result = goBack();
          if (result === 'exit') {
            onExit?.();
          }
        }}
      >
        Back
      </Button>
    </div>
  );
}

export function AuthMandateFlow({
  onComplete,
  onExit,
  twoFactorStatus,
}: AuthMandateFlowProps) {
  const step = useAuthStore((state) => state.step);
  const phonePhase = useAuthStore((state) => state.phonePhase);
  useAuthBackButton(onExit);

  let screen = null;
  if (step === 'phone' && phonePhase === 'explain') {
    screen = <ExplainStep />;
  } else if (step === 'phone') {
    screen = <PhoneStep />;
  } else if (step === 'code') {
    screen = <CodeStep twoFactorOverride={twoFactorStatus} />;
  } else if (step === 'two_factor') {
    screen = <TwoFactorStep />;
  } else if (step === 'mandate') {
    screen = <MandateStep />;
  } else {
    screen = <ConnectedStep onComplete={onComplete} />;
  }

  return (
    <div className="auth-flow">
      <BrowserBackFallback onExit={onExit} />
      {screen}
      {import.meta.env.DEV ? <MockDevPanel /> : null}
    </div>
  );
}
