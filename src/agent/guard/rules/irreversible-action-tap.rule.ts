import { GuardRule, isIrreversible } from "../rule.type";

/**
 * Rule 5 — irreversible-action tap: anything irreversible (accepting an offer, escalating
 * to the state agency, closing the case, submitting a dossier) must wait for a human tap.
 */
export const irreversibleActionTapRule: GuardRule = (action) => {
  if (!isIrreversible(action.type)) return null;

  if (!action.requiresHumanTap) {
    return {
      decision: "ESCALATE_TO_HUMAN",
      rule: "irreversible-action-tap",
      reason: `Action "${action.type}" is irreversible and must be confirmed by the user`,
    };
  }

  return null;
};
