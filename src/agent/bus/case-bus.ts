import { EventEmitter } from "node:events";
import { CaseBusEvent } from "../../shared/contracts/case-bus-events.type";

/**
 * In-process pub/sub for Case Bus events (artifact #2 in the team contract).
 * Cate's Mini App and Alex's endpoints consume these; kept as a small wrapper
 * so a persistence layer (for the 2s-polling fallback) can be bolted on later
 * without changing any call site.
 */
export class CaseBus {
  private readonly emitter = new EventEmitter();
  private readonly log: CaseBusEvent[] = [];

  emit(event: CaseBusEvent): void {
    this.log.push(event);
    this.emitter.emit("event", event);
  }

  subscribe(handler: (event: CaseBusEvent) => void): void {
    this.emitter.on("event", handler);
  }

  history(caseId?: string): CaseBusEvent[] {
    if (!caseId) return [...this.log];
    return this.log.filter((event) => "caseId" in event && event.caseId === caseId);
  }
}
