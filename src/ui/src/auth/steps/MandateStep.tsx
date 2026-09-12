import { useMutation } from '@tanstack/react-query';
import {
  Avatar,
  Card,
  Cell,
  IconContainer,
  Section,
  Switch,
  Text,
  Title,
} from '@telegram-apps/telegram-ui';
import { confirmMandate, getErrorMessage } from '../mockApi';
import { MOCK_SERVICES, NEVER_DO } from '../mockData';
import { useAuthStore } from '../authStore';
import { InlineError } from '../components/InlineError';
import { StepScreen } from '../components/StepScreen';

function ServiceGlyph({ name }: { name: string }) {
  return <Avatar acronym={name.slice(0, 2).toUpperCase()} size={40} />;
}

function BanGlyph() {
  return (
    <IconContainer>
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <circle
          cx="10"
          cy="10"
          r="7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path d="M5.2 14.8 L14.8 5.2" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    </IconContainer>
  );
}

export function MandateStep() {
  const scopeDraft = useAuthStore((state) => state.scopeDraft);
  const setAllowStateEscalation = useAuthStore((state) => state.setAllowStateEscalation);
  const afterConfirmMandate = useAuthStore((state) => state.afterConfirmMandate);

  const allowed = MOCK_SERVICES.filter((service) =>
    scopeDraft.allowedServiceIds.includes(service.id),
  );

  const mutation = useMutation({
    mutationFn: confirmMandate,
    onSuccess: afterConfirmMandate,
  });

  const error = mutation.isError
    ? getErrorMessage(mutation.error, 'Could not confirm the mandate.')
    : null;

  return (
    <StepScreen
      actionLabel="Confirm & connect"
      onAction={() => mutation.mutate(scopeDraft)}
      loading={mutation.isPending}
    >
      <Card type="ambient" className="mandate-card">
        <div className="mandate-card-header">
          <Title level="2">What Vakil can do</Title>
          <Text className="auth-copy">
            This is a signed mandate for this device. Vakil may only act inside the bounds below.
            You can revoke it instantly.
          </Text>
        </div>

        <Section header="Can act on your behalf">
          {allowed.map((service) => (
            <Cell
              key={service.id}
              before={<ServiceGlyph name={service.name} />}
              subtitle={service.username}
              multiline
            >
              {service.name}
            </Cell>
          ))}
        </Section>

        <Section header="Will never do" footer="Hard limits. These cannot be enabled.">
          {NEVER_DO.map((item) => (
            <Cell key={item.id} before={<BanGlyph />} subtitle={item.subtitle} multiline>
              {item.title}
            </Cell>
          ))}
        </Section>

        <Section
          header="Optional"
          footer="If on, Vakil may mention filing with 1159 / @consumergovuz_bot as a last resort. It will never send that line unless you switch this on."
        >
          <Cell
            Component="label"
            multiline
            after={
              <Switch
                checked={scopeDraft.allowStateEscalationMention}
                onChange={(event) => setAllowStateEscalation(event.target.checked)}
              />
            }
          >
            Allow mentioning state escalation
          </Cell>
        </Section>
      </Card>
      <InlineError>{error}</InlineError>
    </StepScreen>
  );
}
