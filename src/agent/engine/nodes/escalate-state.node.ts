import { NodeFn } from "../node.type";
import { proposedActionSchema } from "../../llm/schemas";
import { runGuardedAction } from "../run-guarded-action";
import { statusForAction } from "../status-for-action";
import { REQUIRED_DOSSIER_SECTIONS } from "../../guard/rules/dossier-completeness.rule";

const SYSTEM_PROMPT = `You are Vakil, building a complaint dossier for the state consumer protection
agency (@consumergovuz_bot / 1159) because the company would not resolve the case. Produce a
submit_dossier action with requiresHumanTap: true and dossierSections listing every one of the
required sections you were able to fill: ${REQUIRED_DOSSIER_SECTIONS.join(", ")}. Cite only real
law/policy article ids. Reply only in the mandate's language.`;

/**
 * escalate_state: only reachable if guard rule 11 already passed (state threat pre-authorized).
 */
export const escalateStateNode: NodeFn = async (state, deps) => {
  const action = await deps.llm.completeStructured({
    system: SYSTEM_PROMPT,
    schema: proposedActionSchema,
    schemaName: "proposed_action",
    messages: [{ role: "user", content: JSON.stringify({ mandate: state.mandate, turns: state.turns }) }],
  });

  const result = await runGuardedAction(state, deps, action, statusForAction(action));

  // Only reached "closed" via submit_dossier if the guard actually passed it
  // (dossier-completeness rule already checked dossierSections) — build the real file.
  if (action.type === "submit_dossier" && result.status === "closed") {
    const path = await deps.dossier.buildAndSave(state.id, action.dossierContent ?? {});
    deps.bus.emit({ type: "dossier.ready", caseId: state.id, path });
  }

  return result;
};
