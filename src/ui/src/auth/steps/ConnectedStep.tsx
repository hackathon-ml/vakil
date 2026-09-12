import { Placeholder, Section, Cell } from '@telegram-apps/telegram-ui';
import { useAuthStore } from '../authStore';
import { StepScreen } from '../components/StepScreen';
import { useThemeParams } from '../useThemeParams';
import type { Session } from '../../types';

function Checkmark({ color }: { color?: string }) {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r="34" fill="none" stroke={color} strokeWidth="3" />
      <path
        d="M22 37.5 L32 47 L50 26"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ConnectedStepProps {
  onComplete: (session: Session) => void;
}

export function ConnectedStep({ onComplete }: ConnectedStepProps) {
  const session = useAuthStore((state) => state.session);
  const theme = useThemeParams();

  return (
    <StepScreen
      actionLabel="Start using Wakil"
      onAction={() => {
        if (session) onComplete(session);
      }}
      disabled={!session}
    >
      <Placeholder
        header="Connected"
        description="Vakil is signed in as you on this device."
      >
        <Checkmark color={theme.buttonColor ?? theme.accentTextColor} />
      </Placeholder>
      {session ? (
        <Section header="This session">
          <Cell subtitle="Device">{session.deviceName}</Cell>
          <Cell subtitle="Status">Connected just now</Cell>
        </Section>
      ) : null}
    </StepScreen>
  );
}
