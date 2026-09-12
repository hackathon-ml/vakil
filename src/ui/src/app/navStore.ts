import { create } from 'zustand';

export type AppTab = 'chat' | 'tickets' | 'services';

interface NavState {
  tab: AppTab;
  ticketId: string | null;
  addingService: boolean;
  openTab: (tab: AppTab) => void;
  openTicket: (ticketId: string) => void;
  openAddService: () => void;
  goBack: () => 'exit' | undefined;
}

export const useNavStore = create<NavState>((set, get) => ({
  tab: 'chat',
  ticketId: null,
  addingService: false,
  openTab: (tab) => set({ tab, ticketId: null, addingService: false }),
  openTicket: (ticketId) => set({ tab: 'tickets', ticketId, addingService: false }),
  openAddService: () => set({ tab: 'services', addingService: true, ticketId: null }),
  goBack: () => {
    const { ticketId, addingService } = get();
    if (ticketId) {
      set({ ticketId: null });
      return undefined;
    }
    if (addingService) {
      set({ addingService: false });
      return undefined;
    }
    return 'exit';
  },
}));

export function isOnRootTab(): boolean {
  const { ticketId, addingService } = useNavStore.getState();
  return !ticketId && !addingService;
}
