import { ProposedAction } from "../../../shared/contracts/proposed-action.type";
import { GuardVerdict } from "../../../shared/contracts/guard-verdict.type";
import { CaseState } from "../../state/case-state.type";
import { LegalCorpusRepository } from "../../corpus/legal-corpus.repository";

/**
 * Rule 9 — citation must resolve to corpus: any law/policy citation the LLM produces
 * must be a real entry in the legal corpus. No hallucinated citations ever go out.
 * Async (needs a corpus lookup), so it's evaluated separately from the sync rule set.
 */
export async function citationMustResolveRule(
  action: ProposedAction,
  _state: CaseState,
  corpus: LegalCorpusRepository,
): Promise<GuardVerdict | null> {
  if (!action.citationId) return null;

  const entry = await corpus.findById(action.citationId);
  if (!entry) {
    return {
      decision: "BLOCK",
      rule: "citation-must-resolve",
      reason: `Citation "${action.citationId}" does not resolve to any entry in the legal corpus`,
    };
  }

  return null;
}
