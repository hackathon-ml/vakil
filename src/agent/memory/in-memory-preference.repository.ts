import { PreferenceRepository, PreferenceRow } from "./preference.repository";

export class InMemoryPreferenceRepository implements PreferenceRepository {
  private rows: PreferenceRow[] = [];

  async add(row: PreferenceRow): Promise<void> {
    this.rows.push(row);
  }

  async findByUser(userId: string): Promise<PreferenceRow[]> {
    return this.rows.filter((row) => row.userId === userId);
  }

  async deleteByUser(userId: string): Promise<void> {
    this.rows = this.rows.filter((row) => row.userId !== userId);
  }
}
