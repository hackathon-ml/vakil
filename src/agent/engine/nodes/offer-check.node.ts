import { NodeFn } from "../node.type";
import { proposedActionSchema } from "../../llm/schemas";
import { runGuardedAction } from "../run-guarded-action";
import { statusForAction } from "../status-for-action";

const SYSTEM_PROMPT = `You are Vakil, evaluating an offer from the counterparty against the user's mandate.
If the offer meets or exceeds the mandate minimum and outcome whitelist, propose accept_offer
(requiresHumanTap: true). If it's below minimum, propose counter_offer at the mandate minimum,
citing the mandate's minimum and, if useful, a real law/policy citation id. Always reply in the
mandate's language. Return a single action object matching the schema exactly.`;

/**
 * offer_check: the counterparty made an offer; decide accept / counter / walk.
 */
export const offerCheckNode: NodeFn = async (state, deps) => {
  const action = await deps.llm.completeStructured({
    system: SYSTEM_PROMPT,
    schema: proposedActionSchema,
    schemaName: "proposed_action",
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          mandate: state.mandate,
          currentOffer: state.currentOffer,
          turns: state.turns,
        }),
      },
    ],
  });

  return runGuardedAction(state, deps, action, statusForAction(action));
};
