import { describe, expect, it } from "vitest";
import { BoundaryGuard } from "./boundary-guard";
import { InMemoryLegalCorpusRepository } from "../corpus/in-memory-legal-corpus.repository";
import { CaseState, newCase } from "../state/case-state.type";
import { Mandate } from "../../shared/contracts/mandate.type";
import { ProposedAction } from "../../shared/contracts/proposed-action.type";

function makeMandate(overrides: Partial<Mandate> = {}): Mandate {
  return {
    id: "M-0001",
    userId: "user-1",
    language: "uz",
    objective: "Refund for defective phone",
    counterpart: "Uzum",
    bounds: {
      minValue: 450_000,
      acceptableOutcomes: ["refund"],
      maxWaitHours: 48,
      nonNegotiables: [],
      allowStateThreat: false,
      dataAllowlist: ["order_number"],
    },
    evidence: [],
    learnedSeeds: [],
    ...overrides,
  };
}

function makeAction(overrides: Partial<ProposedAction> = {}): ProposedAction {
  return {
    type: "send_message",
    text: "Salom, mahsulotni qaytarishni so'rayman.",
    language: "uz",
    requiresHumanTap: false,
    ...overrides,
  };
}

function makeState(mandate = makeMandate(), overrides: Partial<CaseState> = {}): CaseState {
  return { ...newCase(mandate, "uzum-support"), turns: [{ direction: "out", text: "prior turn", at: new Date().toISOString() }], ...overrides };
}

