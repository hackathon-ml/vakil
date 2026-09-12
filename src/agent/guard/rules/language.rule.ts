import { GuardRule } from "../rule.type";

/**
 * Rule 8 — language: replies must stay in the mandate's language (UZ/RU/EN).
 */
export const languageRule: GuardRule = (action, state) => {
  if (action.language !== state.mandate.language) {
    return {
      decision: "REWRITE",
      rule: "language",
      reason: `Action language "${action.language}" does not match mandate language "${state.mandate.language}"`,
    };
  }

  return null;
};
