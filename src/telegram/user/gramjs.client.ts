import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { config } from "../../config";

export class GramJsClient {
  private readonly client: TelegramClient;

  constructor() {
    const session = new StringSession(config.telegram.session);

    this.client = new TelegramClient(
      session,
      config.telegram.apiId,
      config.telegram.apiHash,
      {
        connectionRetries: 5,
      },
    );
  }

  getClient(): TelegramClient {
    return this.client;
  }
}
