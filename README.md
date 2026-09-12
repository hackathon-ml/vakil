# Vakil

A personal agent that fights consumer cases inside the user's own Telegram account: it
negotiates with official support bots and humans under a signed mandate (minimum price,
acceptable outcomes, deadline, walk-away condition), escalates to Uzbekistan's state
Consumer Protection Agency with an auto-built complaint dossier, verifies the money
actually landed, and learns the user's style over time. All case data stays on-device.

*"A chatbot answers. Vakil closes the case — in the messenger where the fight already
happens."*

Full background and rationale: [`docs/idea1-vakil-deep-dive.md`](docs/idea1-vakil-deep-dive.md),
team roles and day-by-day plan: [`docs/team-battle-plan.md`](docs/team-battle-plan.md).

## What's actually built right now

This section describes what's really in this repo today, not the full vision.

### Agent Engine (the brain) — `src/agent/`

- **BoundaryGuard** — all 11 safety rules from the spec (value bounds, outcome
  whitelist, data allowlist, tone, irreversible-action human-tap, timebox, disclosure,
  language match, citation-must-resolve-to-corpus, dossier-completeness, state-threat
  pre-authorization), each with unit tests. Sits between every LLM proposal and
  anything that reaches Telegram — nothing goes out ungated.
- **Negotiation state machine** — a hand-rolled dispatcher (no external graph
  framework) covering `open → argue → offer_check → escalate_human → escalate_state →
  verify → summarize → feedback`.
- **LLM client** — provider-agnostic interface with working adapters for **Anthropic
  Claude**, **OpenAI**, and any OpenAI-compatible endpoint (currently defaults to
  **Groq**, free, see setup below). Every call returns schema-validated structured
  JSON, never free text, so the guard always has something typed to inspect.
- **Legal corpus** — seeded with Art. 18 (10-day return right) and Uzum's return
  policy; citations only pass the guard if they resolve to a real entry.
- **Learning loop** — 👍/👎 feedback becomes typed preference rows with provenance;
  new mandates auto-prefill from a user's history.
- **Dossier export** — generates a real `.docx` complaint file once all 8 required
  sections are present.
- **Mini App API** — `src/server/` exposes the case over HTTP (create a case, read
  its state and event timeline, submit a decision or feedback, read learned prefs,
  wipe a user) so a front-end can be built against it independently.

### Telegram Hands — `src/telegram/`

GramJS (MTProto user session) client, login flow, and a gateway class for sending
messages, reading dialogs, and fetching messages from a real Telegram account. Not
yet connected to a saved session in this environment — see **Not built yet** below.

### Not built yet

- **A live Telegram test.** No `TELEGRAM_API_ID`/`TELEGRAM_API_HASH`/session exist in
  this environment yet. Until someone logs in via `src/telegram/user/test-connection.ts`,
  everything runs against an in-memory mock Telegram gateway.
- **The Mini App front-end itself** — the API is ready, nothing calls it from a UI yet.
- **Vision-based payment verification** — works in code, but Groq's free tier has no
  vision-capable model right now; needs a real OpenAI/Anthropic key to actually test.
- A shared `tsconfig.json` bug (`moduleResolution: "Node"` is invalid on TypeScript 7)
  blocks `npm run build` for the whole project until someone updates that one line.

## Setup

```bash
npm install
cp .env.example .env
```

### Get an LLM key (pick one)

You need **one** of these in `.env` for the agent to actually generate replies. If
more than one is set, priority is Groq → OpenAI → (Anthropic is used only if you
explicitly construct `AnthropicLlmClient` instead of `OpenAiLlmClient`).

| Provider | Cost | Where to get it | `.env` variable |
|---|---|---|---|
| **Groq (recommended)** | Free, no card required | [console.groq.com](https://console.groq.com) → API Keys → Create | `GROQ_API_KEY` |
| OpenAI | Paid (API-platform billing, separate from ChatGPT/Codex credits) | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | `OPENAI_API_KEY` |
| Anthropic | Paid | [console.anthropic.com](https://console.anthropic.com) | `ANTHROPIC_API_KEY` |

> Heads up: OpenAI's **Codex** product credits are a *different* billing pool from the
> general API platform — a Codex/ChatGPT subscription balance will not work as
> `OPENAI_API_KEY` and will fail with a "no credits" error even though the key itself
> is valid. Groq's free tier is the fastest way to get something running.

### Telegram credentials (only needed for a real Telegram test)

Get `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` from [my.telegram.org](https://my.telegram.org),
put them in `.env`, then run:

```bash
npx tsx src/telegram/user/test-connection.ts
```

This logs in interactively (phone → code → 2FA) and saves a local, gitignored session
file. **Test against a private group or a bot you control first — not a live company
support bot — until the negotiation prompts are tuned.**

## Running things

```bash
npm test                # 25 unit tests: all 11 BoundaryGuard rules + memory/mandate logic
npm run agent:demo      # full negotiation, offline, scripted LLM — no API key needed
npm run agent:llm-check # one real, cheap call to confirm your LLM key works
npm run agent:live      # the real negotiation loop against a real LLM (uses your key)
npm run server:dev      # Mini App API on http://localhost:8787
```

Example of exercising the API once `server:dev` is running:

```bash
curl -X POST http://localhost:8787/cases -H 'Content-Type: application/json' -d '{
  "userId": "user-1", "chatId": "uzum-support", "language": "uz",
  "objective": "iPhone 15 qaytarish", "counterpart": "Uzum",
  "bounds": {"minValue": 450000, "acceptableOutcomes": ["refund"], "maxWaitHours": 48,
             "nonNegotiables": [], "allowStateThreat": false, "dataAllowlist": ["order_number"]},
  "evidence": []
}'
curl http://localhost:8787/case/<id from the response above>
```

## Project layout

```
src/
├── shared/contracts/   Types shared across the whole team (Mandate, ProposedAction,
│                       GuardVerdict, TelegramGateway interface, Case Bus events)
├── agent/              The brain: guard, state machine, LLM clients, corpus, memory,
│                       dossier builder, dev/demo scripts
├── server/             HTTP API for the Mini App front-end
└── telegram/           Real Telegram session (GramJS), login flow, gateway
```
