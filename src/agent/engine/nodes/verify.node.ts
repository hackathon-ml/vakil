import { NodeFn } from "../node.type";
import { verificationResultSchema } from "../../llm/schemas";

const SYSTEM_PROMPT = `Read the wallet screenshot and extract the transfer details as JSON:
{ amount: number|null, date: string|null, channel: string|null }. If a field isn't visible, use null.`;

/**
 * verify: user uploaded a wallet screenshot (state.pendingScreenshot). Extract structured
 * data via vision and compare against the accepted offer. No-ops until a screenshot arrives.
 */
export const verifyNode: NodeFn = async (state, deps) => {
  if (!state.pendingScreenshot) {
    return state; // waiting on the screenshot upload
  }

  const observed = await deps.llm.completeVision({
    system: SYSTEM_PROMPT,
    prompt: "Extract the transfer details from this screenshot.",
    imageBase64: state.pendingScreenshot.base64,
    mediaType: state.pendingScreenshot.mediaType,
    schema: verificationResultSchema,
    schemaName: "verification_result",
  });

  const expected = { amount: state.currentOffer ?? null };
  const verdict = observed.amount === expected.amount ? "match" : "mismatch";

  deps.bus.emit({
    type: "verification.result",
    caseId: state.id,
    expected,
    observed,
    verdict,
  });

  return {
    ...state,
    pendingScreenshot: undefined,
    status: verdict === "match" ? "summarize" : "verify",
  };
};
