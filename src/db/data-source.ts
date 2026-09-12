import "reflect-metadata";
import "dotenv/config";

import { DataSource } from "typeorm";
import { Case } from "../entities/case.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,

  entities: [Case],

  synchronize: true,

  logging: false,
});
