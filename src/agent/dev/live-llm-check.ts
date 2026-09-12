import "dotenv/config";
import { z } from "zod";
import { OpenAiLlmClient } from "../llm/openai.client";

/**
 * One real, cheap call to confirm OPENAI_API_KEY actually works end to end
 * through our LlmClient interface — before trusting it inside the full engine.
 * Run with: npx tsx src/agent/dev/live-llm-check.ts
 */
async function main() {
  const client = new OpenAiLlmClient();

  const result = await client.completeStructured({
    system: "Reply in the requested language only. Keep it to one short sentence.",
    messages: [{ role: "user", content: "Say hello in Uzbek, as Vakil, a consumer-rights agent." }],
    schema: z.object({ greeting: z.string() }),
    schemaName: "greeting",
  });

  console.log("OpenAI key works. Response:", result);
}

main().catch((error) => {
  console.error("Live check failed:", error.message ?? error);
  process.exit(1);
});
