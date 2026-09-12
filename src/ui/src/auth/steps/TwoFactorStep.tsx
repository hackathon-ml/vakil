import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input, Section, Text } from '@telegram-apps/telegram-ui';
import { getErrorMessage, submitTwoFactor } from '../mockApi';
import { useAuthStore } from '../authStore';
import { InlineError } from '../components/InlineError';
import { StepScreen } from '../components/StepScreen';

export function TwoFactorStep() {
  const status = useAuthStore((state) => state.twoFactorStatus);
  const afterSubmitTwoFactor = useAuthStore((state) => state.afterSubmitTwoFactor);
  const hasPassword = status?.hasPassword ?? true;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: submitTwoFactor,
    onSuccess: () => {
      setPassword('');
      setConfirmPassword('');
      setLocalError(null);
      afterSubmitTwoFactor();
    },
  });

  function handleConfirm() {
    setLocalError(null);
    mutation.reset();
    if (!hasPassword && password !== confirmPassword) {
      setLocalError("Passwords don't match.");
      return;
    }
    if (!hasPassword && password.length < 8) {
      setLocalError('Use at least 8 characters.');
      return;
    }
    mutation.mutate({ password });
  }

  const error =
    localError ??
    (mutation.isError
      ? getErrorMessage(
          mutation.error,
          hasPassword ? 'That password is incorrect.' : 'Could not enable two-factor authentication.',
        )
      : null);

  if (hasPassword) {
    return (
      <StepScreen
        actionLabel="Confirm"
        onAction={handleConfirm}
        loading={mutation.isPending}
        disabled={!password}
      >
        <Section
          header="Cloud password"
          footer="This is your existing Telegram two-step verification password. Vakil never stores it."
        >
          <Input
            type="password"
            autoComplete="off"
            header="Password"
            placeholder="Telegram cloud password"
            value={password}
            status={error ? 'error' : 'default'}
            onChange={(event) => {
              setLocalError(null);
              mutation.reset();
              setPassword(event.target.value);
            }}
          />
        </Section>
        <InlineError>{error}</InlineError>
      </StepScreen>
    );
  }

  return (
    <StepScreen
      actionLabel="Enable & continue"
      onAction={handleConfirm}
      loading={mutation.isPending}
      disabled={!password || !confirmPassword}
    >
      <Section header="Enable 2FA">
        <Text className="auth-copy">
          This protects your account from being taken over — Wakil requires it before it will act
          for you.
        </Text>
      </Section>
      <Section footer="Choose a password you don't use anywhere else. You can change it later in Telegram.">
        <Input
          type="password"
          autoComplete="off"
          header="New password"
          placeholder="At least 8 characters"
          value={password}
          status={error ? 'error' : 'default'}
          onChange={(event) => {
            setLocalError(null);
            mutation.reset();
            setPassword(event.target.value);
          }}
        />
        <Input
          type="password"
          autoComplete="off"
          header="Confirm password"
          placeholder="Repeat password"
          value={confirmPassword}
          status={error ? 'error' : 'default'}
          onChange={(event) => {
            setLocalError(null);
            mutation.reset();
            setConfirmPassword(event.target.value);
          }}
        />
      </Section>
      <InlineError>{error}</InlineError>
    </StepScreen>
  );
}
