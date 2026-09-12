# VAKIL — Team Brief & Task Handoff
**One-pager for the crew · 48h · details in `idea1-vakil-deep-dive.md` (v1) + `vakil-v2-winning-edition.md` (v2)**

## What we're building (3 lines)
A personal agent that fights consumer cases **inside the user's own Telegram account**: it negotiates with official support bots (Uzum, Beeline, Ucell) and humans under a **signed mandate** (min price, outcomes, deadline, walk-away), escalates to the **state Consumer Protection Agency** (1159 / `@consumergovuz_bot`) with an auto-built complaint dossier citing real law, **verifies the money landed**, and learns the user's style from 👍/👎. **All data on-device.** Bot (face) + MTProto user session (hands) + Mini App (dashboard).

**One-liner:** *"A chatbot answers. Vakil closes the case — in the messenger where the fight already happens."*

## Why this wins (valid points — recite these)
1. **The arena is already in Telegram:** 20M+ Uzum MAU; company bots, AND the state agency bot (`@consumergovuz_bot`, 1159) all live there. We build the first agent to walk that whole ladder.
2. **Why now:** UZ e-com at ~40% CAGR but only 3% of retail → disputes are exploding; 2023 consumer law modernized (Art. 18 = 10-day return right); 33% of state complaints are exactly our case type.
3. **Pattern = "mandated delegation"**: hard-bound policy guard (11 rules, unit-tested), per-action user taps, local memory, learning loop. Gartner says 40% of agent projects die from unclear value + weak risk — we're the opposite (money-verified delivery + contractually bounded agent).
4. **Why us:** we ARE the users (real accounts, a real lost dispute seeds the demo); native UZ/RU negotiation tone; service-flow maps built by walking the queues; "vakil" + local-only data = culturally native trust.
5. **Control story is the demo:** the agent refuses an out-of-bounds offer and cites the user's own minimum back at the company; WIPE button at the end.

## Architecture (one line)
`Telethon user session (hands, 2FA enforced)` + `aiogram bot (face, official API)` + `LangGraph brain` + `SQLite local memory` + `Mini App` — one local FastAPI process. Cloud LLM default, local 7B tier optional; **local Whisper (uz)** for voice; nothing leaves the device except model prompts.

## Roles & tasks (4 roles — merge if team is smaller)

### 🅰️ ALEX — Session & Security (the D1 gate owner)
- MTProto session manager: phone → code → **2FA check → `edit_2fa` enable wizard** (agent refuses to work without 2FA)
- 30-min spike (do FIRST): `resendBotCallbackQuery` — can we press bot inline buttons? record result, pick fallback
- Flood-aware send queue (1/s per chat, auto-sleep, visible "waiting Xs")
- Local Whisper `uz` (self-hosted) + voice-note → mandate slot extraction
- SQLite schema (incl. `legal_corpus`, `dossiers`, `verifications`, `guardians`), session file perms, **WIPE button wired**
- **EOD-1 GATE: a stranger logs in; 2FA gets forced on; voice note → filled mandate card.**

### 🅱️ BOB — Agent Engine (the brain)
- LangGraph state machine: `open → argue → escalate(L2 human) → L3 state → offer_check → accept/counter/walk → verify → summarize → feedback`
- **BoundaryGuard: 11 rules + unit tests** (value bounds, outcome whitelist, data allowlist, tone, irreversible-action taps, timebox, disclosure, language, **citation-must-resolve-to-corpus**, **dossier-completeness**, **state-threat only if pre-authorized**) — run the suite in repo README
- **Legal corpus (D1 evening):** 2023 Law key articles (Art. 18 first, from kun.uz/lex.uz) + Uzum 14-day policy + Beeline/Ucell terms → sqlite-vec; citations carry source chips
- Escalation ladder: company bot → supervisor → **dossier builder** (`python-docx`, 8 sections) → `@consumergovuz_bot` flow probe (30 min; fallback = paste-ready draft, labeled)
- **Verification loop:** wallet screenshot → vision JSON `{amount, date, channel}` → match/mismatch → "Tasdiqlandi ✅" (5 fixture screenshots + tests)
- Learning loop: 👍/👎 + tags → typed preference rows with provenance → next mandate pre-filled ("from M-XXXX")
- **EOD-2 GATE: full negotiation incl. below-min offer → guard fires → user taps "hold" → law citation in live reply → resolution → screenshot → verified close → dossier .docx exports.**

