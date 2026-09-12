import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconButton, Input, Placeholder, Spinner } from '@telegram-apps/telegram-ui';
import { getErrorMessage, listMessages, sendMessage } from '../api';
import { ChatBubble } from '../components/ChatBubble';
import { SendIcon } from '../icons';

export function ChatPage() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesQuery = useQuery({ queryKey: ['messages'], queryFn: listMessages });

  const mutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: async () => {
      setDraft('');
      await queryClient.invalidateQueries({ queryKey: ['messages'] });
      await queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesQuery.data, mutation.isPending]);

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || mutation.isPending) return;
    mutation.mutate({ text });
  }

  const error = mutation.isError
    ? getErrorMessage(mutation.error, 'Could not send that message.')
    : null;

  return (
    <div className="chat-page">
      {messagesQuery.isLoading ? (
        <div className="app-centered">
          <Spinner size="m" />
        </div>
      ) : null}
      {messagesQuery.isError ? (
        <Placeholder header="Chat unavailable" description="Could not load messages." />
      ) : null}
      <div className="chat-thread">
        {messagesQuery.data?.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {mutation.isPending ? (
          <div className="chat-row chat-row--agent">
            <div className="chat-bubble chat-bubble--agent">
              <Spinner size="s" />
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>
      {error ? <p className="app-inline-error">{error}</p> : null}
      <form className="chat-composer" onSubmit={handleSubmit}>
        <Input
          placeholder="Tell Vakil what happened"
          value={draft}
          disabled={mutation.isPending}
          after={
            <IconButton
              mode="plain"
              size="s"
              type="submit"
              disabled={!draft.trim() || mutation.isPending}
              aria-label="Send"
            >
              <SendIcon />
            </IconButton>
          }
          onChange={(event) => {
            mutation.reset();
            setDraft(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
        />
      </form>
    </div>
  );
}
