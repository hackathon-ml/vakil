import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, Cell, Placeholder, Section, Spinner } from '@telegram-apps/telegram-ui';
import { listServices } from '../api';
import { ConnectionBadge } from '../components/StatusBadges';
import { useNavStore } from '../navStore';
import type { Session } from '../../types';

interface ServicesPageProps {
  session: Session;
  onSignInAgain: () => void;
}

export function ServicesPage({ session, onSignInAgain }: ServicesPageProps) {
  const openAddService = useNavStore((state) => state.openAddService);
  const servicesQuery = useQuery({ queryKey: ['services'], queryFn: listServices });

  if (servicesQuery.isLoading) {
    return (
      <div className="app-centered">
        <Spinner size="m" />
      </div>
    );
  }

  if (servicesQuery.isError) {
    return <Placeholder header="Bots unavailable" description="Could not load support bots." />;
  }

  const services = servicesQuery.data ?? [];
  const official = services.filter((service) => !service.isCustom);
  const custom = services.filter((service) => service.isCustom);
  const allowed = new Set(session.scope.allowedServiceIds);

  return (
    <div className="app-page">
      <Section
        header="Official support"
        footer="These are the bots Vakil may talk to under your mandate."
      >
        {official.map((service) => (
          <Cell
            key={service.id}
            before={<Avatar acronym={service.name.slice(0, 2).toUpperCase()} size={40} />}
            subtitle={service.username}
            description={
              allowed.has(service.id) ? 'In your mandate' : 'Not in the current mandate'
            }
            after={<ConnectionBadge status={service.connectionStatus} />}
            multiline
          >
            {service.name}
          </Cell>
        ))}
      </Section>

      <Section
        header="Your bots"
        footer="Add a company bot Vakil does not ship with. Connecting it still requires your account."
      >
        {custom.length === 0 ? (
          <Cell subtitle="None yet">No custom bots</Cell>
        ) : (
          custom.map((service) => (
            <Cell
              key={service.id}
              before={<Avatar acronym={service.name.slice(0, 2).toUpperCase()} size={40} />}
              subtitle={service.username}
              description={service.notes}
              after={<ConnectionBadge status={service.connectionStatus} />}
              multiline
            >
              {service.name}
            </Cell>
          ))
        )}
        <Cell onClick={openAddService} subtitle="Name, @username, optional note">
          Add a support bot
        </Cell>
      </Section>

      <div className="app-page-action">
        <Button mode="plain" stretched onClick={onSignInAgain}>
          Sign in again
        </Button>
      </div>
    </div>
  );
}