### 🅲️ CATE — Mini App & Front
- Mini App: onboarding wizard (8 steps, UZ/RU), mandate form, **live case timeline with guard tags**, prefs page (editable, provenance badges), search UI + price table, **guardian read-only link** (one tap), WIPE
- Cloudflare tunnel (booth) + `make demo` script (seeds everything: fixtures, corpus, 4 test channels, 2 wallet screenshots)
- **EOD-3: demo runs end-to-end from `make demo` 6× without failure.**

### 🅳️ DAN — Demo, Pitch & Counterpart
- Build the **simulated `@UzumSupport` bot** (teammate-operated): script = policy denial → **below-min offer** → supervisor grant; also a "refuse" branch for the dossier beat
- Real-bot read-only walks: `@UzumBank_Robot` / `@Ucell_bot` menus (record flows into `official_bots.known_flows`)
- Pre-seed 3–4 test channels with realistic UZ posts (iPhone 15, PS5…) + watcher trigger plan
- **The 90s demo script (§ below) — rehearse 6×; record 3-min backup video**
- Pitch: 5-min script in v2 doc §6 — dry-run ×2, timed to 5:00
- Two phones on the table: "user" + "Uzum support"; third phone = "family member" (guardian view)

## The 90-second demo (non-negotiable beats)
| Beat | Moment |
|---|---|
| 1 | **State** — 2FA ✓, data on-device; family phone already shows live timeline |
| 2 | **Voice mandate** — 12s voice note (UZ) → local Whisper → card populates → tap Boshla |
| 3 | **Negotiation** — real account → Uzum bot: denial → **300k offer < 450k min → guard fires → judge taps HOLD → agent cites Art. 18 + own minimum** |
| 4 | **Money lands** — wallet screenshot in → "Tasdiqlandi: 450k, 14-sentabr ✅" |
| 5 | **State ladder** — "agar rad etsa?" → dossier .docx (law + photos + chat log) → "Tayyor: @consumergovuz_bot / 1159" |
| 6 | **Learning + search + WIPE** — 👎 → pref row with provenance → 2nd mandate pre-filled · "iPhone 15" → price table + watcher ping · **WIPE** (end) |

**Injected failure (keep):** one visible flood-wait pause mid-Act 3 ("kutmoqda: 8s — rate limit") → resumes. Designed, graceful.

## Must / Must NOT (scope discipline — say it in the pitch)
- **MUST:** honor every EOD gate or cut features, never slip gates; rehearse the 3 hero beats (guard refusal, money-verified, WIPE) more than anything; honesty lines scripted (ToS numbers, simulated-vs-real split, "never moves money")
- **MUST NOT:** auto-submit anything irreversible (user taps only) · auto-mention state escalation (pre-auth only) · cite law outside the corpus · store the 2FA password (never) · touch money · TTS replies · multi-device · cold-contact anyone · let any new feature block the core loop

## Top risks (30-second version)
| Risk | Kill it with |
|---|---|
| Build complexity | D1/D2/D3 gates above; every new feature = small tool with visible fallback |
| Live 2FA on stage | Pre-seeded session; judge's 2FA entry IS the security demo; fallback recording ready |
| ToS question | "Personal automation of own account, ~100× under flood limits, disclosed, conservative mode" — numbers, not apology |
| State bot opaque in build week | Dossier is the hero; live submission has paste-ready fallback (labeled as design: "final tap stays human") |
| UZ voice quality | Self-hosted Whisper `uz` (clean short audio is fine); slot extraction + one clarifying question as fallback |

## Sources that matter (if judges ask)
Uzum 20M MAU / $11.1B payments (IntelliNews 2026) · e-com 40% CAGR, 3% of retail (KPMG via Forbes; INFOLine via Kursiv) · Art. 18 + 33% of complaints (Kun.uz) · 2023 law (CyberLeninka) · 1159 + @consumergovuz_bot (davlat.uz, t.me) · Gartner 33%-by-2028 / 40%-canceled (BigDATAwire) · full index: v2 doc §9

---
**Start order for day 0 (tonight, 2h max):** ALEX: `resendBotCallbackQuery` spike + api_id/api_hash + test account. BOB: guard repo skeleton + test runner. CATE: Mini App template + tunnel. DAN: write the `@UzumSupport` script (10 lines of branches) + book the two test phones. **Then sleep — the gates don't move.**
