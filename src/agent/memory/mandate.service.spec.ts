import { describe, expect, it } from "vitest";
import { MandateService } from "./mandate.service";
import { PreferenceService } from "./preference.service";
import { InMemoryPreferenceRepository } from "./in-memory-preference.repository";

function baseInput(userId: string) {
  return {
    userId,
    language: "uz" as const,
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
  };
}

describe("MandateService", () => {
  it("drafts a fresh mandate with no learned seeds when the user has no history", async () => {
    const service = new MandateService(new PreferenceService(new InMemoryPreferenceRepository()));

    const mandate = await service.draftMandate(baseInput("user-1"));

    expect(mandate.learnedSeeds).toEqual([]);
    expect(mandate.id).toMatch(/^M-/);
  });

  it("prefills learnedSeeds from a prior case's feedback, with provenance", async () => {
    const repo = new InMemoryPreferenceRepository();
    const preferences = new PreferenceService(repo);
    await preferences.recordFeedback("user-1", "tezroq yopishni xohlaydi", "M-0007");

    const service = new MandateService(preferences);
    const mandate = await service.draftMandate(baseInput("user-1"));

    expect(mandate.learnedSeeds).toEqual(["tezroq yopishni xohlaydi (from M-0007)"]);
  });
});
