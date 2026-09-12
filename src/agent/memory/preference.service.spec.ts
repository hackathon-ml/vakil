import { describe, expect, it } from "vitest";
import { PreferenceService } from "./preference.service";
import { InMemoryPreferenceRepository } from "./in-memory-preference.repository";

describe("PreferenceService", () => {
  it("records feedback and reflects it in learned seeds with provenance", async () => {
    const service = new PreferenceService(new InMemoryPreferenceRepository());

    await service.recordFeedback("user-1", "erta yopishni afzal ko'radi", "M-0007");
    const seeds = await service.learnedSeedsFor("user-1");

    expect(seeds).toEqual(["erta yopishni afzal ko'radi (from M-0007)"]);
  });

  it("keeps preferences scoped per user", async () => {
    const service = new PreferenceService(new InMemoryPreferenceRepository());

    await service.recordFeedback("user-1", "pref-a", "M-0001");
    await service.recordFeedback("user-2", "pref-b", "M-0002");

    expect(await service.learnedSeedsFor("user-1")).toEqual(["pref-a (from M-0001)"]);
    expect(await service.learnedSeedsFor("user-2")).toEqual(["pref-b (from M-0002)"]);
  });

  it("wipe erases every preference row for a user", async () => {
    const service = new PreferenceService(new InMemoryPreferenceRepository());

    await service.recordFeedback("user-1", "pref-a", "M-0001");
    await service.wipe("user-1");

    expect(await service.learnedSeedsFor("user-1")).toEqual([]);
  });
});
