import { randomUUID } from "node:crypto";
import { Mandate } from "../../shared/contracts/mandate.type";
import { PreferenceService } from "./preference.service";

export type MandateDraftInput = Omit<Mandate, "id" | "learnedSeeds">;

/**
 * Drafts a new mandate for a user, pre-filling learnedSeeds from everything the
 * learning loop has recorded about them so far — this is the "from M-XXXX" prefill
 * the demo's beat 6 shows.
 */
export class MandateService {
  constructor(private readonly preferences: PreferenceService) {}

  async draftMandate(input: MandateDraftInput): Promise<Mandate> {
    const learnedSeeds = await this.preferences.learnedSeedsFor(input.userId);

    return {
      id: `M-${randomUUID().slice(0, 8)}`,
      ...input,
      learnedSeeds,
    };
  }
}
