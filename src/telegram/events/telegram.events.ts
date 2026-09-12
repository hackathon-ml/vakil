import { NewMessage } from "telegram/events";
import type { TelegramClient } from "telegram";
import type { TelegramMessage } from "../../shared/telegram.types";

export function registerTelegramMessageListener(
  client: TelegramClient,
  onMessage: (message: TelegramMessage) => Promise<void>,
): void {
  client.addEventHandler(async (event) => {
    const message = event.message;

    if (!message || !message.message) {
      return;
    }

    // Ignore messages sent by our own Telegram account.
    if (message.out) {
      return;
    }

    const chatId = message.chatId?.toString();

    if (!chatId) {
      return;
    }

    const senderId = message.senderId?.toString();

    await onMessage({
      id: message.id,
      chatId,
      senderId,
      text: message.message,
      timestamp: message.date ? new Date(message.date) : new Date(),
      outgoing: !!message.out,
    });
  }, new NewMessage({}));
}
