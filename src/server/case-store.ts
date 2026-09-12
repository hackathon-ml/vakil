import { CaseState } from "../agent/state/case-state.type";

/** In-memory for now — swap for a real table once Alex's DB layer is ready. */
export class CaseStore {
  private readonly cases = new Map<string, CaseState>();

  save(state: CaseState): CaseState {
    this.cases.set(state.id, state);
    return state;
  }

  get(id: string): CaseState | undefined {
    return this.cases.get(id);
  }

  deleteByUser(userId: string): void {
    for (const [id, state] of this.cases) {
      if (state.mandate.userId === userId) this.cases.delete(id);
    }
  }
}
