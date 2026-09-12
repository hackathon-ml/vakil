import { GuardRule } from "../rule.type";

/**
 * Rule 7 — disclosure: the very first outbound message in a case must identify
 * the sender as an agent acting on the user's behalf.
 */
export const disclosureRule: GuardRule = (action, state) => {
  if (action.type !== "send_message") return null;

  const isFirstOutbound = state.turns.every((turn) => turn.direction !== "out");
  if (isFirstOutbound && !action.discloses) {
    return {
      decision: "REWRITE",
      rule: "disclosure",
      reason: "First outbound message must disclose that this is an automated agent acting on the user's behalf",
    };
  }

  return null;
};
