import { NodeFn } from "../node.type";
import { proposedActionSchema } from "../../llm/schemas";
import { runGuardedAction } from "../run-guarded-action";
import { statusForAction } from "../status-for-action";

const SYSTEM_PROMPT = `You are Vakil. The user has reviewed a guard escalation and made a decision.
"accept_exception": propose accept_offer at the current offer (requiresHumanTap: true). The user
has already explicitly confirmed they want to accept below their own minimum — do not argue
against it, just draft the acceptance message.
"hold": propose a counter_offer restating the mandate minimum, with a law/policy citation id if
one applies.
Reply only in the mandate's language.`;

/**
 * escalate_human: waits for a Mini App tap (state.pendingDecision). No-ops until it arrives.
 * "stop" is handled locally (no LLM call needed). "accept_exception" and "hold" both draft a
 * message via the LLM, then route through the same guard chokepoint as everything else —
 * humanApprovedException is stamped here, by code, never by the model.
 */
export const escalateHumanNode: NodeFn = async (state, deps) => {
  if (!state.pendingDecision) {
    return state; // still waiting on the user; nothing to do yet
  }

  if (state.pendingDecision === "stop") {
    deps.bus.emit({ type: "case.resolved", caseId: state.id, outcome: "walked_away" });
    return { ...state, status: "closed", resolvedOutcome: "walked_away", pendingDecision: undefined };
  }

  const action = await deps.llm.completeStructured({
    system: SYSTEM_PROMPT,
    schema: proposedActionSchema,
    schemaName: "proposed_action",
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          mandate: state.mandate,
          decision: state.pendingDecision,
          currentOffer: state.currentOffer,
          turns: state.turns,
        }),
      },
    ],
  });

  if (state.pendingDecision === "accept_exception") {
    action.humanApprovedException = true;
  }

  return runGuardedAction({ ...state, pendingDecision: undefined }, deps, action, statusForAction(action));
};
