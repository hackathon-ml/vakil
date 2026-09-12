export interface PreferenceRow {
  id: string;
  userId: string;
  tag: string;
  provenance: string; // the case id this preference was learned from, e.g. "M-0007"
  createdAt: string;
}

/**
 * Interface only, same pattern as LegalCorpusRepository — an in-memory implementation
 * for now, a Postgres-backed one later without touching any caller.
 */
export interface PreferenceRepository {
  add(row: PreferenceRow): Promise<void>;
  findByUser(userId: string): Promise<PreferenceRow[]>;
  deleteByUser(userId: string): Promise<void>; // needed by WIPE
}
