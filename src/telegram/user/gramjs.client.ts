import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { config } from "../../config";

export class GramJsClient {
  private readonly session: StringSession;
  private readonly client: TelegramClient;

  constructor(sessionString = "") {
    this.session = new StringSession(sessionString);

    this.client = new TelegramClient(
      this.session,
      config.telegram.apiId,
      config.telegram.apiHash,
      {
        connectionRetries: 5,
      },
    );
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  getClient(): TelegramClient {
    return this.client;
  }

  getSession(): string {
    return this.session.save();
  }
}
