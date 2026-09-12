import { create } from 'zustand';
import type {
  MandateScope,
  RequestCodeInput,
  Session,
  SubmitCodeInput,
  SubmitTwoFactorInput,
  TwoFactorStatus,
} from '../types';
import { MOCK_CORRECT_CODE, MOCK_CORRECT_PASSWORD } from './mockData';

export class MockApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MockApiError';
  }
}

export interface MockFlags {
  failRequestCode: boolean;
  failSubmitCode: boolean;
  failSubmitTwoFactor: boolean;
  failConfirmMandate: boolean;
  hasPassword: boolean;
}

interface MockFlagStore extends MockFlags {
  setFlag: (key: keyof MockFlags, value: boolean) => void;
}

export const useMockFlags = create<MockFlagStore>((set) => ({
  failRequestCode: false,
  failSubmitCode: false,
  failSubmitTwoFactor: false,
  failConfirmMandate: false,
  hasPassword: true,
  setFlag: (key, value) => set({ [key]: value }),
}));

const DELAY_MS = 600;

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function isE164(phoneNumber: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phoneNumber);
}

export function formatPhoneInput(raw: string): string {
  const stripped = raw.replace(/[^\d+]/g, '');
  const digits = stripped.replace(/\+/g, '');
  return digits.length === 0 ? '+' : `+${digits.slice(0, 15)}`;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function deviceNameFromUserAgent(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iPhone';
  if (/Android/i.test(ua)) return 'Android';
  if (/Mac/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows';
  return 'Telegram Mini App';
}

export async function requestCode(input: RequestCodeInput): Promise<void> {
  await delay();
  const flags = useMockFlags.getState();
  if (flags.failRequestCode) {
    throw new MockApiError('Could not send the code. Try again.');
  }
  if (!isE164(input.phoneNumber)) {
    throw new MockApiError('Enter a valid phone number in international format.');
  }
}

export async function submitCode(input: SubmitCodeInput): Promise<TwoFactorStatus> {
  await delay();
  const flags = useMockFlags.getState();
  if (flags.failSubmitCode || input.code !== MOCK_CORRECT_CODE) {
    throw new MockApiError('That code is incorrect.');
  }
  return { hasPassword: flags.hasPassword };
}

export async function submitTwoFactor(input: SubmitTwoFactorInput): Promise<void> {
  await delay();
  const flags = useMockFlags.getState();
  if (flags.failSubmitTwoFactor) {
    throw new MockApiError(
      flags.hasPassword
        ? 'That password is incorrect.'
        : 'Could not enable two-factor authentication.',
    );
  }
  if (flags.hasPassword && input.password !== MOCK_CORRECT_PASSWORD) {
    throw new MockApiError('That password is incorrect.');
  }
  if (!flags.hasPassword && input.password.length < 8) {
    throw new MockApiError('Use at least 8 characters.');
  }
}

export async function confirmMandate(scope: MandateScope): Promise<Session> {
  await delay();
  const flags = useMockFlags.getState();
  if (flags.failConfirmMandate) {
    throw new MockApiError('Could not confirm the mandate. Try again.');
  }
  return {
    connectedAt: new Date().toISOString(),
    deviceName: deviceNameFromUserAgent(),
    scope,
  };
}
