export type ProposedActionType =
  | "send_message"
  | "accept_offer"
  | "counter_offer"
  | "escalate_human"
  | "escalate_state"
  | "hold"
  | "submit_dossier"
  | "close_case";

/**
 * The only thing the LLM is ever allowed to produce. It never touches Telegram —
 * BoundaryGuard inspects this object before anything is sent.
 */
export interface ProposedAction {
  type: ProposedActionType;
  text: string;
  language: "uz" | "ru" | "en";
  requiresHumanTap: boolean;
  amount?: number;
  outcome?: string;
  citationId?: string;
  disclosedFields?: string[];
  discloses?: boolean;
  dossierSections?: string[];
  dossierContent?: Partial<Record<string, string>>;
  // Set only by escalate-human.node when the user tapped "accept exception" on a
  // below-minimum offer — an explicit, already-confirmed human override. The LLM
  // itself is never allowed to set this.
  humanApprovedException?: boolean;
}
