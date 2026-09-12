import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Section } from '@telegram-apps/telegram-ui';
import { getErrorMessage, requestCode, submitCode } from '../mockApi';
import { useAuthStore } from '../authStore';
import { CodeBoxes } from '../components/CodeBoxes';
import { InlineError } from '../components/InlineError';
import { StepScreen } from '../components/StepScreen';
import type { TwoFactorStatus } from '../../types';

const RESEND_SECONDS = 30;

interface CodeStepProps {
  twoFactorOverride?: TwoFactorStatus;
}

export function CodeStep({ twoFactorOverride }: CodeStepProps) {
  const pendingPhone = useAuthStore((state) => state.pendingPhone);
  const afterSubmitCode = useAuthStore((state) => state.afterSubmitCode);
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const submittedRef = useRef('');

  const submitMutation = useMutation({
    mutationFn: submitCode,
    onSuccess: (status) => {
      setCode('');
      afterSubmitCode(twoFactorOverride ?? status);
    },
    onError: () => {
      submittedRef.current = '';
      setCode('');
    },
  });

  const resendMutation = useMutation({
    mutationFn: requestCode,
    onSuccess: () => {
      setSecondsLeft(RESEND_SECONDS);
    },
  });

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const id = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const mutateSubmit = submitMutation.mutate;
  const submitPending = submitMutation.isPending;

  useEffect(() => {
    if (code.length !== 6 || !pendingPhone || submitPending) return;
    if (submittedRef.current === code) return;
    submittedRef.current = code;
    mutateSubmit({ phoneNumber: pendingPhone, code });
  }, [code, pendingPhone, mutateSubmit, submitPending]);

  const error = submitMutation.isError
    ? getErrorMessage(submitMutation.error, 'That code is incorrect.')
    : resendMutation.isError
      ? getErrorMessage(resendMutation.error, 'Could not resend the code.')
      : null;

  return (
    <StepScreen>
      <Section header="Login code" footer="Enter the 6-digit code Telegram sent you.">
        <div className="auth-code-wrap">
          <CodeBoxes
            value={code}
            error={submitMutation.isError}
            disabled={submitMutation.isPending}
            onChange={(next) => {
              submitMutation.reset();
              setCode(next);
            }}
          />
        </div>
      </Section>
      <InlineError>{error}</InlineError>
      <div className="auth-resend">
        <Button
          mode="plain"
          size="s"
          disabled={secondsLeft > 0 || resendMutation.isPending || !pendingPhone}
          loading={resendMutation.isPending}
          onClick={() => {
            if (!pendingPhone) return;
            resendMutation.mutate({ phoneNumber: pendingPhone });
          }}
        >
          {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : 'Resend code'}
        </Button>
      </div>
    </StepScreen>
  );
}
