import "dotenv/config";
import { NegotiationEngine } from "../engine/negotiation.engine";
import { BoundaryGuard } from "../guard/boundary-guard";
import { InMemoryLegalCorpusRepository } from "../corpus/in-memory-legal-corpus.repository";
import { CaseBus } from "../bus/case-bus";
import { OpenAiLlmClient } from "../llm/openai.client";
import { MockTelegramGateway } from "./mock-telegram-gateway";
import { DossierBuilderService } from "../dossier/dossier-builder.service";
import { CaseState, newCase } from "../state/case-state.type";
import { Mandate } from "../../shared/contracts/mandate.type";

/**
 * Same shape as dev-run.ts, but with a REAL LLM (Groq/OpenAI) instead of scripted
 * fake responses — proves the engine actually negotiates, not just replays a script.
 * Run with: npx tsx src/agent/dev/live-run.ts
 */
async function main() {
  const mandate: Mandate = {
    id: "M-0001",
    userId: "user-1",
    language: "uz",
    objective: "iPhone 15 qaytarish / pul qaytarish",
    counterpart: "Uzum",
    bounds: {
      minValue: 450_000,
      acceptableOutcomes: ["refund"],
      maxWaitHours: 48,
      nonNegotiables: [],
      allowStateThreat: false,
      dataAllowlist: ["order_number"],
    },
    evidence: ["order-38213"],
    learnedSeeds: [],
  };

  const bus = new CaseBus();
  bus.subscribe((event) => console.log("[case-bus]", event.type, JSON.stringify(event)));

  const engine = new NegotiationEngine({
    llm: new OpenAiLlmClient(),
    corpus: new InMemoryLegalCorpusRepository(),
    guard: new BoundaryGuard(new InMemoryLegalCorpusRepository()),
    bus,
    gateway: new MockTelegramGateway(),
    dossier: new DossierBuilderService(),
  });

  let state: CaseState = newCase(mandate, "uzum-support");
  state = await engine.step(state);
  console.log("\nafter open ->", state.status);

  // Simulate the counterparty offering below the mandate minimum — a real
  // classifier isn't built yet, so we set this directly, same as dev-run.ts.
  state = { ...state, status: "offer_check", currentOffer: 300_000 };
  state = await engine.step(state);
  console.log("after offer_check (300k offered, min is 450k) ->", state.status);

  if (state.status === "escalate_human") {
    console.log("\nGuard escalated as expected. Simulating a 'hold' tap...");
    state = { ...state, pendingDecision: "hold" };
    state = await engine.step(state);
    console.log("after hold ->", state.status);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
