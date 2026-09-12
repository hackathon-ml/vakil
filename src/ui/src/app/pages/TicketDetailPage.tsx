import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Cell,
  Placeholder,
  Section,
  Spinner,
} from '@telegram-apps/telegram-ui';
import { getErrorMessage, getTicket, setTicketFeedback } from '../api';
import { ChatBubble } from '../components/ChatBubble';
import { TicketStatusBadge } from '../components/StatusBadges';
import { formatRelativeTime } from '../format';
import { useNavStore } from '../navStore';
import { openTelegramLink } from '@telegram-apps/sdk-react';
import type { FeedbackValue } from '../../types';

export function TicketDetailPage({ ticketId }: { ticketId: string }) {
  const goBack = useNavStore((state) => state.goBack);
  const queryClient = useQueryClient();
  const ticketQuery = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => getTicket(ticketId),
  });

  const feedbackMutation = useMutation({
    mutationFn: setTicketFeedback,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      await queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  function setFeedback(feedback: FeedbackValue) {
    const next = ticketQuery.data?.feedback === feedback ? null : feedback;
    feedbackMutation.mutate({ ticketId, feedback: next });
  }

  function openChat() {
    const link = ticketQuery.data?.chatDeepLink;
    if (!link) return;
    if (openTelegramLink.isAvailable()) {
      openTelegramLink(link);
      return;
    }
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  if (ticketQuery.isLoading) {
    return (
      <div className="app-centered">
        <Spinner size="m" />
      </div>
    );
  }

  if (ticketQuery.isError || !ticketQuery.data) {
    return (
      <Placeholder
        header="Ticket unavailable"
        description={getErrorMessage(ticketQuery.error, 'Could not load this case.')}
        action={
          <Button mode="filled" onClick={() => goBack()}>
            Back to tickets
          </Button>
        }
      />
    );
  }

  const ticket = ticketQuery.data;

  return (
    <div className="app-page">
      <Section
        header={ticket.title}
        footer={`Updated ${formatRelativeTime(ticket.lastUpdatedAt)}`}
      >
        <Cell after={<TicketStatusBadge status={ticket.status} />} subtitle="Support bot">
          {ticket.serviceName}
        </Cell>
      </Section>

      <Section header="Timeline">
        <div className="ticket-timeline">
          {ticket.messages.map((message) => (
            <ChatBubble key={message.id} message={message} showTicketLink={false} />
          ))}
        </div>
      </Section>

      <Section header="How did Vakil do?" footer="This stays on-device and trains the next mandate.">
        <div className="ticket-feedback">
          <Button
            mode={ticket.feedback === 'up' ? 'filled' : 'bezeled'}
            stretched
            loading={feedbackMutation.isPending && ticket.feedback !== 'up'}
            onClick={() => setFeedback('up')}
          >
            Helpful
          </Button>
          <Button
            mode={ticket.feedback === 'down' ? 'filled' : 'bezeled'}
            stretched
            loading={feedbackMutation.isPending && ticket.feedback !== 'down'}
            onClick={() => setFeedback('down')}
          >
            Not helpful
          </Button>
        </div>
      </Section>

      {ticket.chatDeepLink ? (
        <div className="app-page-action">
          <Button mode="outline" stretched onClick={openChat}>
            Open real chat in Telegram
          </Button>
        </div>
      ) : null}
    </div>
  );
}
