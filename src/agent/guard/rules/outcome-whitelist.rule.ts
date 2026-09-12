import { GuardRule } from "../rule.type";

/**
 * Rule 2 — outcome whitelist: only pursue outcomes the user pre-authorized
 * (e.g. "refund" vs "replacement" vs "repair").
 */
export const outcomeWhitelistRule: GuardRule = (action, state) => {
  if (!action.outcome) return null;

  if (!state.mandate.bounds.acceptableOutcomes.includes(action.outcome)) {
    return {
      decision: "BLOCK",
      rule: "outcome-whitelist",
      reason: `Outcome "${action.outcome}" is not in the mandate's acceptable outcomes`,
    };
  }

  return null;
};
