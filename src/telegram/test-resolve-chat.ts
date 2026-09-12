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
    const chat = await telegram.resolveChat("me");

    console.log("Resolved chat:");
    console.log({
      id: chat && "id" in chat ? chat.id?.toString() : undefined,
      username: chat && "username" in chat ? chat.username : undefined,
      title: chat && "title" in chat ? chat.title : undefined,
    });
  } finally {
    await telegram.disconnect();
  }
}

main().catch((error) => {
  console.error("Resolve chat test failed:", error);
  process.exit(1);
});
