import input from "input";
import { GramJsClient } from "./gramjs.client";
import { loadSession, saveSession } from "./session";

async function main() {
  const savedSession = loadSession();

  const gramJs = new GramJsClient(savedSession);
  const client = gramJs.getClient();

  await client.start({
    phoneNumber: async () => {
      return input.text("Telegram phone number: ");
    },

    password: async () => {
      return input.text("Telegram 2FA password: ");
    },

    phoneCode: async () => {
      return input.text("Telegram login code: ");
    },

    onError: (error) => {
      console.error("Telegram authentication error:", error);
    },
  });

  const session = gramJs.getSession();

  saveSession(session);

  console.log("Telegram connected successfully.");
  console.log("Session saved successfully.");

  await client.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
