import { Mandate } from "../../shared/contracts/mandate.type";

export type CaseStatus =
  | "open"
  | "argue"
  | "escalate_human"
  | "escalate_state"
  | "offer_check"
  | "verify"
  | "summarize"
  | "feedback"
  | "closed";

export interface CaseTurn {
  direction: "in" | "out";
  text: string;
  at: string;
}

export type EscalationDecision = "accept_exception" | "hold" | "stop";

export interface PendingScreenshot {
  base64: string;
  mediaType: "image/png" | "image/jpeg";
}

export interface CaseState {
  id: string;
  mandate: Mandate;
  chatId: string;
  status: CaseStatus;
  turns: CaseTurn[];
  currentOffer?: number;
  createdAt: string;
  resolvedOutcome?: string;
  // Set from outside the engine (Mini App tap / screenshot upload) and consumed by
  // escalate_human / verify nodes, then cleared.
  pendingDecision?: EscalationDecision;
  pendingScreenshot?: PendingScreenshot;
  pendingFeedback?: "up" | "down";
}

export function newCase(mandate: Mandate, chatId: string): CaseState {
  return {
    id: `case-${mandate.id}`,
    mandate,
    chatId,
    status: "open",
    turns: [],
    createdAt: new Date().toISOString(),
  };
}

export function hoursSinceCreated(state: CaseState, now: Date = new Date()): number {
  return (now.getTime() - new Date(state.createdAt).getTime()) / (1000 * 60 * 60);
}
