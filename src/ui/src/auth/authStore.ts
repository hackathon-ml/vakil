import { create } from 'zustand';
import { INITIAL_MANDATE_SCOPE } from './mockData';
import type { AuthStep, MandateScope, Session, TwoFactorStatus } from '../types';

export type PhonePhase = 'explain' | 'input';

interface AuthState {
  step: AuthStep;
  phonePhase: PhonePhase;
  pendingPhone: string | null;
  twoFactorStatus: TwoFactorStatus | null;
  scopeDraft: MandateScope;
  session: Session | null;
  continueFromExplain: () => void;
  goBack: () => 'exit' | undefined;
  afterRequestCode: (phoneNumber: string) => void;
  afterSubmitCode: (status: TwoFactorStatus) => void;
  afterSubmitTwoFactor: () => void;
  setAllowStateEscalation: (allow: boolean) => void;
  afterConfirmMandate: (session: Session) => void;
  reset: () => void;
}

const initialState = {
  step: 'phone' as AuthStep,
  phonePhase: 'explain' as PhonePhase,
  pendingPhone: null as string | null,
  twoFactorStatus: null as TwoFactorStatus | null,
  scopeDraft: INITIAL_MANDATE_SCOPE,
  session: null as Session | null,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,
  continueFromExplain: () => set({ phonePhase: 'input' }),
  goBack: () => {
    const { step, phonePhase } = get();
    if (step === 'phone' && phonePhase === 'explain') {
      return 'exit';
    }
    if (step === 'phone') {
      set({ phonePhase: 'explain' });
      return undefined;
    }
    if (step === 'code') {
      set({ step: 'phone', phonePhase: 'input' });
      return undefined;
    }
    if (step === 'two_factor') {
      set({ step: 'code', twoFactorStatus: null });
      return undefined;
    }
    if (step === 'mandate') {
      set({ step: 'two_factor' });
      return undefined;
    }
    return undefined;
  },
  afterRequestCode: (phoneNumber) =>
    set({
      pendingPhone: phoneNumber,
      step: 'code',
    }),
  afterSubmitCode: (status) =>
    set({
      pendingPhone: null,
      twoFactorStatus: status,
      step: 'two_factor',
    }),
  afterSubmitTwoFactor: () => set({ step: 'mandate' }),
  setAllowStateEscalation: (allow) =>
    set((state) => ({
      scopeDraft: {
        ...state.scopeDraft,
        allowStateEscalationMention: allow,
      },
    })),
  afterConfirmMandate: (session) =>
    set({
      session,
      step: 'connected',
    }),
  reset: () => set({ ...initialState, scopeDraft: { ...INITIAL_MANDATE_SCOPE } }),
}));
