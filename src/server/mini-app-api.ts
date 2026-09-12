import http from "node:http";
import { NegotiationEngine } from "../agent/engine/negotiation.engine";
import { EngineDeps } from "../agent/engine/engine-deps.type";
import { CaseBus } from "../agent/bus/case-bus";
import { PreferenceService } from "../agent/memory/preference.service";
import { MandateService, MandateDraftInput } from "../agent/memory/mandate.service";
import { newCase } from "../agent/state/case-state.type";
import { CaseStore } from "./case-store";

export interface MiniAppApiDeps {
  engineDeps: EngineDeps & { bus: CaseBus };
  store: CaseStore;
  preferences: PreferenceService;
  mandates: MandateService;
}

/**
 * The Mini App endpoints artifact from the team contract (GET /case/{id},
 * POST /case/{id}/decision, GET/POST /prefs, POST /wipe), plus /case/{id}/events
 * for Cate's polling fallback. No framework — Node's http is enough for 7 routes.
 *
 * Every route calls engine.step() exactly once, never engine.run() — a single
 * external trigger (a Mini App tap, a new case) should produce exactly one
 * outbound action, not the engine free-running through multiple LLM calls.
 */
export function createMiniAppApi(deps: MiniAppApiDeps): http.Server {
  const engine = new NegotiationEngine(deps.engineDeps);

  return http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      const parts = url.pathname.split("/").filter(Boolean);

      if (req.method === "GET" && parts[0] === "health") {
        return json(res, 200, { ok: true });
      }

      if (req.method === "POST" && parts[0] === "cases" && parts.length === 1) {
        const { chatId, ...mandateInput } = (await readJson(req)) as MandateDraftInput & { chatId: string };
        const mandate = await deps.mandates.draftMandate(mandateInput);
        const opened = await engine.step(newCase(mandate, chatId));
        return json(res, 201, deps.store.save(opened));
      }

      if (req.method === "GET" && parts[0] === "case" && parts.length === 2) {
        const state = deps.store.get(parts[1]);
        if (!state) return json(res, 404, { error: "case not found" });
        return json(res, 200, state);
      }

      if (req.method === "GET" && parts[0] === "case" && parts[2] === "events") {
        return json(res, 200, deps.engineDeps.bus.history(parts[1]));
      }

      if (req.method === "POST" && parts[0] === "case" && parts[2] === "decision") {
        const state = deps.store.get(parts[1]);
        if (!state) return json(res, 404, { error: "case not found" });
        const body = (await readJson(req)) as { decision: "accept_exception" | "hold" | "stop" };
        const next = await engine.step({ ...state, pendingDecision: body.decision });
        return json(res, 200, deps.store.save(next));
      }

      if (req.method === "POST" && parts[0] === "case" && parts[2] === "feedback") {
        const state = deps.store.get(parts[1]);
        if (!state) return json(res, 404, { error: "case not found" });
        const body = (await readJson(req)) as { feedback: "up" | "down"; tag: string };
        await deps.preferences.recordFeedback(state.mandate.userId, body.tag, state.id);
        const next = await engine.step({ ...state, pendingFeedback: body.feedback });
        return json(res, 200, deps.store.save(next));
      }

      if (req.method === "GET" && parts[0] === "prefs" && parts.length === 2) {
        const learnedSeeds = await deps.preferences.learnedSeedsFor(parts[1]);
        return json(res, 200, { userId: parts[1], learnedSeeds });
      }

      if (req.method === "POST" && parts[0] === "wipe") {
        const body = (await readJson(req)) as { userId: string };
        await deps.preferences.wipe(body.userId);
        deps.store.deleteByUser(body.userId);
        return json(res, 200, { wiped: true });
      }

      json(res, 404, { error: "not found" });
    } catch (error) {
      json(res, 500, { error: (error as Error).message });
    }
  });
}

function json(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readJson(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}
