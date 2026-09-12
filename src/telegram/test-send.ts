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
    const message = await telegram.sendMessage(
      "me",
      "Vakil TelegramGateway test ✅",
    );

    console.log("Message sent successfully:");
    console.log(message);
  } finally {
    await telegram.disconnect();
  }
}

main().catch((error) => {
  console.error("Send test failed:", error);
  process.exit(1);
});
