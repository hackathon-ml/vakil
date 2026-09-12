import { GuardRule } from "../rule.type";
import { hoursSinceCreated } from "../../state/case-state.type";

/**
 * Rule 6 — timebox: the agent must not keep negotiating past the mandate's deadline.
 */
export const timeboxRule: GuardRule = (action, state) => {
  if (action.type === "escalate_human" || action.type === "escalate_state" || action.type === "hold") {
    return null; // escalating or holding is always fine, even past the deadline
  }

  const elapsed = hoursSinceCreated(state);
  if (elapsed > state.mandate.bounds.maxWaitHours) {
    return {
      decision: "ESCALATE_TO_HUMAN",
      rule: "timebox",
      reason: `Case has run ${elapsed.toFixed(1)}h, past the mandate's ${state.mandate.bounds.maxWaitHours}h limit`,
    };
  }

  return null;
};