describe("BoundaryGuard", () => {
  const guard = new BoundaryGuard(new InMemoryLegalCorpusRepository());

  it("rule 1 — escalates an offer below the mandate minimum", async () => {
    const verdict = await guard.evaluate(
      makeAction({ type: "counter_offer", amount: 300_000 }),
      makeState(),
    );
    expect(verdict).toEqual({ decision: "ESCALATE_TO_HUMAN", rule: "value-bounds", reason: expect.any(String) });
  });

  it("rule 1 — passes an offer at or above the minimum", async () => {
    const verdict = await guard.evaluate(
      makeAction({ type: "counter_offer", amount: 450_000, requiresHumanTap: true }),
      makeState(),
    );
    expect(verdict.decision).toBe("PASS");
  });

  it("rule 1 — a below-minimum accept still requires a human tap even with the exception flag", async () => {
    const verdict = await guard.evaluate(
      makeAction({ type: "accept_offer", amount: 300_000, humanApprovedException: true, requiresHumanTap: false }),
      makeState(),
    );
    expect(verdict).toMatchObject({ decision: "ESCALATE_TO_HUMAN", rule: "irreversible-action-tap" });
  });

  it("rule 1 — passes a below-minimum accept once explicitly human-approved and tapped", async () => {
    const verdict = await guard.evaluate(
      makeAction({ type: "accept_offer", amount: 300_000, humanApprovedException: true, requiresHumanTap: true }),
      makeState(),
    );
    expect(verdict.decision).toBe("PASS");
  });

  it("rule 2 — blocks an outcome not in the whitelist", async () => {
    const verdict = await guard.evaluate(
      makeAction({ outcome: "store_credit" }),
      makeState(),
    );
    expect(verdict).toMatchObject({ decision: "BLOCK", rule: "outcome-whitelist" });
  });

  it("rule 3 — blocks disclosure of a non-allowlisted field", async () => {
    const verdict = await guard.evaluate(
      makeAction({ disclosedFields: ["passport_number"] }),
      makeState(),
    );
    expect(verdict).toMatchObject({ decision: "BLOCK", rule: "data-allowlist" });
  });

  it("rule 4 — rewrites text that fails the tone check", async () => {
    const verdict = await guard.evaluate(
      makeAction({ text: "You are stupid!!!" }),
      makeState(),
    );
    expect(verdict).toMatchObject({ decision: "REWRITE", rule: "tone" });
  });

  it("rule 5 — escalates an irreversible action without a human tap", async () => {
    const verdict = await guard.evaluate(
      makeAction({ type: "accept_offer", amount: 450_000, requiresHumanTap: false }),
      makeState(),
    );
    expect(verdict).toMatchObject({ decision: "ESCALATE_TO_HUMAN", rule: "irreversible-action-tap" });
  });

  it("rule 5 — passes an irreversible action with a human tap", async () => {
    const verdict = await guard.evaluate(
      makeAction({ type: "accept_offer", amount: 450_000, requiresHumanTap: true }),
      makeState(),
    );
    expect(verdict.decision).toBe("PASS");
  });

  it("rule 6 — escalates once the case exceeds the mandate's timebox", async () => {
    const mandate = makeMandate({ bounds: { ...makeMandate().bounds, maxWaitHours: 1 } });
    const staleState = makeState(mandate, { createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() });
    const verdict = await guard.evaluate(makeAction(), staleState);
    expect(verdict).toMatchObject({ decision: "ESCALATE_TO_HUMAN", rule: "timebox" });
  });

  it("rule 7 — rewrites the first outbound message if it doesn't disclose", async () => {
    const freshState = makeState(makeMandate(), { turns: [] });
    const verdict = await guard.evaluate(makeAction({ discloses: false }), freshState);
    expect(verdict).toMatchObject({ decision: "REWRITE", rule: "disclosure" });
  });

  it("rule 7 — passes the first outbound message if it discloses", async () => {
    const freshState = makeState(makeMandate(), { turns: [] });
    const verdict = await guard.evaluate(makeAction({ discloses: true }), freshState);
    expect(verdict.decision).toBe("PASS");
  });

  it("rule 8 — rewrites text in the wrong language", async () => {
    const verdict = await guard.evaluate(makeAction({ language: "ru" }), makeState());
    expect(verdict).toMatchObject({ decision: "REWRITE", rule: "language" });
  });

  it("rule 9 — blocks a citation that isn't in the legal corpus", async () => {
    const verdict = await guard.evaluate(makeAction({ citationId: "made-up-article" }), makeState());
    expect(verdict).toMatchObject({ decision: "BLOCK", rule: "citation-must-resolve" });
  });

  it("rule 9 — passes a citation that is in the legal corpus", async () => {
    const verdict = await guard.evaluate(makeAction({ citationId: "art-18" }), makeState());
    expect(verdict.decision).toBe("PASS");
  });

  it("rule 10 — blocks an incomplete dossier", async () => {
    const verdict = await guard.evaluate(
      makeAction({ type: "submit_dossier", requiresHumanTap: true, dossierSections: ["citizen", "narrative"] }),
      makeState(),
    );
    expect(verdict).toMatchObject({ decision: "BLOCK", rule: "dossier-completeness" });
  });

  it("rule 10 — passes a complete dossier", async () => {
    const verdict = await guard.evaluate(
      makeAction({
        type: "submit_dossier",
        requiresHumanTap: true,
        dossierSections: [
          "citizen", "counterparty", "order_ref", "narrative",
          "law_citations", "policy_citations", "evidence_list", "demand",
        ],
      }),
      makeState(),
    );
    expect(verdict.decision).toBe("PASS");
  });

  it("rule 11 — blocks state escalation when not pre-authorized", async () => {
    const verdict = await guard.evaluate(
      makeAction({ type: "escalate_state", requiresHumanTap: true }),
      makeState(),
    );
    expect(verdict).toMatchObject({ decision: "BLOCK", rule: "state-threat-preauthorized" });
  });

  it("rule 11 — passes state escalation when pre-authorized", async () => {
    const mandate = makeMandate({ bounds: { ...makeMandate().bounds, allowStateThreat: true } });
    const verdict = await guard.evaluate(
      makeAction({ type: "escalate_state", requiresHumanTap: true }),
      makeState(mandate),
    );
    expect(verdict.decision).toBe("PASS");
  });

  it("a clean send_message passes with no violations", async () => {
    const verdict = await guard.evaluate(makeAction({ discloses: true }), makeState());
    expect(verdict.decision).toBe("PASS");
  });
});
