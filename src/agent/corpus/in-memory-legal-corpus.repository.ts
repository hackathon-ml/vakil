import { LegalCorpusEntry, LegalCorpusRepository } from "./legal-corpus.repository";
import { LEGAL_CORPUS_SEED } from "./seed/legal-corpus.seed";

/**
 * Dev/test implementation. Swap for a Postgres-backed repository later —
 * nothing outside this file needs to change since callers only see the interface.
 */
export class InMemoryLegalCorpusRepository implements LegalCorpusRepository {
  private readonly entries: LegalCorpusEntry[];

  constructor(entries: LegalCorpusEntry[] = LEGAL_CORPUS_SEED) {
    this.entries = entries;
  }

  async findById(id: string): Promise<LegalCorpusEntry | null> {
    return this.entries.find((entry) => entry.id === id) ?? null;
  }

  async search(query: string): Promise<LegalCorpusEntry[]> {
    const needle = query.toLowerCase();
    return this.entries.filter(
      (entry) =>
        entry.article.toLowerCase().includes(needle) ||
        Object.values(entry.text).some((t) => t.toLowerCase().includes(needle)),
    );
  }
}
