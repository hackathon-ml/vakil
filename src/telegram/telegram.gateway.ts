import { GramJsClient } from "./user/gramjs.client";
import { registerTelegramMessageListener } from "./events/telegram.events";
import type { TelegramMessage } from "../shared/telegram.types";

export interface TelegramDialog {
  id: string;
  title: string;
  username?: string;
}

export class TelegramGateway {
  constructor(private readonly gramJs: GramJsClient) {}

  async connect(): Promise<void> {
    const client = this.gramJs.getClient();

    await client.connect();
  }

  async getMessages(
    chat: string | number,
    limit = 20,
  ): Promise<TelegramMessage[]> {
    const client = this.gramJs.getClient();

    const messages = await client.getMessages(chat, {
      limit,
    });

    return messages
      .filter((message) => message.id !== undefined)
      .map((message) => ({
        id: message.id,
        text: message.message ?? "",
        chatId: message.peerId ? String(message.peerId) : undefined,
        timestamp: message.date ? new Date(message.date * 1000) : new Date(),
        outgoing: false,
      }));
  }

  async resolveChat(chat: string | number) {
    const client = this.gramJs.getClient();

    return client.getEntity(chat);
  }

  async disconnect(): Promise<void> {
    const client = this.gramJs.getClient();

    await client.disconnect();
  }

  async getCurrentUser() {
    const client = this.gramJs.getClient();

    return client.getMe();
  }

  async getDialogs(limit = 20): Promise<TelegramDialog[]> {
    const client = this.gramJs.getClient();

    const dialogs = await client.getDialogs({
      limit,
    });

    return dialogs.map((dialog) => {
      const entity = dialog.entity;
      if (!entity) {
        return {
          id: String(dialog.id),
          title: "Unknown",
          username: undefined,
        };
      }

      return {
        id: String(dialog.id),
        title:
          "title" in entity
            ? (entity.title ?? "Unknown")
            : "firstName" in entity
              ? [entity.firstName, entity.lastName].filter(Boolean).join(" ")
              : "Unknown",
        username:
          "username" in entity ? (entity.username ?? undefined) : undefined,
      };
    });
  }

  async sendMessage(
    chat: string | number,
    message: string,
  ): Promise<TelegramMessage> {
    const client = this.gramJs.getClient();

    const entity = await this.resolveChat(chat);

    const sentMessage = await client.sendMessage(entity, {
      message,
    });

    return {
      id: sentMessage.id,
      text: sentMessage.message ?? "",
      chatId: sentMessage.peerId ? String(sentMessage.peerId) : undefined,
      timestamp: sentMessage.date
        ? new Date(sentMessage.date * 1000)
        : new Date(),
      outgoing: true,
    };
  }
  onMessage(handler: (message: TelegramMessage) => Promise<void>): void {
    registerTelegramMessageListener(this.gramJs.getClient(), handler);
  }
}
