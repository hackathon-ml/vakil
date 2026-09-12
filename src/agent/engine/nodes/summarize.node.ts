import { NodeFn } from "../node.type";

/**
 * summarize: verified close — emit the resolution and move to the feedback node.
 */
export const summarizeNode: NodeFn = async (state, deps) => {
  deps.bus.emit({
    type: "case.resolved",
    caseId: state.id,
    outcome: state.mandate.bounds.acceptableOutcomes[0] ?? "resolved",
    amount: state.currentOffer,
  });

  return { ...state, status: "feedback", resolvedOutcome: "verified_close" };
};
