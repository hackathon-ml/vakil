import { CaseState, CaseStatus } from "../state/case-state.type";
import { EngineDeps } from "./engine-deps.type";
import { NodeFn } from "./node.type";
import { openNode } from "./nodes/open.node";
import { argueNode } from "./nodes/argue.node";
import { offerCheckNode } from "./nodes/offer-check.node";
import { escalateHumanNode } from "./nodes/escalate-human.node";
import { escalateStateNode } from "./nodes/escalate-state.node";
import { verifyNode } from "./nodes/verify.node";
import { summarizeNode } from "./nodes/summarize.node";
import { feedbackNode } from "./nodes/feedback.node";

// The entire "graph" from the brief, as a lookup table. No framework — a status
// is just a key, a node is just an async function from CaseState to CaseState.
const NODES: Partial<Record<CaseStatus, NodeFn>> = {
  open: openNode,
  argue: argueNode,
  offer_check: offerCheckNode,
  escalate_human: escalateHumanNode,
  escalate_state: escalateStateNode,
  verify: verifyNode,
  summarize: summarizeNode,
  feedback: feedbackNode,
};

export class NegotiationEngine {
  constructor(private readonly deps: EngineDeps) {}

  /** Advance the case by exactly one node. */
  async step(state: CaseState): Promise<CaseState> {
    if (state.status === "closed") return state;

    const node = NODES[state.status];
    if (!node) throw new Error(`No node registered for status "${state.status}"`);

    return node(state, this.deps);
  }

  /**
   * Advance until the status stops changing (a node either transitions the case
   * forward or parks it waiting on external input, e.g. a Mini App tap).
   */
  async run(initial: CaseState, maxSteps = 20): Promise<CaseState> {
    let state = initial;
    for (let i = 0; i < maxSteps; i++) {
      const next = await this.step(state);
      if (next.status === state.status && i > 0) return next; // parked, waiting on input
      state = next;
      if (state.status === "closed") return state;
    }
    return state;
  }
}
