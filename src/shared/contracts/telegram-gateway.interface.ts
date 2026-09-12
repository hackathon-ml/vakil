export interface TelegramMessage {
  id: number;
  chatId: string;
  text: string;
  date: Date;
  isOutgoing: boolean;
}

export interface TelegramDialog {
  id: string;
  title: string;
}

/**
 * The only door between the agent engine and real Telegram.
 * The engine never imports GramJS directly — it only ever talks to this interface.
 */
export interface TelegramGateway {
  sendMessage(chatId: string, text: string): Promise<TelegramMessage>;
  getMessages(chatId: string, limit?: number): Promise<TelegramMessage[]>;
  subscribeToMessages(handler: (message: TelegramMessage) => Promise<void>): void;
  clickButton(chatId: string, messageId: number, buttonIndex: number): Promise<void>;
  getDialogs(): Promise<TelegramDialog[]>;
}
