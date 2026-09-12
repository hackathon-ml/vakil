import "reflect-metadata";

import { GramJsClient } from "./user/gramjs.client";
import { loadSession } from "./user/session";
import { TelegramGateway } from "./telegram.gateway";
import { CaseService } from "../cases/case.service";
import { TelegramCaseService } from "./telegram-case.service";
import { AppDataSource } from "../db/data-source";

async function main() {
  const session = loadSession();

  if (!session) {
    throw new Error(
      "No saved Telegram session found. Run test-connection.ts first.",
    );
  }

  await AppDataSource.initialize();

  const gramJs = new GramJsClient(session);
  const telegram = new TelegramGateway(gramJs);
  const cases = new CaseService();

  await telegram.connect();

  try {
    /*
     * For now we use Saved Messages as our test conversation.
     * Later this will be a real support-bot chat.
     */
    const resolvedChat = await telegram.resolveChat("me");

    const chatId = resolvedChat.id.toString();

    const testCase = await cases.createCase(chatId);

    console.log("Created case:");
    console.log(testCase);

    const telegramCases = new TelegramCaseService(telegram, cases);

    telegramCases.subscribe();

    console.log("\nListening for messages...");
    console.log(`Messages from "me" belong to ${testCase.id}.`);
    console.log("Send a message to Saved Messages.");
  } catch (error) {
    await telegram.disconnect();
    throw error;
  }
}

main().catch((error) => {
  console.error("Case routing test failed:", error);
  process.exit(1);
});
