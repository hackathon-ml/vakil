import { TelegramGateway } from "./telegram.gateway";
import { GramJsClient } from "./user/gramjs.client";
import { loadSession } from "./user/session";

async function main() {
  const session = loadSession();

  if (!session) {
    throw new Error(
      "No saved Telegram session found. Run test-connection.ts first.",
    );
  }

  const gramJs = new GramJsClient(session);
  const telegram = new TelegramGateway(gramJs);

  await telegram.connect();

  console.log("Telegram gateway connected.");
  console.log("Waiting for incoming messages...\n");

  telegram.onMessage(async (message) => {
    console.log("MESSAGE RECEIVED");
    console.log(message);
    console.log();
  });

  // Keep process alive.
  await new Promise<void>(() => {});
}

main().catch((error) => {
  console.error("Gateway listener test failed:", error);
  process.exit(1);
});
