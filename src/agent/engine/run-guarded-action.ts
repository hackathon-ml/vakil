import { CaseState, CaseStatus } from "../state/case-state.type";
import { EngineDeps } from "./engine-deps.type";
import { ProposedAction } from "../../shared/contracts/proposed-action.type";

/**
 * The one chokepoint every node routes through: LLM proposal -> BoundaryGuard -> Telegram.
 * This is what makes the guard's refusal provable in code rather than asserted in a script.
 */
export async function runGuardedAction(
  state: CaseState,
  deps: EngineDeps,
  action: ProposedAction,
  nextStatusIfPassed: CaseStatus,
): Promise<CaseState> {
  const verdict = await deps.guard.evaluate(action, state);

  if (verdict.decision === "PASS") {
    await deps.gateway.sendMessage(state.chatId, action.text);
    deps.bus.emit({
      type: "turn.outbound",
      caseId: state.id,
      text: action.text,
      guardVerdict: verdict.decision,
      citation: action.citationId,
    });
    return {
      ...state,
      status: nextStatusIfPassed,
      turns: [...state.turns, { direction: "out", text: action.text, at: new Date().toISOString() }],
      currentOffer: action.amount ?? state.currentOffer,
    };
  }

  if (verdict.decision === "ESCALATE_TO_HUMAN") {
    deps.bus.emit({
      type: "guard.escalation",
      caseId: state.id,
      violation: verdict.reason,
      offer: action.amount ?? state.currentOffer ?? 0,
      options: ["accept_exception", "hold", "stop"],
    });
    return { ...state, status: "escalate_human" };
  }

  // BLOCK or REWRITE: never leaves the device. Logged on the bus, case stays put.
  deps.bus.emit({
    type: "turn.outbound",
    caseId: state.id,
    text: `[blocked: ${verdict.rule}] ${verdict.reason}`,
    guardVerdict: verdict.decision,
  });
  return state;
}
