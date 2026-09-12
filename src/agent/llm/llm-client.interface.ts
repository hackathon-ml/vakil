import { z } from "zod";

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Provider-agnostic entry point. Every node in the engine asks for a structured,
 * schema-validated JSON object back — never free text — so BoundaryGuard always
 * has a typed ProposedAction to inspect. Claude and OpenAI adapters both implement
 * this; nothing else in the engine imports either SDK directly.
 */
export interface LlmClient {
  completeStructured<T extends z.ZodTypeAny>(args: {
    system: string;
    messages: LlmMessage[];
    schema: T;
    schemaName: string;
  }): Promise<z.infer<T>>;

  completeVision<T extends z.ZodTypeAny>(args: {
    system: string;
    prompt: string;
    imageBase64: string;
    mediaType: "image/png" | "image/jpeg";
    schema: T;
    schemaName: string;
  }): Promise<z.infer<T>>;
}
