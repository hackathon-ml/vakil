export type Language = "uz" | "ru" | "en";

export interface MandateBounds {
  minValue: number;
  acceptableOutcomes: string[];
  maxWaitHours: number;
  nonNegotiables: string[];
  allowStateThreat: boolean;
  dataAllowlist: string[];
}

export interface Mandate {
  id: string;
  userId: string;
  language: Language;
  objective: string;
  counterpart: string;
  bounds: MandateBounds;
  evidence: string[];
  learnedSeeds: string[];
}
