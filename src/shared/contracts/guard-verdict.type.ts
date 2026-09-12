export type GuardDecision = "PASS" | "REWRITE" | "ESCALATE_TO_HUMAN" | "BLOCK";

export interface GuardVerdict {
  decision: GuardDecision;
  rule: string;
  reason: string;
}

export const PASS: GuardVerdict = { decision: "PASS", rule: "none", reason: "no violation" };
