import { z } from "zod";
import { LlmClient, LlmMessage } from "./llm-client.interface";

/**
 * Scripted, no-network LLM client for local dev and tests when no API key is set.
 * Queue up responses with `enqueue`; each call to completeStructured/completeVision
 * pops the next one. Lets you exercise the whole engine loop end to end offline.
 */
export class FakeLlmClient implements LlmClient {
  private queue: unknown[] = [];
  public readonly calls: { system: string; messages?: LlmMessage[]; prompt?: string }[] = [];

  enqueue(response: unknown): this {
    this.queue.push(response);
    return this;
  }

  async completeStructured<T extends z.ZodTypeAny>(args: {
    system: string;
    messages: LlmMessage[];
    schema: T;
    schemaName: string;
  }): Promise<z.infer<T>> {
    this.calls.push({ system: args.system, messages: args.messages });
    const next = this.queue.shift();
    if (next === undefined) {
      throw new Error(`FakeLlmClient: no queued response for schema "${args.schemaName}"`);
    }
    return args.schema.parse(next);
  }

  async completeVision<T extends z.ZodTypeAny>(args: {
    system: string;
    prompt: string;
    imageBase64: string;
    mediaType: "image/png" | "image/jpeg";
    schema: T;
    schemaName: string;
  }): Promise<z.infer<T>> {
    this.calls.push({ system: args.system, prompt: args.prompt });
    const next = this.queue.shift();
    if (next === undefined) {
      throw new Error(`FakeLlmClient: no queued response for schema "${args.schemaName}"`);
    }
    return args.schema.parse(next);
  }
}
