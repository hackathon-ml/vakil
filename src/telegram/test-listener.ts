import { GramJsClient } from "./user/gramjs.client";
import { loadSession } from "./user/session";
import { registerTelegramMessageListener } from "./events/telegram.events";
import { TelegramMessage } from "../shared/telegram.types";

async function main() {
  const session = loadSession();

  if (!session) {
    throw new Error(
      "No saved Telegram session found. Run test-connection.ts first.",
    );
  }

  const gramJs = new GramJsClient(session);
  const client = gramJs.getClient();

  await gramJs.connect();

  console.log("Telegram listener is running.");
  console.log("Send a message to yourself in Saved Messages...\n");

  const handleMessage = async (message: TelegramMessage): Promise<void> => {
    console.log("Incoming message:");
    console.log(message);
    console.log();
  };

  registerTelegramMessageListener(client, handleMessage);

  // Keep the process alive.
  await new Promise<void>(() => {});
}

main().catch((error) => {
  console.error("Listener test failed:", error);
  process.exit(1);
});
