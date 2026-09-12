import { useState } from 'react';
import { AuthMandateFlow } from './auth/AuthMandateFlow';
import { useAuthStore } from './auth/authStore';
import { INITIAL_MANDATE_SCOPE } from './auth/mockData';
import { AppShell } from './app/AppShell';
import type { Session } from './types';

const DEV_SESSION: Session = {
  connectedAt: new Date().toISOString(),
  deviceName: 'Telegram Mini App',
  scope: INITIAL_MANDATE_SCOPE,
};

export default function App() {
  const [session, setSession] = useState<Session | null>(
    import.meta.env.DEV ? DEV_SESSION : null,
  );

  function handleSignInAgain() {
    useAuthStore.getState().reset();
    setSession(null);
  }

  if (!session) {
    return <AuthMandateFlow onComplete={setSession} />;
  }

  return <AppShell session={session} onSignInAgain={handleSignInAgain} />;
}
