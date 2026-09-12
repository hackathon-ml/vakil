import { TelegramGateway } from "./telegram.gateway";
import { CaseService } from "../cases/case.service";
import type { TelegramMessage } from "../shared/telegram.types";

export class TelegramCaseService {
  constructor(
    private readonly telegram: TelegramGateway,
    private readonly cases: CaseService,
  ) {}

  subscribe(): void {
    this.telegram.onMessage(async (message) => {
      await this.handleIncomingMessage(message);
    });
  }

  private async handleIncomingMessage(message: TelegramMessage): Promise<void> {
    if (!message.chatId) {
      console.log(
        `Ignoring Telegram message without chatId: ${JSON.stringify(message)}`,
      );
      return;
    }
    const currentCase = await this.cases.getCaseByChatId(message.chatId);

    if (!currentCase) {
      console.log(
        `Ignoring Telegram message from unknown chat: ${message.chatId}`,
      );

      return;
    }

    console.log("CASE MESSAGE");

    console.log({
      caseId: currentCase.id,
      chatId: message.chatId,
      senderId: message.senderId,
      text: message.text,
      timestamp: message.timestamp,
    });
  }
}
