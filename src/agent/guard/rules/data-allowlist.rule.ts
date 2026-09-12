import { GuardRule } from "../rule.type";

/**
 * Rule 3 — data allowlist: only disclose fields the user allowed
 * (e.g. order number is fine, passport number is not, unless explicitly allowlisted).
 */
export const dataAllowlistRule: GuardRule = (action, state) => {
  if (!action.disclosedFields || action.disclosedFields.length === 0) return null;

  const disallowed = action.disclosedFields.filter(
    (field) => !state.mandate.bounds.dataAllowlist.includes(field),
  );

  if (disallowed.length > 0) {
    return {
      decision: "BLOCK",
      rule: "data-allowlist",
      reason: `Attempted to disclose non-allowlisted field(s): ${disallowed.join(", ")}`,
    };
  }

  return null;
};
