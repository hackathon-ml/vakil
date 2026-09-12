import "dotenv/config";
import { NegotiationEngine } from "../engine/negotiation.engine";
import { BoundaryGuard } from "../guard/boundary-guard";
import { InMemoryLegalCorpusRepository } from "../corpus/in-memory-legal-corpus.repository";
import { CaseBus } from "../bus/case-bus";
import { FakeLlmClient } from "../llm/fake.client";
import { MockTelegramGateway } from "./mock-telegram-gateway";
import { DossierBuilderService } from "../dossier/dossier-builder.service";
import { CaseState, newCase } from "../state/case-state.type";
import { Mandate } from "../../shared/contracts/mandate.type";

/**
 * Runs the "hero beat" end to end with no network calls and no API keys:
 * open -> argue -> (below-min offer arrives) -> guard escalates -> user taps
 * hold -> agent counters citing Art. 18 + its own minimum -> user accepts the
 * exception -> verify -> summarize.
 *
 * This exists so the whole loop is provably wired correctly today, independent
 * of Alex's real Telegram session and of which LLM provider ends up wired in.
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
  bus.subscribe((event) => console.log("[case-bus]", event.type, event));

  const gateway = new MockTelegramGateway();
  const corpus = new InMemoryLegalCorpusRepository();
  const guard = new BoundaryGuard(corpus);
  const dossier = new DossierBuilderService();
  const llm = new FakeLlmClient();

  // 1) open — discloses + states the objective. Should pass the guard cleanly.
  llm.enqueue({
    type: "send_message",
    text: "Salom! Men Vakil — foydalanuvchi topshirig'i asosida ishlovchi avtomatik agentman. iPhone 15 uchun pulni qaytarishni so'rayman.",
    language: "uz",
    requiresHumanTap: false,
    discloses: true,
  });

  const engine = new NegotiationEngine({ llm, corpus, guard, bus, gateway, dossier });

  let state = await engine.step(newCase(mandate, "uzum-support"));
  console.log("after open ->", state.status);

  // 2) Simulate the counterparty offering below the mandate minimum. In the real
  // system a classifier step (not yet built) would parse this from the inbound
  // message; here we set it directly to exercise offer_check -> guard escalation.
  state = { ...state, status: "offer_check", currentOffer: 300_000 };

  llm.enqueue({
    type: "accept_offer", // the model over-commits — exactly the risk the guard exists for
    text: "Rozimiz, 300 000 so'mni qabul qilamiz.",
    language: "uz",
    requiresHumanTap: true,
    amount: 300_000,
  });

  state = await engine.step(state);
  console.log("after offer_check ->", state.status, "(expect escalate_human)");

  // 3) The judge taps "hold" in the Mini App.
  state = { ...state, pendingDecision: "hold" };
  llm.enqueue({
    type: "counter_offer",
    text: "300 000 so'm bizning minimal talabimizdan past. 18-modda asosida va shartnoma bo'yicha 450 000 so'mni talab qilamiz.",
    language: "uz",
    requiresHumanTap: true,
    amount: 450_000,
    citationId: "art-18",
  });

  state = await engine.step(state);
  console.log("after hold ->", state.status, "(expect argue, citation should have passed)");

  // 4) Counterparty grants the minimum; the judge taps "accept exception" this time
  // (in a real flow this would just be an ordinary accept, above minimum).
  state = { ...state, status: "offer_check", currentOffer: 450_000 };
  llm.enqueue({
    type: "accept_offer",
    text: "Rozimiz, 450 000 so'mni qabul qilamiz.",
    language: "uz",
    requiresHumanTap: true,
    amount: 450_000,
  });
  state = await engine.step(state);
  console.log("after offer_check (at minimum) ->", state.status, "(expect verify)");

  // 5) Wallet screenshot arrives; FakeLlmClient stands in for the vision call.
  state = { ...state, pendingScreenshot: { base64: "fake", mediaType: "image/png" } };
  llm.enqueue({ amount: 450_000, date: "2026-09-14", channel: "Uzum Bank" });
  state = await engine.step(state);
  console.log("after verify ->", state.status, "(expect summarize)");

  state = await engine.step(state);
  console.log("after summarize ->", state.status, "resolvedOutcome:", state.resolvedOutcome);

  console.log("\nMessages actually sent over the (mock) Telegram gateway:");
  for (const message of gateway.sent) console.log(" -", message.text);

  await runDossierScenario({ bus, gateway, corpus, guard, dossier, llm });
}

/**
 * Second scenario: the company hard-refuses, the mandate pre-authorizes state
 * escalation, and the agent builds a real .docx dossier for @consumergovuz_bot.
 */
async function runDossierScenario(deps: {
  bus: InstanceType<typeof CaseBus>;
  gateway: MockTelegramGateway;
  corpus: InMemoryLegalCorpusRepository;
  guard: BoundaryGuard;
  dossier: DossierBuilderService;
  llm: FakeLlmClient;
}) {
  console.log("\n--- dossier escalation scenario ---");

  const mandate: Mandate = {
    id: "M-0002",
    userId: "user-1",
    language: "uz",
    objective: "PS5 uchun pul qaytarish",
    counterpart: "Uzum",
    bounds: {
      minValue: 3_500_000,
      acceptableOutcomes: ["refund"],
      maxWaitHours: 48,
      nonNegotiables: [],
      allowStateThreat: true, // pre-authorized — required by guard rule 11
      dataAllowlist: ["order_number"],
    },
    evidence: ["order-91021"],
    learnedSeeds: [],
  };

  let state: CaseState = { ...newCase(mandate, "uzum-support"), status: "escalate_state" };

  deps.llm.enqueue({
    type: "submit_dossier",
    text: "Dossier @consumergovuz_bot uchun tayyor.",
    language: "uz",
    requiresHumanTap: true,
    dossierSections: [
      "citizen", "counterparty", "order_ref", "narrative",
      "law_citations", "policy_citations", "evidence_list", "demand",
    ],
    dossierContent: {
      citizen: "F.I.Sh: (demo user), tel: +998 90 000 00 00",
      counterparty: "Uzum Market",
      order_ref: "order-91021",
      narrative: "PS5 nosoz holda yetkazib berildi, kompaniya rad etdi.",
      law_citations: "18-modda (Iste'molchilar huquqlarini himoya qilish to'g'risida qonun, 2023)",
      policy_citations: "Uzum Market 14 kunlik qaytarish siyosati",
      evidence_list: "Chek, foto, yozishmalar tarixi",
      demand: "3 500 000 so'm miqdorida pulni to'liq qaytarish",
    },
  });

  const engine = new NegotiationEngine(deps);
  state = await engine.step(state);

  console.log("after escalate_state ->", state.status, "(expect closed)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
