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

  console.log("Connected to Telegram.");

  const user = await telegram.getCurrentUser();

  console.log("Authenticated user:");
  console.log({
    id: user?.id?.toString(),
    firstName: user?.firstName,
    lastName: user?.lastName,
    username: user?.username,
  });

  const dialogs = await telegram.getDialogs(10);

  console.log("\nRecent dialogs:");

  for (const dialog of dialogs) {
    console.log({
      id: dialog.id,
      title: dialog.title,
      username: dialog.username,
    });
  }

  await telegram.disconnect();

  console.log("\nDisconnected.");
}

main().catch((error) => {
  console.error("Gateway test failed:", error);
  process.exit(1);
});
