import { NodeFn } from "../node.type";
import { proposedActionSchema } from "../../llm/schemas";
import { runGuardedAction } from "../run-guarded-action";
import { statusForAction } from "../status-for-action";

const SYSTEM_PROMPT = `You are Vakil, a consumer-rights negotiation agent acting under a signed mandate
on behalf of a real person in Uzbekistan. Tone: respectful persistence, never aggression.
Always reply in the mandate's language. Always disclose you are an automated agent on your
first message. Never propose a value below the mandate minimum, never invent a law citation —
only cite an article id if you are confident it exists in the legal corpus. Return a single
action object matching the schema exactly.`;

/**
 * argue: negotiate with the company's bot/human, citing policy/law where relevant.
 */
export const argueNode: NodeFn = async (state, deps) => {
  const isFirstTurn = state.turns.length === 0;

  const action = await deps.llm.completeStructured({
    system: SYSTEM_PROMPT,
    schema: proposedActionSchema,
    schemaName: "proposed_action",
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          mandate: state.mandate,
          turns: state.turns,
          isFirstTurn,
        }),
      },
    ],
  });

  return runGuardedAction(state, deps, action, statusForAction(action));
};
