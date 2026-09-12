import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { LlmClient, LlmMessage } from "./llm-client.interface";

const MODEL = "claude-opus-5";

export class AnthropicLlmClient implements LlmClient {
  private readonly client: Anthropic;

  constructor(apiKey: string = process.env.ANTHROPIC_API_KEY ?? "") {
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    this.client = new Anthropic({ apiKey });
  }

  async completeStructured<T extends z.ZodTypeAny>(args: {
    system: string;
    messages: LlmMessage[];
    schema: T;
    schemaName: string;
  }): Promise<z.infer<T>> {
    const tool = this.toolFor(args.schemaName, args.schema);

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: args.system,
      tools: [tool],
      tool_choice: { type: "tool", name: tool.name },
      messages: args.messages.map((m) => ({ role: m.role === "system" ? "user" : m.role, content: m.content })),
    });

    return this.extractToolInput(response, tool.name, args.schema);
  }

  async completeVision<T extends z.ZodTypeAny>(args: {
    system: string;
    prompt: string;
    imageBase64: string;
    mediaType: "image/png" | "image/jpeg";
    schema: T;
    schemaName: string;
  }): Promise<z.infer<T>> {
    const tool = this.toolFor(args.schemaName, args.schema);

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: args.system,
      tools: [tool],
      tool_choice: { type: "tool", name: tool.name },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: args.mediaType, data: args.imageBase64 } },
            { type: "text", text: args.prompt },
          ],
        },
      ],
    });

    return this.extractToolInput(response, tool.name, args.schema);
  }

  private toolFor(name: string, schema: z.ZodTypeAny) {
    return {
      name,
      description: `Return a ${name} object`,
      input_schema: zodToJsonSchema(schema) as Anthropic.Tool.InputSchema,
    };
  }

  private extractToolInput<T extends z.ZodTypeAny>(response: Anthropic.Message, toolName: string, schema: T): z.infer<T> {
    const toolUse = response.content.find((block) => block.type === "tool_use" && block.name === toolName);
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error(`Anthropic response did not include a "${toolName}" tool_use block`);
    }
    return schema.parse(toolUse.input);
  }
}
