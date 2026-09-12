import { ProposedAction } from "../../shared/contracts/proposed-action.type";
import { CaseStatus } from "../state/case-state.type";

/**
 * Where the case goes next once a proposed action has passed the guard.
 * Single source of truth so every node routes consistently instead of each
 * hardcoding its own "next status" (which is how offer_check's accept_offer
 * bug happened — it never advanced to verify).
 */
export function statusForAction(action: ProposedAction): CaseStatus {
  switch (action.type) {
    case "accept_offer":
      return "verify";
    case "counter_offer":
    case "send_message":
      return "argue";
    case "hold":
      return "escalate_human";
    case "escalate_state":
      return "escalate_state";
    case "submit_dossier":
    case "close_case":
      return "closed";
    default:
      return "argue";
  }
}
