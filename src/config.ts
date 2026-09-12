import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const config = {
  telegram: {
    apiId: Number(requireEnv("TELEGRAM_API_ID")),
    apiHash: requireEnv("TELEGRAM_API_HASH"),
    session: process.env.TELEGRAM_SESSION ?? "",
  },
};
