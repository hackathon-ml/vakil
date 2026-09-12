import fs from "node:fs/promises";
import path from "node:path";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { REQUIRED_DOSSIER_SECTIONS } from "../guard/rules/dossier-completeness.rule";

const SECTION_TITLES: Record<(typeof REQUIRED_DOSSIER_SECTIONS)[number], string> = {
  citizen: "Iste'molchi ma'lumotlari",
  counterparty: "Kontragent",
  order_ref: "Buyurtma raqami",
  narrative: "Voqealar bayoni",
  law_citations: "Qonun moddalari",
  policy_citations: "Kompaniya siyosati",
  evidence_list: "Dalillar ro'yxati",
  demand: "Talab",
};

/**
 * Turns a completed dossier (already validated by BoundaryGuard's
 * dossier-completeness rule) into a real .docx file — the artifact the demo
 * hands off to @consumergovuz_bot / 1159.
 */
export class DossierBuilderService {
  constructor(private readonly outputDir: string = "dossiers") {}

  async build(caseId: string, content: Partial<Record<string, string>>): Promise<Buffer> {
    const children: Paragraph[] = [
      new Paragraph({ text: `Dossier — ${caseId}`, heading: HeadingLevel.TITLE }),
    ];

    for (const key of REQUIRED_DOSSIER_SECTIONS) {
      children.push(new Paragraph({ text: SECTION_TITLES[key], heading: HeadingLevel.HEADING_1 }));
      children.push(new Paragraph({ text: content[key] ?? "—" }));
    }

    const doc = new Document({ sections: [{ children }] });
    return Packer.toBuffer(doc);
  }

  /** Writes the buffer to disk under outputDir and returns the path (relative, for the Case Bus event). */
  async buildAndSave(caseId: string, content: Partial<Record<string, string>>): Promise<string> {
    const buffer = await this.build(caseId, content);
    await fs.mkdir(this.outputDir, { recursive: true });
    const filePath = path.join(this.outputDir, `${caseId}.docx`);
    await fs.writeFile(filePath, buffer);
    return filePath;
  }
}
