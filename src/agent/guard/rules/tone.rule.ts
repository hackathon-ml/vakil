import { GuardRule } from "../rule.type";

// Deliberately small and explicit — the tone contract is "respectful persistence, never aggression".
// This is a cheap heuristic backstop; the prompt is the primary defense.
const BANNED_PATTERNS = [
  /\bidiot\b/i,
  /\bstupid\b/i,
  /\bсука\b/i,
  /\bдурак\b/i,
  /\bahmoq\b/i,
  /!!!+/,
];

/**
 * Rule 4 — tone: outbound text must stay within the agreed register.
 */
export const toneRule: GuardRule = (action) => {
  if (action.type !== "send_message" && action.type !== "counter_offer") return null;

  const hit = BANNED_PATTERNS.find((pattern) => pattern.test(action.text));
  if (hit) {
    return {
      decision: "REWRITE",
      rule: "tone",
      reason: `Outbound text matched a banned tone pattern (${hit})`,
    };
  }

  return null;
};
