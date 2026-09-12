import { LegalCorpusEntry } from "../legal-corpus.repository";

// D1 seed set: Art. 18 first (10-day return right), then the platform/carrier policies
// referenced in the demo script. Every entry carries a source URL + fetch date so
// citations always resolve to something real.
export const LEGAL_CORPUS_SEED: LegalCorpusEntry[] = [
  {
    id: "art-18",
    article: "18-modda",
    text: {
      uz: "Iste'molchi sifatsiz tovarni sotib olgan sanadan e'tiboran 10 kun ichida uni qaytarish yoki almashtirish huquqiga ega.",
      ru: "Потребитель вправе вернуть или обменять некачественный товар в течение 10 дней с даты покупки.",
      en: "The consumer has the right to return or exchange defective goods within 10 days of purchase.",
    },
    sourceUrl: "https://lex.uz/docs/consumer-protection-law-2023",
    fetchedAt: "2026-09-01",
  },
  {
    id: "uzum-14-day-policy",
    article: "Uzum Market — Return Policy",
    text: {
      uz: "Uzum Market xaridorlarga 14 kun ichida tovarni qaytarish imkonini beradi.",
      ru: "Uzum Market позволяет покупателям вернуть товар в течение 14 дней.",
      en: "Uzum Market allows buyers to return goods within 14 days.",
    },
    sourceUrl: "https://uzum.uz/policies/returns",
    fetchedAt: "2026-09-01",
  },
];
