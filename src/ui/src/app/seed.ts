import { MOCK_SERVICES } from '../auth/mockData';
import type { ChatMessage, Service, TicketDetail } from '../types';

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function cloneServices(): Service[] {
  return MOCK_SERVICES.map((service) => ({ ...service }));
}

export function seedMessages(): ChatMessage[] {
  return [
    {
      id: 'm1',
      sender: 'agent',
      type: 'text',
      text: "I'm Vakil. Tell me the case — which shop, what went wrong, and what you want back.",
      createdAt: minutesAgo(42),
    },
    {
      id: 'm2',
      sender: 'user',
      type: 'text',
      text: 'Uzum charger arrived broken. I want a refund, at least 450,000 so‘m.',
      createdAt: minutesAgo(38),
    },
    {
      id: 'm3',
      sender: 'agent',
      type: 'text',
      text: "I'll talk to Uzum support on your behalf. I won't message anyone else or post in groups.",
      createdAt: minutesAgo(37),
    },
    {
      id: 'm4',
      sender: 'agent',
      type: 'summary',
      createdAt: minutesAgo(12),
      summary: {
        ticketId: 't-uzum-1',
        serviceId: 'uzum',
        serviceName: 'Uzum',
        outcome: 'Refund requested — waiting on Uzum',
        status: 'in_progress',
      },
    },
  ];
}

export function seedTickets(): TicketDetail[] {
  return [
    {
      id: 't-uzum-1',
      serviceId: 'uzum',
      serviceName: 'Uzum',
      title: 'Uzum – defective charger',
      status: 'in_progress',
      lastUpdatedAt: minutesAgo(12),
      feedback: null,
      chatDeepLink: 'https://t.me/UzumBank_Robot',
      messages: [
        {
          id: 'tm1',
          sender: 'user',
          type: 'text',
          text: 'Charger from Uzum arrived with a cracked base. I want a refund of at least 450,000 so‘m.',
          createdAt: minutesAgo(40),
        },
        {
          id: 'tm2',
          sender: 'agent',
          type: 'text',
          text: 'Opened the Uzum support flow. Cited the 10-day return right and your minimum.',
          createdAt: minutesAgo(36),
        },
        {
          id: 'tm3',
          sender: 'agent',
          type: 'summary',
          createdAt: minutesAgo(12),
          summary: {
            ticketId: 't-uzum-1',
            serviceId: 'uzum',
            serviceName: 'Uzum',
            outcome: 'Refund requested — waiting on Uzum',
            status: 'in_progress',
          },
        },
      ],
    },
    {
      id: 't-beeline-1',
      serviceId: 'beeline',
      serviceName: 'Beeline',
      title: 'Beeline – bill error',
      status: 'waiting_response',
      lastUpdatedAt: minutesAgo(180),
      feedback: null,
      chatDeepLink: 'https://t.me/Beeline_uz',
      messages: [
        {
          id: 'tb1',
          sender: 'user',
          type: 'text',
          text: 'Beeline charged me twice for the same month.',
          createdAt: minutesAgo(200),
        },
        {
          id: 'tb2',
          sender: 'agent',
          type: 'text',
          text: 'Escalated to a Beeline specialist. Waiting for their callback window.',
          createdAt: minutesAgo(180),
        },
      ],
    },
    {
      id: 't-ucell-1',
      serviceId: 'ucell',
      serviceName: 'Ucell',
      title: 'Ucell – lost parcel SIM',
      status: 'completed',
      lastUpdatedAt: minutesAgo(60 * 26),
      feedback: 'up',
      chatDeepLink: 'https://t.me/ucell',
      messages: [
        {
          id: 'tu1',
          sender: 'user',
          type: 'text',
          text: 'Replacement SIM never arrived.',
          createdAt: minutesAgo(60 * 30),
        },
        {
          id: 'tu2',
          sender: 'agent',
          type: 'summary',
          createdAt: minutesAgo(60 * 26),
          summary: {
            ticketId: 't-ucell-1',
            serviceId: 'ucell',
            serviceName: 'Ucell',
            outcome: 'Replacement SIM issued',
            status: 'completed',
          },
        },
      ],
    },
  ];
}
