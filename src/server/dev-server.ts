import "dotenv/config";
import { createMiniAppApi } from "./mini-app-api";
import { CaseStore } from "./case-store";
import { CaseBus } from "../agent/bus/case-bus";
import { BoundaryGuard } from "../agent/guard/boundary-guard";
import { InMemoryLegalCorpusRepository } from "../agent/corpus/in-memory-legal-corpus.repository";
import { InMemoryPreferenceRepository } from "../agent/memory/in-memory-preference.repository";
import { PreferenceService } from "../agent/memory/preference.service";
import { MandateService } from "../agent/memory/mandate.service";
import { DossierBuilderService } from "../agent/dossier/dossier-builder.service";
import { MockTelegramGateway } from "../agent/dev/mock-telegram-gateway";
import { OpenAiLlmClient } from "../agent/llm/openai.client";

/**
 * Standalone dev server Cate's Mini App can point at today. Uses MockTelegramGateway
 * (no real Telegram session needed to develop the UI) and the real Groq/OpenAI LLM
 * client. Swap MockTelegramGateway for Alex's GramjsTelegramGatewayAdapter once a
 * real session exists — nothing else here changes.
 */
const PORT = Number(process.env.PORT ?? 8787);

const corpus = new InMemoryLegalCorpusRepository();
const bus = new CaseBus();
const preferences = new PreferenceService(new InMemoryPreferenceRepository());

const server = createMiniAppApi({
  engineDeps: {
    llm: new OpenAiLlmClient(),
    corpus,
    guard: new BoundaryGuard(corpus),
    bus,
    gateway: new MockTelegramGateway(),
    dossier: new DossierBuilderService(),
  },
  store: new CaseStore(),
  preferences,
  mandates: new MandateService(preferences),
});

server.listen(PORT, () => {
  console.log(`Mini App API listening on http://localhost:${PORT}`);
  console.log(`
Try:
  curl -X POST http://localhost:${PORT}/cases -H 'Content-Type: application/json' -d '{
    "userId": "user-1", "chatId": "uzum-support", "language": "uz",
    "objective": "iPhone 15 qaytarish", "counterpart": "Uzum",
    "bounds": {"minValue": 450000, "acceptableOutcomes": ["refund"], "maxWaitHours": 48,
               "nonNegotiables": [], "allowStateThreat": false, "dataAllowlist": ["order_number"]},
    "evidence": []
  }'
  curl http://localhost:${PORT}/case/<id from above>
`);
});
