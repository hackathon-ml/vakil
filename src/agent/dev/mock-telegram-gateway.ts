import { TelegramDialog, TelegramGateway, TelegramMessage } from "../../shared/contracts/telegram-gateway.interface";

/**
 * In-memory stand-in for Alex's real GramJS-backed gateway. Implements the exact
 * same interface, so the engine can be built and tested today and pointed at the
 * real one later with zero other code changes.
 */
export class MockTelegramGateway implements TelegramGateway {
  public readonly sent: TelegramMessage[] = [];
  private nextId = 1;
  private handler: ((message: TelegramMessage) => Promise<void>) | null = null;

  async sendMessage(chatId: string, text: string): Promise<TelegramMessage> {
    const message: TelegramMessage = { id: this.nextId++, chatId, text, date: new Date(), isOutgoing: true };
    this.sent.push(message);
    return message;
  }

  async getMessages(chatId: string, limit = 20): Promise<TelegramMessage[]> {
    return this.sent.filter((m) => m.chatId === chatId).slice(-limit);
  }

  subscribeToMessages(handler: (message: TelegramMessage) => Promise<void>): void {
    this.handler = handler;
  }

  async clickButton(): Promise<void> {
    // no-op in the mock; the real gateway wires this to resendBotCallbackQuery
  }

  async getDialogs(): Promise<TelegramDialog[]> {
    return [{ id: "uzum-support", title: "Uzum Support" }];
  }

  /** Test/dev helper to simulate an inbound message from the counterparty. */
  async simulateInbound(chatId: string, text: string): Promise<void> {
    const message: TelegramMessage = { id: this.nextId++, chatId, text, date: new Date(), isOutgoing: false };
    if (this.handler) await this.handler(message);
  }
}
