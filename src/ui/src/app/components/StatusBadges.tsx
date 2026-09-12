import { Badge } from '@telegram-apps/telegram-ui';
import type { ServiceConnectionStatus, TicketStatus } from '../../types';
import { connectionLabel, ticketStatusLabel } from '../format';

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const mode = status === 'completed' ? 'primary' : status === 'waiting_response' ? 'gray' : 'secondary';
  return (
    <Badge type="number" mode={mode}>
      {ticketStatusLabel(status)}
    </Badge>
  );
}

export function ConnectionBadge({ status }: { status: ServiceConnectionStatus }) {
  const mode =
    status === 'connected' ? 'primary' : status === 'needs_2fa' ? 'critical' : 'gray';
  return (
    <Badge type="number" mode={mode}>
      {connectionLabel(status)}
    </Badge>
  );
}
