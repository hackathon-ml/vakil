import { Button, Placeholder } from '@telegram-apps/telegram-ui';
import { StepScreen } from '../components/StepScreen';
import { useAuthStore } from '../authStore';

export function ExplainStep() {
  const continueFromExplain = useAuthStore((state) => state.continueFromExplain);

  return (
    <StepScreen>
      <Placeholder
        header="Vakil signs in as you"
        description="Vakil uses your own Telegram account to talk to support bots on your behalf. It never posts to groups or messages personal contacts. You can revoke access instantly."
        action={
          <Button mode="filled" size="l" stretched onClick={continueFromExplain}>
            Continue
          </Button>
        }
      />
    </StepScreen>
  );
}
