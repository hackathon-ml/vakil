import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Cell, Placeholder, Section, Spinner, TabsList } from '@telegram-apps/telegram-ui';
import { listTickets } from '../api';
import { TicketStatusBadge } from '../components/StatusBadges';
import { formatRelativeTime } from '../format';
import { useNavStore } from '../navStore';
import type { TicketStatus } from '../../types';

type Filter = 'all' | TicketStatus;

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'in_progress', label: 'Active' },
  { id: 'waiting_response', label: 'Waiting' },
  { id: 'completed', label: 'Done' },
];

export function TicketsPage() {
  const openTicket = useNavStore((state) => state.openTicket);
  const [filter, setFilter] = useState<Filter>('all');
  const ticketsQuery = useQuery({ queryKey: ['tickets'], queryFn: listTickets });

  if (ticketsQuery.isLoading) {
    return (
      <div className="app-centered">
        <Spinner size="m" />
      </div>
    );
  }

  if (ticketsQuery.isError) {
    return <Placeholder header="Tickets unavailable" description="Could not load cases." />;
  }

  const tickets = (ticketsQuery.data ?? []).filter(
    (ticket) => filter === 'all' || ticket.status === filter,
  );

  return (
    <div className="app-page">
      <TabsList className="app-tabs">
        {FILTERS.map((item) => (
          <TabsList.Item
            key={item.id}
            selected={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </TabsList.Item>
        ))}
      </TabsList>

      {tickets.length === 0 ? (
        <Placeholder header="No cases here" description="When Vakil opens a fight, it lands in this list." />
      ) : (
        <Section header="Cases">
          {tickets.map((ticket) => (
            <Cell
              key={ticket.id}
              multiline
              subtitle={ticket.serviceName}
              description={formatRelativeTime(ticket.lastUpdatedAt)}
              after={<TicketStatusBadge status={ticket.status} />}
              onClick={() => openTicket(ticket.id)}
            >
              {ticket.title}
            </Cell>
          ))}
        </Section>
      )}
    </div>
  );
}
