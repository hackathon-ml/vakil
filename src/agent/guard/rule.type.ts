import { ProposedAction } from "../../shared/contracts/proposed-action.type";
import { GuardVerdict } from "../../shared/contracts/guard-verdict.type";
import { CaseState } from "../state/case-state.type";

/**
 * A rule looks at the proposed action in the context of the case and either stays
 * silent (returns null — no opinion) or fires a verdict. The first rule to fire wins;
 * BoundaryGuard evaluates rules in order and short-circuits on the first non-null result.
 */
export type GuardRule = (action: ProposedAction, state: CaseState) => GuardVerdict | null;

const IRREVERSIBLE_ACTIONS = new Set(["accept_offer", "escalate_state", "close_case", "submit_dossier"]);

export function isIrreversible(actionType: ProposedAction["type"]): boolean {
  return IRREVERSIBLE_ACTIONS.has(actionType);
}
