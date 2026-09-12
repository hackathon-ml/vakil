import fs from "node:fs";
import path from "node:path";

const sessionPath = path.resolve(process.cwd(), ".telegram-session");

export function loadSession(): string {
  if (!fs.existsSync(sessionPath)) {
    return "";
  }

  return fs.readFileSync(sessionPath, "utf8").trim();
}

export function saveSession(session: string): void {
  fs.writeFileSync(sessionPath, session, {
    encoding: "utf8",
    mode: 0o600,
  });
}
