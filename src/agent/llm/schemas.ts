import { z } from "zod";

// Mirrors ProposedAction — the LLM must return exactly this shape.
export const proposedActionSchema = z.object({
  type: z.enum([
    "send_message",
    "accept_offer",
    "counter_offer",
    "escalate_human",
    "escalate_state",
    "hold",
    "submit_dossier",
    "close_case",
  ]),
  text: z.string(),
  language: z.enum(["uz", "ru", "en"]),
  requiresHumanTap: z.boolean(),
  amount: z.number().optional(),
  outcome: z.string().optional(),
  citationId: z.string().optional(),
  disclosedFields: z.array(z.string()).optional(),
  discloses: z.boolean().optional(),
  dossierSections: z.array(z.string()).optional(),
  dossierContent: z.record(z.string()).optional(),
  // Never populated by the LLM in practice (see ProposedAction) — present so the
  // schema round-trips the same shape the guard receives.
  humanApprovedException: z.boolean().optional(),
});

export const verificationResultSchema = z.object({
  amount: z.number().nullable(),
  date: z.string().nullable(),
  channel: z.string().nullable(),
});
