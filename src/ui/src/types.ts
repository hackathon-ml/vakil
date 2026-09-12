// ============================================================
// Vakil — shared frontend/backend contract
// Chat is request/response (no streaming).
// ============================================================

// ---------- Shared enums ----------

export type TicketStatus = 'in_progress' | 'waiting_response' | 'completed';

export type MessageSender = 'user' | 'agent';

export type MessageType = 'text' | 'summary';

export type FeedbackValue = 'up' | 'down' | null;

export type ServiceConnectionStatus = 'connected' | 'not_linked' | 'needs_2fa';

// ---------- Services (official bots + user-added) ----------

export interface Service {
  id: string;
  name: string;
  username: string; // telegram handle, e.g. "@UzumBank_Robot"
  logoUrl?: string;
  isCustom: boolean; // false = curated/mapped official service, true = user-added
  connectionStatus: ServiceConnectionStatus;
  notes?: string; // user-added note, custom services only
}

export interface CreateServiceInput {
  name: string;
  username: string;
  notes?: string;
}

export type UpdateServiceInput = Partial<CreateServiceInput> & { id: string };

// ---------- Chat ----------

export interface SummaryCardData {
  ticketId: string;
  serviceId: string;
  serviceName: string;
  outcome: string; // short human-readable outcome, e.g. "Refund approved"
  status: TicketStatus;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  type: MessageType;
  text?: string; // present when type === 'text'
  summary?: SummaryCardData; // present when type === 'summary'
  createdAt: string; // ISO timestamp
}

export interface SendMessageRequest {
  serviceId?: string; // which service/support this command targets, if any
  text: string;
}

export interface SendMessageResponse {
  message: ChatMessage; // the agent's single reply (text or summary)
}

// ---------- Tickets ----------

export interface Ticket {
  id: string;
  serviceId: string;
  serviceName: string;
  title: string; // e.g. "Uzum – defective charger"
  status: TicketStatus;
  lastUpdatedAt: string; // ISO timestamp
  feedback: FeedbackValue;
  chatDeepLink?: string; // t.me/... link to the real conversation in Telegram
}

export interface TicketDetail extends Ticket {
  messages: ChatMessage[]; // full timeline for this case
}

export interface SetFeedbackRequest {
  ticketId: string;
  feedback: FeedbackValue;
}

// ---------- Auth / Mandate ----------

export type AuthStep = 'phone' | 'code' | 'two_factor' | 'mandate' | 'connected';

export interface RequestCodeInput {
  phoneNumber: string;
}

export interface SubmitCodeInput {
  phoneNumber: string;
  code: string;
}

export interface TwoFactorStatus {
  hasPassword: boolean; // true = existing cloud password, ask for it; false = must enable
}

export interface SubmitTwoFactorInput {
  password: string; // existing password, or the new one set during the enable-wizard
}

export interface MandateScope {
  allowedServiceIds: string[];
  allowStateEscalationMention: boolean; // only true if user explicitly pre-checked this
}

export interface Session {
  connectedAt: string; // ISO timestamp
  deviceName: string;
  scope: MandateScope;
}

export interface RevokeSessionResponse {
  revoked: true;
}
