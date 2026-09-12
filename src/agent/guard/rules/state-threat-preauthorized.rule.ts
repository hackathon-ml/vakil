import { GuardRule } from "../rule.type";

/**
 * Rule 11 — state-threat only if pre-authorized: the agent can only escalate to /
 * threaten escalation to the state consumer agency if the user's mandate allows it.
 */
export const stateThreatPreauthorizedRule: GuardRule = (action, state) => {
  if (action.type !== "escalate_state") return null;

  if (!state.mandate.bounds.allowStateThreat) {
    return {
      decision: "BLOCK",
      rule: "state-threat-preauthorized",
      reason: "Mandate does not pre-authorize escalation to the state consumer agency",
    };
  }

  return null;
};
