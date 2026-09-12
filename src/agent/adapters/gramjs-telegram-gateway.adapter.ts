import { NewMessage, NewMessageEvent } from "telegram/events";
import { GramJsClient } from "../../telegram/user/gramjs.client";
import { TelegramGateway as GramjsTelegramGateway } from "../../telegram/telegram.gateway";
import {
  TelegramDialog,
  TelegramGateway,
  TelegramMessage,
} from "../../shared/contracts/telegram-gateway.interface";

/**
 * Bridges Alex's concrete GramJS-backed TelegramGateway (src/telegram/telegram.gateway.ts)
 * to the shared TelegramGateway contract the agent engine depends on. Nothing in
 * src/telegram/ is modified — this only reads Alex's public API and the raw GramJS
 * client his GramJsClient already exposes via getClient().
 *
 * Button pressing: GramJS's Message#click() presses an inline button on a bot's
 * message from a real user session — this is the "can we press another bot's inline
 * button" capability the team brief calls the resendBotCallbackQuery spike. It's a
 * documented, stable GramJS feature (see node_modules/telegram/tl/custom/message.d.ts),
 * but Uzum/Ucell's bots may still behave unexpectedly in practice — confirm against
 * the real bot before relying on it live, and keep BoundaryGuard's
 * irreversible-action-tap rule as the safety net regardless.
 */
export class GramjsTelegramGatewayAdapter implements TelegramGateway {
  constructor(
    private readonly gramJs: GramJsClient,
    private readonly gateway: GramjsTelegramGateway = new GramjsTelegramGateway(gramJs),
  ) {}

  async sendMessage(chatId: string, text: string): Promise<TelegramMessage> {
    const sent = await this.gateway.sendMessage(chatId, text);
    return {
      id: sent.id,
      chatId,
      text: sent.text,
      date: sent.timestamp,
      isOutgoing: true,
    };
  }

  async getMessages(chatId: string, limit = 20): Promise<TelegramMessage[]> {
    const messages = await this.gateway.getMessages(chatId, limit);
    // Alex's TelegramMessage doesn't carry the GramJS `.out` flag yet, so we can't
    // reliably tell outbound from inbound here — only sendMessage() and the live
    // subscribeToMessages() event carry it accurately today. Worth asking Alex to
    // pass `.out` through getMessages() if history needs it too.
    return messages.map((message) => ({
      id: message.id,
      chatId: message.chatId ?? chatId,
      text: message.text,
      date: message.timestamp,
      isOutgoing: false,
    }));
  }

  subscribeToMessages(handler: (message: TelegramMessage) => Promise<void>): void {
    const client = this.gramJs.getClient();
    client.addEventHandler(async (event: NewMessageEvent) => {
      const message = event.message;
      await handler({
        id: message.id,
        chatId: String(message.chatId ?? ""),
        text: message.message ?? "",
        date: message.date ? new Date(message.date * 1000) : new Date(),
        isOutgoing: Boolean(message.out),
      });
    }, new NewMessage({}));
  }

  async clickButton(chatId: string, messageId: number, buttonIndex: number): Promise<void> {
    const client = this.gramJs.getClient();
    const [rawMessage] = await client.getMessages(chatId, { ids: [messageId] });
    if (!rawMessage) {
      throw new Error(`clickButton: message ${messageId} not found in chat ${chatId}`);
    }
    await rawMessage.click({ i: buttonIndex });
  }

  async getDialogs(): Promise<TelegramDialog[]> {
    const dialogs = await this.gateway.getDialogs();
    return dialogs.map((dialog) => ({ id: dialog.id, title: dialog.title }));
  }
}
