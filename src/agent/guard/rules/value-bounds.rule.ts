import { GuardRule } from "../rule.type";

/**
 * Rule 1 — value bounds: the agent can never itself accept or counter below the mandate
 * minimum. It's not an absolute block, though — the user can explicitly override it
 * (the "accept-exception" button in the escalation modal), which is why a PASS is still
 * possible via `humanApprovedException`, set only by escalate-human.node after a real tap.
 */
export const valueBoundsRule: GuardRule = (action, state) => {
  if (action.type !== "accept_offer" && action.type !== "counter_offer") return null;
  if (action.amount === undefined) return null;
  if (action.amount >= state.mandate.bounds.minValue) return null;

  if (action.humanApprovedException) return null;

  return {
    decision: "ESCALATE_TO_HUMAN",
    rule: "value-bounds",
    reason: `Offer ${action.amount} is below the mandate minimum ${state.mandate.bounds.minValue}`,
  };
};
