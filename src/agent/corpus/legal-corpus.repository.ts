export interface LegalCorpusEntry {
  id: string;
  article: string;
  text: Record<"uz" | "ru" | "en", string>;
  sourceUrl: string;
  fetchedAt: string;
}

/**
 * Kept as an interface so the real Postgres-backed implementation (Alex's DB layer)
 * can be swapped in later without touching anything that depends on this.
 */
export interface LegalCorpusRepository {
  findById(id: string): Promise<LegalCorpusEntry | null>;
  search(query: string): Promise<LegalCorpusEntry[]>;
}
