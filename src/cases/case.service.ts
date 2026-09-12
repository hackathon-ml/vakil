import { AppDataSource } from "../db/data-source";
import { Case } from "../entities/case.entity";

export class CaseService {
  private readonly repository = AppDataSource.getRepository(Case);

  async createCase(telegramChatId: string): Promise<Case> {
    const existingCase = await this.repository.findOne({
      where: {
        telegramChatId,
      },
    });

    if (existingCase) {
      return existingCase;
    }

    const newCase = this.repository.create({
      telegramChatId,
      status: "OPEN",
    });

    return this.repository.save(newCase);
  }

  async getCaseById(caseId: string): Promise<Case | null> {
    return this.repository.findOne({
      where: {
        id: caseId,
      },
    });
  }

  async getCaseByChatId(telegramChatId: string): Promise<Case | null> {
    return this.repository.findOne({
      where: {
        telegramChatId,
      },
    });
  }

  async setStatus(caseId: string, status: string): Promise<void> {
    await this.repository.update({ id: caseId }, { status });
  }
}
