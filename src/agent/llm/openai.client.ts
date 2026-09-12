import OpenAI from "openai";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { LlmClient, LlmMessage } from "./llm-client.interface";

/**
 * Works against real OpenAI, or any OpenAI-compatible endpoint (Groq, etc.) by
 * pointing baseURL elsewhere. Auto-detects Groq via GROQ_API_KEY so a hackathon
 * team with no OpenAI billing can still run the whole engine for free — same
 * LlmClient interface either way, nothing else in the codebase needs to know.
 */
export class OpenAiLlmClient implements LlmClient {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    apiKey: string = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "",
    baseURL: string | undefined = process.env.GROQ_API_KEY ? "https://api.groq.com/openai/v1" : undefined,
    model: string = process.env.GROQ_API_KEY ? "openai/gpt-oss-120b" : "gpt-4o",
  ) {
    if (!apiKey) throw new Error("Neither GROQ_API_KEY nor OPENAI_API_KEY is set");
    this.client = new OpenAI({ apiKey, baseURL });
    this.model = model;
  }

  async completeStructured<T extends z.ZodTypeAny>(args: {
    system: string;
    messages: LlmMessage[];
    schema: T;
    schemaName: string;
  }): Promise<z.infer<T>> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "system", content: this.withSchemaInstructions(args.system, args.schema) }, ...args.messages],
      response_format: { type: "json_object" },
    });

    return this.parseContent(response, args.schema);
  }

  async completeVision<T extends z.ZodTypeAny>(args: {
    system: string;
    prompt: string;
    imageBase64: string;
    mediaType: "image/png" | "image/jpeg";
    schema: T;
    schemaName: string;
  }): Promise<z.infer<T>> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: this.withSchemaInstructions(args.system, args.schema) },
        {
          role: "user",
          content: [
            { type: "text", text: args.prompt },
            { type: "image_url", image_url: { url: `data:${args.mediaType};base64,${args.imageBase64}` } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    return this.parseContent(response, args.schema);
  }

  // json_object mode (unlike strict json_schema mode) is supported by both real
  // OpenAI and Groq's OpenAI-compatible endpoint, at the cost of needing the shape
  // spelled out in the prompt instead of enforced server-side — zod still validates
  // the result before anything downstream sees it.
  private withSchemaInstructions(system: string, schema: z.ZodTypeAny): string {
    return `${system}\n\nRespond with a single JSON object only, matching exactly this JSON schema:\n${JSON.stringify(zodToJsonSchema(schema))}`;
  }

  private parseContent<T extends z.ZodTypeAny>(response: OpenAI.Chat.Completions.ChatCompletion, schema: T): z.infer<T> {
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("LLM response had no content");
    return schema.parse(JSON.parse(content));
  }
}
