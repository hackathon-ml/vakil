import type { MandateScope, Service } from '../types';

export const MOCK_SERVICES: Service[] = [
  {
    id: 'uzum',
    name: 'Uzum',
    username: '@UzumBank_Robot',
    isCustom: false,
    connectionStatus: 'connected',
  },
  {
    id: 'beeline',
    name: 'Beeline',
    username: '@Beeline_uz',
    isCustom: false,
    connectionStatus: 'connected',
  },
  {
    id: 'ucell',
    name: 'Ucell',
    username: '@ucell',
    isCustom: false,
    connectionStatus: 'not_linked',
  },
  {
    id: 'consumergov',
    name: 'Consumer Protection',
    username: '@consumergovuz_bot',
    isCustom: false,
    connectionStatus: 'needs_2fa',
  },
];

export const INITIAL_MANDATE_SCOPE: MandateScope = {
  allowedServiceIds: MOCK_SERVICES.map((service) => service.id),
  allowStateEscalationMention: false,
};

export const NEVER_DO = [
  {
    id: 'payments',
    title: 'Make payments',
    subtitle: 'Vakil never moves money or confirms checkouts.',
  },
  {
    id: 'contacts',
    title: 'Message personal contacts',
    subtitle: 'Friends, family, and private chats stay untouched.',
  },
  {
    id: 'groups',
    title: 'Post to groups',
    subtitle: 'No messages in groups, channels, or public chats.',
  },
] as const;

export const MOCK_CORRECT_CODE = '123456';
export const MOCK_CORRECT_PASSWORD = 'cloud-password';
