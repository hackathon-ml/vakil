import { GuardDecision } from "./guard-verdict.type";
import { Mandate } from "./mandate.type";

export type CaseBusEvent =
  | { type: "case.created"; caseId: string; mandate: Mandate }
  | { type: "turn.outbound"; caseId: string; text: string; guardVerdict: GuardDecision; citation?: string }
  | { type: "turn.inbound"; caseId: string; text: string }
  | { type: "guard.escalation"; caseId: string; violation: string; offer: number; options: ("accept_exception" | "hold" | "stop")[] }
  | { type: "case.resolved"; caseId: string; outcome: string; amount?: number; article?: string }
  | { type: "verification.result"; caseId: string; expected: Record<string, unknown>; observed: Record<string, unknown>; verdict: "match" | "mismatch" }
  | { type: "dossier.ready"; caseId: string; path: string };
