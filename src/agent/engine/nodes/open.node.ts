import { NodeFn } from "../node.type";
import { proposedActionSchema } from "../../llm/schemas";
import { runGuardedAction } from "../run-guarded-action";

const SYSTEM_PROMPT = `You are Vakil, opening a consumer case on behalf of a real person, acting under a
signed mandate. This is the very first message: set discloses=true and clearly state you are an
automated agent acting on the user's behalf, then state the objective plainly. Reply only in the
mandate's language. Return a single action object (type: send_message) matching the schema exactly.`;

/**
 * open: first outbound message to the counterparty, must disclose (guard rule 7).
 */
export const openNode: NodeFn = async (state, deps) => {
  const action = await deps.llm.completeStructured({
    system: SYSTEM_PROMPT,
    schema: proposedActionSchema,
    schemaName: "proposed_action",
    messages: [{ role: "user", content: JSON.stringify({ mandate: state.mandate }) }],
  });

  const bus = deps.bus;
  bus.emit({ type: "case.created", caseId: state.id, mandate: state.mandate });

  return runGuardedAction(state, deps, action, "argue");
};
