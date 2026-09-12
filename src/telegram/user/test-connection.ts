import input from "input";
import { GramJsClient } from "./gramjs.client";

async function main() {
  const gramJs = new GramJsClient();
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

    onError: (error: Error) => {
      console.error("Telegram authentication error:", error);
    },
  });

  console.log("Telegram connected successfully.");

  await client.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
