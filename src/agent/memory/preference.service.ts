import { randomUUID } from "node:crypto";
import { PreferenceRepository, PreferenceRow } from "./preference.repository";

/**
 * The learning loop: 👍/👎 + tags become typed rows with provenance, and the next
 * mandate reads them back as "learned seeds" so the Mini App can show
 * '"erta yopish" — from M-0007' instead of a silent, unexplained default.
 */
export class PreferenceService {
  constructor(private readonly repo: PreferenceRepository) {}

  async recordFeedback(userId: string, tag: string, provenance: string): Promise<PreferenceRow> {
    const row: PreferenceRow = {
      id: randomUUID(),
      userId,
      tag,
      provenance,
      createdAt: new Date().toISOString(),
    };
    await this.repo.add(row);
    return row;
  }

  /** Human-readable seeds for Mandate.learnedSeeds, each carrying its own provenance. */
  async learnedSeedsFor(userId: string): Promise<string[]> {
    const rows = await this.repo.findByUser(userId);
    return rows.map((row) => `${row.tag} (from ${row.provenance})`);
  }

  /** WIPE must be able to erase everything learned about a user, no exceptions. */
  async wipe(userId: string): Promise<void> {
    await this.repo.deleteByUser(userId);
  }
}
