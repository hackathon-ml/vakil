import { LlmClient } from "../llm/llm-client.interface";
import { LegalCorpusRepository } from "../corpus/legal-corpus.repository";
import { BoundaryGuard } from "../guard/boundary-guard";
import { CaseBus } from "../bus/case-bus";
import { TelegramGateway } from "../../shared/contracts/telegram-gateway.interface";
import { DossierBuilderService } from "../dossier/dossier-builder.service";

export interface EngineDeps {
  llm: LlmClient;
  corpus: LegalCorpusRepository;
  guard: BoundaryGuard;
  bus: CaseBus;
  gateway: TelegramGateway;
  dossier: DossierBuilderService;
}
