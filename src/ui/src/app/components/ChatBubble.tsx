import { Banner, Button, Caption, Text } from '@telegram-apps/telegram-ui';
import type { ChatMessage } from '../../types';
import { formatRelativeTime } from '../format';
import { TicketStatusBadge } from './StatusBadges';
import { useNavStore } from '../navStore';

export function ChatBubble({
  message,
  showTicketLink = true,
}: {
  message: ChatMessage;
  showTicketLink?: boolean;
}) {
  const openTicket = useNavStore((state) => state.openTicket);

  if (message.type === 'summary' && message.summary) {
    const summary = message.summary;
    return (
      <div className="chat-row chat-row--agent">
        <Banner
          type="inline"
          callout={summary.serviceName}
          header={summary.outcome}
          subheader={formatRelativeTime(message.createdAt)}
          description="Open the case to see the full timeline."
        >
          <TicketStatusBadge status={summary.status} />
          {showTicketLink ? (
            <Button size="s" mode="bezeled" onClick={() => openTicket(summary.ticketId)}>
              View ticket
            </Button>
          ) : null}
        </Banner>
      </div>
    );
  }

  const isUser = message.sender === 'user';
  return (
    <div className={`chat-row ${isUser ? 'chat-row--user' : 'chat-row--agent'}`}>
      <div className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--agent'}`}>
        <Text>{message.text}</Text>
        <Caption className="chat-time" level="2">
          {formatRelativeTime(message.createdAt)}
        </Caption>
      </div>
    </div>
  );
}
