import "reflect-metadata";
import { AppDataSource } from "./db/data-source";

async function main() {
  await AppDataSource.initialize();

  console.log("PostgreSQL connected.");
  console.log("Vakil backend started.");
}

main().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
