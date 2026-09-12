export interface TelegramCaseMapping {
  caseId: string;
  chatId: string;
}

export type CaseStatus =
  | "OPEN"
  | "NEGOTIATING"
  | "WAITING_FOR_USER"
  | "RESOLVED"
  | "CLOSED";
