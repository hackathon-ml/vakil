import { cloneServices, seedMessages, seedTickets } from './seed';
import type {
  ChatMessage,
  CreateServiceInput,
  SendMessageRequest,
  SendMessageResponse,
  Service,
  SetFeedbackRequest,
  Ticket,
  TicketDetail,
  UpdateServiceInput,
} from '../types';

const DELAY_MS = 500;

let services = cloneServices();
let messages = seedMessages();
let tickets = seedTickets();
let idCounter = 100;

function delay(ms = DELAY_MS) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function listServices(): Promise<Service[]> {
  await delay(200);
  return services.map((service) => ({ ...service }));
}

export async function createService(input: CreateServiceInput): Promise<Service> {
  await delay();
  const username = input.username.startsWith('@') ? input.username : `@${input.username}`;
  if (!input.name.trim()) {
    throw new Error('Enter a service name.');
  }
  if (username.length < 3) {
    throw new Error('Enter a Telegram username.');
  }
  const service: Service = {
    id: nextId('svc'),
    name: input.name.trim(),
    username,
    notes: input.notes?.trim() || undefined,
    isCustom: true,
    connectionStatus: 'not_linked',
  };
  services = [...services, service];
  return { ...service };
}

export async function updateService(input: UpdateServiceInput): Promise<Service> {
  await delay();
  const current = services.find((service) => service.id === input.id);
  if (!current) throw new Error('Service not found.');
  const next: Service = {
    ...current,
    name: input.name?.trim() || current.name,
    username: input.username
      ? input.username.startsWith('@')
        ? input.username
        : `@${input.username}`
      : current.username,
    notes: input.notes === undefined ? current.notes : input.notes.trim() || undefined,
  };
  services = services.map((service) => (service.id === next.id ? next : service));
  return { ...next };
}

export async function listMessages(): Promise<ChatMessage[]> {
  await delay(200);
  return messages.map((message) => ({ ...message, summary: message.summary ? { ...message.summary } : undefined }));
}

export async function listTickets(): Promise<Ticket[]> {
  await delay(200);
  return tickets.map(toTicket);
}

export async function getTicket(ticketId: string): Promise<TicketDetail> {
  await delay(250);
  const ticket = tickets.find((item) => item.id === ticketId);
  if (!ticket) throw new Error('Ticket not found.');
  return cloneTicket(ticket);
}

export async function setTicketFeedback(input: SetFeedbackRequest): Promise<Ticket> {
  await delay(400);
  const ticket = tickets.find((item) => item.id === input.ticketId);
  if (!ticket) throw new Error('Ticket not found.');
  ticket.feedback = input.feedback;
  ticket.lastUpdatedAt = new Date().toISOString();
  return toTicket(ticket);
}

export async function sendMessage(input: SendMessageRequest): Promise<SendMessageResponse> {
  await delay();
  const text = input.text.trim();
  if (!text) throw new Error('Write a message first.');

  const userMessage: ChatMessage = {
    id: nextId('m'),
    sender: 'user',
    type: 'text',
    text,
    createdAt: new Date().toISOString(),
  };
  messages = [...messages, userMessage];

  const reply = buildAgentReply(text, input.serviceId);
  messages = [...messages, reply];

  if (reply.summary) {
    attachSummaryToTicket(reply);
  }

  return { message: { ...reply, summary: reply.summary ? { ...reply.summary } : undefined } };
}

function toTicket(ticket: TicketDetail): Ticket {
  return {
    id: ticket.id,
    serviceId: ticket.serviceId,
    serviceName: ticket.serviceName,
    title: ticket.title,
    status: ticket.status,
    lastUpdatedAt: ticket.lastUpdatedAt,
    feedback: ticket.feedback,
    chatDeepLink: ticket.chatDeepLink,
  };
}

function cloneTicket(ticket: TicketDetail): TicketDetail {
  return {
    ...ticket,
    messages: ticket.messages.map((message) => ({
      ...message,
      summary: message.summary ? { ...message.summary } : undefined,
    })),
  };
}

function attachSummaryToTicket(reply: ChatMessage) {
  const summary = reply.summary;
  if (!summary) return;
  const ticket = tickets.find((item) => item.id === summary.ticketId);
  if (!ticket) return;
  ticket.status = summary.status;
  ticket.lastUpdatedAt = reply.createdAt;
  ticket.messages = [...ticket.messages, { ...reply, summary: { ...summary } }];
}

function buildAgentReply(text: string, serviceId?: string): ChatMessage {
  const lower = text.toLowerCase();
  const now = new Date().toISOString();

  if (/charger|uzum|refund|450/.test(lower) || serviceId === 'uzum') {
    return {
      id: nextId('m'),
      sender: 'agent',
      type: 'summary',
      createdAt: now,
      summary: {
        ticketId: 't-uzum-1',
        serviceId: 'uzum',
        serviceName: 'Uzum',
        outcome: 'Still on Uzum — holding for your 450k minimum',
        status: 'in_progress',
      },
    };
  }

  if (/beeline|bill|charged twice/.test(lower) || serviceId === 'beeline') {
    return {
      id: nextId('m'),
      sender: 'agent',
      type: 'text',
      text: 'Beeline still has not called back. I can wait, or we can escalate once they reply.',
      createdAt: now,
    };
  }

  if (/1159|agency|consumer|state/.test(lower) || serviceId === 'consumergov') {
    return {
      id: nextId('m'),
      sender: 'agent',
      type: 'text',
      text: 'I will only mention the Consumer Protection Agency if you switched that on in the mandate. I can prepare a dossier either way.',
      createdAt: now,
    };
  }

  return {
    id: nextId('m'),
    sender: 'agent',
    type: 'text',
    text: 'Got it. Which service is this for — Uzum, Beeline, Ucell, or someone else on your bots list?',
    createdAt: now,
  };
}
