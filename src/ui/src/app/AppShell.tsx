import { Button, Tabbar } from '@telegram-apps/telegram-ui';
import { ChatPage } from './pages/ChatPage';
import { TicketsPage } from './pages/TicketsPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { AddServicePage } from './pages/AddServicePage';
import { BotsIcon, ChatIcon, TicketIcon } from './icons';
import { useNavStore } from './navStore';
import { useAppBackButton } from './useAppBackButton';
import type { Session } from '../types';
import './app.css';

interface AppShellProps {
  session: Session;
  onSignInAgain: () => void;
}

function BrowserBackFallback() {
  const ticketId = useNavStore((state) => state.ticketId);
  const addingService = useNavStore((state) => state.addingService);
  const goBack = useNavStore((state) => state.goBack);

  if (!import.meta.env.DEV || (!ticketId && !addingService)) {
    return null;
  }

  return (
    <div className="app-browser-back">
      <Button mode="plain" size="s" onClick={() => goBack()}>
        Back
      </Button>
    </div>
  );
}

export function AppShell({ session, onSignInAgain }: AppShellProps) {
  const tab = useNavStore((state) => state.tab);
  const ticketId = useNavStore((state) => state.ticketId);
  const addingService = useNavStore((state) => state.addingService);
  const openTab = useNavStore((state) => state.openTab);
  useAppBackButton();

  let screen = <ChatPage />;
  if (ticketId) {
    screen = <TicketDetailPage ticketId={ticketId} />;
  } else if (addingService) {
    screen = <AddServicePage />;
  } else if (tab === 'tickets') {
    screen = <TicketsPage />;
  } else if (tab === 'services') {
    screen = <ServicesPage session={session} onSignInAgain={onSignInAgain} />;
  }

  const showTabbar = !ticketId && !addingService;

  return (
    <div className={`app-shell ${showTabbar ? 'app-shell--tabs' : ''}`}>
      <BrowserBackFallback />
      {screen}
      {showTabbar ? (
        <Tabbar>
          <Tabbar.Item selected={tab === 'chat'} text="Chat" onClick={() => openTab('chat')}>
            <ChatIcon />
          </Tabbar.Item>
          <Tabbar.Item
            selected={tab === 'tickets'}
            text="Tickets"
            onClick={() => openTab('tickets')}
          >
            <TicketIcon />
          </Tabbar.Item>
          <Tabbar.Item
            selected={tab === 'services'}
            text="Bots"
            onClick={() => openTab('services')}
          >
            <BotsIcon />
          </Tabbar.Item>
        </Tabbar>
      ) : null}
    </div>
  );
}
