import { Cell, List, Section, Switch, Text } from '@telegram-apps/telegram-ui';
import { useMockFlags, type MockFlags } from '../mockApi';
import { MOCK_CORRECT_CODE, MOCK_CORRECT_PASSWORD } from '../mockData';

const TOGGLES: Array<{ key: keyof MockFlags; label: string }> = [
  { key: 'hasPassword', label: 'Account already has 2FA' },
  { key: 'failRequestCode', label: 'Fail send-code' },
  { key: 'failSubmitCode', label: 'Fail submit-code' },
  { key: 'failSubmitTwoFactor', label: 'Fail two-factor' },
  { key: 'failConfirmMandate', label: 'Fail mandate' },
];

export function MockDevPanel() {
  const flags = useMockFlags();

  return (
    <List className="auth-mock-panel">
      <Section
        header="Mock controls"
        footer={`Code ${MOCK_CORRECT_CODE} · password ${MOCK_CORRECT_PASSWORD}`}
      >
        {TOGGLES.map((toggle) => (
          <Cell
            key={toggle.key}
            Component="label"
            after={
              <Switch
                checked={flags[toggle.key]}
                onChange={(event) => flags.setFlag(toggle.key, event.target.checked)}
              />
            }
          >
            <Text>{toggle.label}</Text>
          </Cell>
        ))}
      </Section>
    </List>
  );
}
