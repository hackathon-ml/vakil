import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input, Section } from '@telegram-apps/telegram-ui';
import { formatPhoneInput, getErrorMessage, isE164, requestCode } from '../mockApi';
import { useAuthStore } from '../authStore';
import { InlineError } from '../components/InlineError';
import { StepScreen } from '../components/StepScreen';

export function PhoneStep() {
  const pendingPhone = useAuthStore((state) => state.pendingPhone);
  const afterRequestCode = useAuthStore((state) => state.afterRequestCode);
  const [phone, setPhone] = useState(pendingPhone ?? '+');
  const [localError, setLocalError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: requestCode,
    onSuccess: () => {
      const submitted = phone;
      setPhone('+');
      setLocalError(null);
      afterRequestCode(submitted);
    },
  });

  function handleSend() {
    setLocalError(null);
    if (!isE164(phone)) {
      setLocalError('Enter a valid phone number in international format.');
      return;
    }
    mutation.mutate({ phoneNumber: phone });
  }

  const error =
    localError ??
    (mutation.isError ? getErrorMessage(mutation.error, 'Could not send the code.') : null);

  return (
    <StepScreen
      actionLabel="Send code"
      onAction={handleSend}
      loading={mutation.isPending}
    >
      <Section
        header="Your number"
        footer="We'll send a login code to this Telegram account."
      >
        <Input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          header="Phone number"
          placeholder="+998 90 123 45 67"
          value={phone}
          status={error ? 'error' : 'default'}
          onChange={(event) => {
            setLocalError(null);
            mutation.reset();
            setPhone(formatPhoneInput(event.target.value));
          }}
        />
      </Section>
      <InlineError>{error}</InlineError>
    </StepScreen>
  );
}
