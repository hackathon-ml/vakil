import { GuardRule } from "../rule.type";

export const REQUIRED_DOSSIER_SECTIONS = [
  "citizen",
  "counterparty",
  "order_ref",
  "narrative",
  "law_citations",
  "policy_citations",
  "evidence_list",
  "demand",
] as const;

/**
 * Rule 10 — dossier completeness: a dossier can't be marked ready unless
 * all 8 required sections are present.
 */
export const dossierCompletenessRule: GuardRule = (action) => {
  if (action.type !== "submit_dossier") return null;

  const sections = new Set(action.dossierSections ?? []);
  const missing = REQUIRED_DOSSIER_SECTIONS.filter((section) => !sections.has(section));

  if (missing.length > 0) {
    return {
      decision: "BLOCK",
      rule: "dossier-completeness",
      reason: `Dossier is missing required section(s): ${missing.join(", ")}`,
    };
  }

  return null;
};
