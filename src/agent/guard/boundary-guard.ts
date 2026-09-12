import { ProposedAction } from "../../shared/contracts/proposed-action.type";
import { GuardVerdict, PASS } from "../../shared/contracts/guard-verdict.type";
import { CaseState } from "../state/case-state.type";
import { LegalCorpusRepository } from "../corpus/legal-corpus.repository";
import { GuardRule } from "./rule.type";
import { citationMustResolveRule } from "./rules/citation-must-resolve.rule";
import { valueBoundsRule } from "./rules/value-bounds.rule";
import { outcomeWhitelistRule } from "./rules/outcome-whitelist.rule";
import { dataAllowlistRule } from "./rules/data-allowlist.rule";
import { toneRule } from "./rules/tone.rule";
import { irreversibleActionTapRule } from "./rules/irreversible-action-tap.rule";
import { timeboxRule } from "./rules/timebox.rule";
import { disclosureRule } from "./rules/disclosure.rule";
import { languageRule } from "./rules/language.rule";
import { dossierCompletenessRule } from "./rules/dossier-completeness.rule";
import { stateThreatPreauthorizedRule } from "./rules/state-threat-preauthorized.rule";

// Order matters only in that the first rule to fire is the one reported —
// keep the hard legal/financial rules ahead of the softer tone/disclosure ones.
const SYNC_RULES: GuardRule[] = [
  valueBoundsRule,
  outcomeWhitelistRule,
  dataAllowlistRule,
  stateThreatPreauthorizedRule,
  dossierCompletenessRule,
  irreversibleActionTapRule,
  timeboxRule,
  languageRule,
  disclosureRule,
  toneRule,
];

export class BoundaryGuard {
  constructor(private readonly corpus: LegalCorpusRepository) {}

  async evaluate(action: ProposedAction, state: CaseState): Promise<GuardVerdict> {
    for (const rule of SYNC_RULES) {
      const verdict = rule(action, state);
      if (verdict) return verdict;
    }

    const citationVerdict = await citationMustResolveRule(action, state, this.corpus);
    if (citationVerdict) return citationVerdict;

    return PASS;
  }
}
