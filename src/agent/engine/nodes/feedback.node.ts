import { NodeFn } from "../node.type";

/**
 * feedback: waits for a 👍/👎 tap (state.pendingFeedback) from the Mini App, then closes.
 * Writing the typed preference row is memory/preference.service.ts's job, called by
 * whatever handler sets pendingFeedback — this node just finalizes the case state.
 */
export const feedbackNode: NodeFn = async (state) => {
  if (!state.pendingFeedback) {
    return state; // still waiting on the tap
  }

  return { ...state, status: "closed", pendingFeedback: undefined };
};
