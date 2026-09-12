import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Section } from '@telegram-apps/telegram-ui';
import { createService, getErrorMessage } from '../api';
import { useNavStore } from '../navStore';

export function AddServicePage() {
  const goBack = useNavStore((state) => state.goBack);
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('@');
  const [notes, setNotes] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['services'] });
      goBack();
    },
  });

  function handleSave() {
    setLocalError(null);
    if (!name.trim()) {
      setLocalError('Enter a service name.');
      return;
    }
    mutation.mutate({ name, username, notes: notes.trim() || undefined });
  }

  const error =
    localError ??
    (mutation.isError ? getErrorMessage(mutation.error, 'Could not add that bot.') : null);

  return (
    <div className="app-page">
      <Section header="Add a support bot" footer="Custom bots stay on this device. Vakil will not message them until you connect.">
        <Input
          header="Name"
          placeholder="Uzum Tezkor"
          value={name}
          status={error && !name.trim() ? 'error' : 'default'}
          onChange={(event) => {
            setLocalError(null);
            mutation.reset();
            setName(event.target.value);
          }}
        />
        <Input
          header="Telegram username"
          placeholder="@support_bot"
          value={username}
          onChange={(event) => {
            setLocalError(null);
            mutation.reset();
            const next = event.target.value.replace(/\s/g, '');
            setUsername(next.startsWith('@') ? next : `@${next.replace(/@/g, '')}`);
          }}
        />
        <Input
          header="Notes"
          placeholder="Optional — when to use this bot"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </Section>
      {error ? <p className="app-inline-error">{error}</p> : null}
      <div className="app-page-action">
        <Button mode="filled" stretched loading={mutation.isPending} onClick={handleSave}>
          Save bot
        </Button>
      </div>
    </div>
  );
}
