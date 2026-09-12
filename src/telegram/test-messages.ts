import { GramJsClient } from "./user/gramjs.client";
import { TelegramGateway } from "./telegram.gateway";
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

  try {
    const messages = await telegram.getMessages("me", 10);

    console.log("Recent messages from Saved Messages:\n");

    for (const message of messages) {
      console.log({
        id: message.id,
        text: message.text,
        timestamp: message.timestamp,
      });
    }
  } finally {
    await telegram.disconnect();
  }
}

main().catch((error) => {
  console.error("Message test failed:", error);
  process.exit(1);
});
