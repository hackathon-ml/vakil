export interface TelegramMessage {
  id: number;
  text: string;
  senderId?: string;
  timestamp: Date;
  chatId?: string;
  outgoing: boolean;
}
