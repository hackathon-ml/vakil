# VAKIL — 4-Person Battle Plan (D1–D3)
**One detailed, strict track per person · English · everything traces to `vakil-v2-winning-edition.md` + `idea1-vakil-deep-dive.md`**

**The team**
- **P1 — BRAIN** · AI/agent engineer (negotiation engine, guard, legal corpus, memory)
- **P2 — FACE** · Mini App UI/UX (the control surface judges trust)
- **P3 — HANDS** · Bot backend (real Telegram session, 2FA, data, search, dossier)
- **P4 — VOICE** · Presentation & demo (pitch, runbook, counterpart bot, rehearsal)

---

## 0. War-room rules (all four, non-negotiable)

1. **Contract before code.** D1 09:00–09:30, all hands, one room/screen: freeze the 4 shared artifacts below. After 09:30 nobody changes an interface without a standup decision.
2. **Git discipline.** One repo, one branch per person (`p1-brain`, `p2-ui`, `p3-hands`, `p4-demo`). Commit every 2h. Merge to `main` twice daily (12:00, 18:00). Session files and secrets: gitignored, chmod 600, verified at D1 standup.
3. **Standups.** 10:00 (10 min: what's broken / what I need) and 18:00 (gate check against each person's EOD gate). Phones in pockets.
4. **Scope freeze.** No new features after **D2 12:00**. D3 = bugs + rehearsal only. **D3 18:00: full code freeze.**
5. **Demo-critical wins.** Only the 6 demo beats matter (see §P4). Anything not on the demo path is a roadmap line, said in the pitch.
6. **Honesty rule.** Any demo step you can't guarantee live must have a **visible fallback** by EOD D2 — not a hidden one.
7. **Conflict rule.** If two tracks collide: the Hands API (P3) is the source of truth. If P3 is absent → wait for standup. No hallway decisions; decisions go to `DECISIONS.md`.

**The 4 shared artifacts (freeze at D1 09:30)**

| # | Artifact | Owner | Consumers |
|---|---|---|---|
| 1 | **Hands API** (P3 implements): `send(dialog, text, media?)` · `observe(dialog, limit)` · `press_button(dialog, ref)` (spike decides fallback) · `search_global(q, since_days, dialogs?)` · `iter_new(dialog_ids, since_id)` | P3 | P1 |
| 2 | **Case Bus events** (P1 emits): `case.created{mandate}` · `turn.outbound{text, guard_verdict, citation?}` · `turn.inbound` · `guard.escalation{violation, offer, options[accept\|hold\|stop]}` · `case.resolved{outcome, amount?, article?}` · `verification.result{expected, observed, verdict}` · `dossier.ready{path}` | P1 | P2, P3 |
| 3 | **Mini App endpoints** (P3 serves): `GET /case/{id}` · `POST /case/{id}/decision{action}` · `GET/POST /prefs` · `GET /search?k=` · `POST /watch` · `POST /wipe` · `GET /case/{id}/guardian?token=` | P3 | P2 |
| 4 | **Mandate schema** (JSON, v1 §5.2): objective, counterpart, bounds{min_value, acceptable_outcomes, max_wait_hours, non_negotiables, allow_state_threat}, evidence[], strategy, learned_seeds[] | P1 (canonical) | all |

---

## P1 — BRAIN · AI/Agent Engineer

**Mission.** Build the brain so the **three hero beats are flawless**: (a) the guard refuses an out-of-bounds offer, (b) the agent cites a real law article with a source chip, (c) the case closes only when the money is verified.

**One clarification (say it in the pitch):** we do **not** train a model. The LLM is rented; the intelligence we ship is **architecture** — prompts + strategy + policy guard + legal corpus + preference memory + eval harness. *"The model is a commodity. The mandate, the guard, and the memory are the product."*

**You own.** LangGraph state machine (v2 §4) · BoundaryGuard 11 rules + unit tests · legal corpus (scrape → structure → embed → cite) · negotiation prompts (UZ/RU tone) · voice → mandate slot extraction · verification vision (JSON schema + 5 fixtures) · learning loop (typed prefs + provenance + prefill) · eval harness.

**Deliverables (checkboxes are the gate):**
- [ ] D1 EOD — Guard: **all 11 rules implemented + unit tests green** (value bounds, outcome whitelist, data allowlist, tone, irreversible-action tap, timebox, disclosure, language, **citation-must-resolve**, **dossier-completeness**, **state-threat-only-if-preauthorized**)
- [ ] D1 EOD — Legal corpus v1: Art. 18 (10-day return right) + Uzum 14-day policy + Beeline/Ucell public terms → `legal_corpus` table (article, text, source_url, fetched_at) → `cite(query)` works → **a fake citation is blocked and logged** (test)
- [ ] D1 EOD — Local Whisper (`uz`, self-hosted): 15s voice note → slot JSON, verified on 3 fixture clips
- [ ] D2 EOD — Full loop vs P4's simulated bot: denial → **below-min offer → `guard.escalation`** → user "hold" → **outbound reply contains the law citation + the user's own minimum** → resolution
- [ ] D2 EOD — Verification vision: 5 fixture screenshots (2 match, 2 mismatch, 1 garbage) → correct JSON every time (tests)
- [ ] D2 EOD — Learning: 👎 + "erta topshirdi" → typed pref row with provenance → **second mandate card pre-filled from it** (assertion test)
- [ ] D3 — Eval harness: 10 scripted counterparty transcripts → **0 guard violations**, win rate reported; prompt tuned; frozen

**Day plan.**
- **D1** — 09:00 contract freeze · 09:30–12:00 guard rules 1–8 + tests · 12:00 merge · 12:00–14:00 rules 9–11 + tests · 14:00–18:00 legal corpus (scrape Art. 18 from Kun.uz/lex.uz, Uzum 14-day, Beeline/Ucell terms → structure → sqlite-vec → `cite()` + block test) · **GATE: `guard tests` green + corpus cites and blocks.**
- **D2** — 09:00–12:00 state machine + prompts (opening-with-disclosure, factual-argue, polite-escalate, law-move, close — UZ tone rule: *respectful persistence, never aggression*) · 12:00 merge · 12:00–15:00 integration loop vs P4's bot (P4 must be running) · 15:00–17:00 verification vision + fixtures · 17:00–18:00 learning loop + prefill · **GATE: the 3 hero beats run live, 3 consecutive times, uncut.**
- **D3** — 09:00–12:00 eval harness (10 transcripts) + fix the single biggest failure mode · 12:00 merge · 12:00–14:00 prompt polish (RU counterparty handling, tone) · **14:00 P1 code freeze** · 14:00–18:00 rehearsal support (fix top-3 wobbles only).

**Top risks.** (1) LLM over-commits → the guard is the last line of defense; add an LLM self-check JSON (intended commitment) *before* the guard, so rewrites are cheap. (2) lex.uz access flaky during the hack → corpus fallback = official summaries (Kun.uz, Daryo, agency pages), each entry still carries source URL + fetch date. (3) UZ tone sounds foreign → **P4 hears every prompt change at the D2 standup** (native check).
**Definition of done.** A below-minimum offer has never left the device without a user tap — and the test suite proves it.

---

## P2 — FACE · Mini App UI/UX

**Mission.** Make the control surface feel like a product judges will trust: onboarding that *enforces security*, a live timeline where every guard decision is visible, preferences that show their provenance, and a WIPE that ends the demo on trust.

**You own.** Mini App (single-page, mobile-first, dark) · design system (poster palette: `#070D1A` navy, `#2AABEE` blue, `#F5C542` gold, `#34D399` green) · all UI copy (UZ/RU/EN toggle — **P4 approves every line, D2 standup**) · Case Bus consumer · escalation modal · prefs page · search UI + price table · guardian read-only view · WIPE · Cloudflare tunnel · `make demo` seed data.

**Tech call (decide at D1 standup, then stop deciding):** plain HTML/CSS/JS + htmx or React — whichever P2 knows fastest. No frameworks newer than last year. One page, tabbed.

**Deliverables.**
- [ ] D1 EOD — Tunnel public; **onboarding wizard (8 steps, v1 §5.1)** clickable end-to-end on mock session state; design system + 5 components (card, chip, timeline-row, modal, stat)
- [ ] D1 EOD — **Mandate form**: every bounds field present, required-validation mirrors P1's card completeness (an incomplete card can never be submitted from the UI)
- [ ] D2 EOD — **Live case timeline**: consumes Case Bus; every outbound turn tagged `guard: PASS / REWRITE / ESCALATED`; citations render as source chips `[18-modda · Qonun, 2023]`; works on two phones (owner + guardian read-only via token)
- [ ] D2 EOD — **Escalation modal**: shows the exact violation ("offer 300k < your min 450k") + 3 buttons `accept-exception / hold / stop` → `POST /decision` → timeline reflects the decision
- [ ] D2 EOD — **Prefs page**: editable typed rows, provenance badge per row ("48h — M-0007 dan"), delete-any-row
- [ ] D3 — Search UI + **price table** (fixture data) + watcher arm button · WIPE (fast, satisfying, irreversible-looking) · contrast/size pass on a real phone screen · frozen

**Day plan.**
- **D1** — 09:00 read P3's endpoint list (you are the first consumer) · 09:30–12:00 design system + scaffold + tunnel · 12:00 merge · 12:00–15:00 onboarding wizard steps 1–8 (2FA-enforce copy: "Vakil 2FAsiz ishlay olmaydi") · 15:00–18:00 mandate form + validation · **GATE: wizard + form clickable at a public URL.**
- **D2** — 09:00–12:00 timeline (event consumer; **polling fallback every 2s behind the same UI** if the event stream is flaky) + guard tags + citation chips · 12:00 merge · 12:00–15:00 escalation modal + decision POST + state sync · 15:00–17:00 prefs page + provenance · 17:00–18:00 guardian read-only view (token) · **GATE: live timeline shows a simulated case; modal sends a decision that P3's endpoint accepts.**
- **D3** — 09:00–11:00 search UI + price table · 11:00–13:00 WIPE UX + polish pass on every demo screen · 13:00–14:00 real-phone check (sizes, contrast, UZ glyph spacing) · **14:00 freeze** · 14:00–18:00 **you are the tablet operator in the demo** — write the tap-by-tap choreography into P4's runbook; rehearse it until it's muscle memory.

**Top risks.** (1) Event stream flaky mid-demo → the 2s polling fallback is already behind the same UI (it's a design, not an apology). (2) Scope creep ("one more page") → only pages on the demo path exist; everything else is a slide. (3) UZ copy reads like a translation → P4's native check at D2 standup is a gate, not a courtesy.
**Definition of done.** A judge follows the entire negotiation on the tablet and never asks "what does this mean?"

---

## P3 — HANDS · Bot Backend / Session

**Mission.** Own everything that touches **real Telegram**: the user session with 2FA enforcement, the flood-aware queue, the bot face, the local data layer, search/watchers, and the dossier export. You make the **security story flawless** — it is the trust foundation of the whole product.

**You own.** Telethon session manager (phone → code → `account.getPassword` check → **`edit_2fa` enable wizard** → 2FA key entry once; password never stored) · **`resendBotCallbackQuery` spike — do it FIRST, 30 min, hard deadline D1 10:30** · flood-aware send queue (1/s per chat, auto-sleep on `FloodWaitError`, visible "waiting Xs" state) · aiogram bot face (DM, inline buttons, webhooks, Mini App host) · FastAPI (the 7 endpoints, artifact #3) · SQLite (all tables v1 §7 + v2 `legal_corpus`, `dossiers`, `verifications`, `guardians`) · `searchGlobal` + scoped `messages.search` + ranking + jump links · watcher (2-min cadence, `iter_new`) · dossier export (`python-docx`, 8 sections, completeness checked by P1 rule #10) · `@consumergovuz_bot` probe (30 min, D3) · fixtures seeding inside `make demo`.

**Deliverables.**
- [ ] D1 10:30 — **Spike documented in `DECISIONS.md`:** can the user session press bot inline buttons? If no → fallback chosen (text command OR user-taps-final-confirm). *Never discover this on demo day.*
- [ ] D1 EOD — **Stranger login flow works on a real test account:** phone → code → 2FA was off → wizard forces it on → 2FA key entered → session file on-device, chmod 600, gitignored
- [ ] D1 EOD — FastAPI skeleton + full SQLite schema + **WIPE wipes every table** (tested) + tunnel URL public
- [ ] D2 EOD — Bot face live: DM intake (text + voice note passed to P1), escalation inline buttons wired to `POST /decision`, guardian token issue/revocation
- [ ] D2 EOD — Search: `searchGlobal` + scoped + recency ranking + jump links, verified against 4 seeded channels; watcher armed → new post → bot-DM ping with jump link
- [ ] D2 EOD — **Dossier export**: one tap → real `.docx` (citizen, counterparty, order ref, narrative, law citations w/ sources, policy citations, evidence list, demand, signature line)
- [ ] D3 — `@consumergovuz_bot` read-only walk documented in `official_bots.known_flows` (if opaque → paste-ready fallback, labeled as design) · `make demo` runs **6/6** cold starts · full-system run recorded (backup)

**Day plan.**
- **D1** — 09:00 contract (you author the Hands API + endpoint list — artifact #1 and #3 are yours to write) · **09:30–10:30 button spike** · 10:30–12:00 session manager + 2FA wizard · 12:00 merge + standup (spike result read aloud) · 12:00–14:00 flood queue + FastAPI skeleton + SQLite · 14:00–16:00 onboarding code paths (code entry, MFA key entry, scope picker) + WIPE · 16:00–18:00 fixture seeds (4 test channels with realistic UZ posts, 2 wallet screenshots, 1 voice note) · **GATE: stranger login + 2FA enforced + WIPE, at the public URL.**
- **D2** — 09:00–12:00 bot face (aiogram) + guardian tokens · 12:00 merge · 12:00–15:00 search + watcher · 15:00–17:00 dossier export + docx template · 17:00–18:00 Case Bus integration (your events render in P2's live timeline) · **GATE: an outbound message leaves via the real session and the same event lands in the Mini App timeline.**
- **D3** — 09:00–11:00 `@consumergovuz_bot` probe + flow doc · 11:00–13:00 `make demo` 6× + flake fixes · 13:00–14:00 record the full-system backup run · **14:00 freeze** · 14:00–18:00 on-call for rehearsals (top-3 wobbles only).

**Top risks.** (1) Button spike fails → fallback decided at 10:30, documented, rehearsed. (2) Live 2FA wobbles on stage → pre-seeded session + P4's backup recording; the judge's 2FA entry is the security demo, so the happy path must be silky. (3) Flood wait mid-demo → by design it's *visible* ("kutmoqda: 8s — rate limit") — it reads as engineering, not luck. (4) Session file leaks → chmod 600, gitignored, verified at every standup; **the booth laptop is the only server; say so.**
**Definition of done.** The demo runs on a real Telegram account and not one byte of case data touches a third-party server — provable on the spot (process list + network view at the booth).

---

## P4 — VOICE · Presentation & Demo

**Mission.** Own the room. The 5-minute pitch, the 90-second demo operation, the counterparty bot, every fixture, rehearsal discipline, and Q&A armor. **The demo succeeds or dies in your hands — even when the code fails, your runbook saves it.**

**You own.** Simulated **`@UzumSupport` bot** (runs on your phone; 4 branches: instant-yes / policy-denial + **below-min offer** / supervisor-grant / hard-refuse-for-dossier) · **demo runbook** (beat-by-beat: who taps what, when, and the failover line for each beat) · three phones on the table (user · counterparty · family guardian) · **pitch deck** (7 slides, cut from the poster) + 5-min script (v2 §6, timed) · **backup video** (3-min perfect run) · fixtures (recorded 12s UZ voice note; 4 seeded channel posts incl. iPhone 15 + PS5; 2 wallet screenshots match/mismatch) · Q&A card (10 hardest questions, 20-second answers) · booth layout.

**Deliverables.**
- [ ] D1 EOD — Counterpart bot live with all 4 branches (P1 trains against it from D2 12:00)
- [ ] D1 EOD — **Runbook v1**: 6 beats × (trigger, action, owner, failover line, timing)
- [ ] D1 EOD — All fixtures recorded/designed and in the repo (voice note, channel posts, screenshots)
- [ ] D2 EOD — Deck (7 slides: title → problem+why now → product+pattern → **demo handoff** → why us → numbers → roadmap) + 5-min script timed ×2 (≤5:00, with a pre-planned cut line) + Q&A card
- [ ] D3 — **6 full rehearsals** with stop-fix-repeat discipline · backup video recorded (best run) · final one-page runbook **printed, on the table** · dress rehearsal

**Day plan.**
- **D1** — 09:00 contract (**you write the acceptance criteria for the 90-second demo first — 9 bullets — everyone builds to them**) · 09:30–12:00 counterpart bot (script: denial → below-min → grant; refuse branch) · 12:00 merge + standup · 12:00–15:00 fixtures (record the voice note with a teammate; design the 4 channel posts as realistic UZ posts; 2 screenshots) · 15:00–18:00 runbook v1 + dry-run the beats against P3's onboarding (whatever exists) · **GATE: counterpart + fixtures + runbook exist.**
- **D2** — 09:00–12:00 deck from poster (keep the poster's words — they're already pitch-grade) · 12:00 standup: **you approve P2's UZ copy (native check, gate-level)** · 12:00–15:00 timed script ×2 + apply the cut · 15:00–17:00 Q&A card: *ToS? / What stops overcommitting? / Why won't Sierra or Telegram do this? / Isn't it a chatbot? / Is Art. 18 really 10 days? / What if the state bot changes? / Why not just a chat with the support bot?* (answers: v1 §11 + v2 §7) · 17:00–18:00 **first full-team rehearsal** (all three systems live) + issue list · **GATE: script timed ≤5:00; first full run completed.**
- **D3** — 09:00–12:00 rehearsals #2–#4 (stop → fix → repeat; the 3 top wobbles only, from P1/P2/P3 freeze) · 12:00 standup · 12:00–15:00 rehearsals #5–#6 + **record backup video** · 15:00–16:00 booth layout (2 phones on table, tablet charged, printed runbook, backup laptop) · 16:00–18:00 dress rehearsal → **after 18:00 nobody touches code; the team rests.**

**Top risks.** (1) Demo derails live → the runbook carries **3 rehearsed failover lines** (if X, say Y, cut to Z) — rehearse the failures like the happy path. (2) Pitch overruns → one cut per dry run; the cut list is pre-agreed. (3) Your counterpart bot stumbles (it's your phone) → your line: *"support bots are as human as the real ones — watch the agent handle it"* — the wobble becomes the resilience demo. (4) Judge asks something unprepared → universal fallback: *"that's exactly what the guard is for — watch what happens to that request in the system"* and open the UI.
**Definition of done.** The demo works even when it fails: every failure has a rehearsed, graceful, honest path.

---

## The 6 demo beats (the only score that matters)

| # | Beat | Owner of the beat | Fallback owner |
|---|---|---|---|
| 1 | Onboarding: 2FA enforced, "data on this device" | P3 | P4 (recording) |
| 2 | Voice mandate: 12s UZ voice note → card populates | P1 | P4 (pre-filled card) |
| 3 | **Guard refusal**: below-min offer → modal → "hold" → **law citation + user's own minimum** | P1 | P4 (replay of beat 3 from rehearsal) |
| 4 | Verified close: screenshot → "Tasdiqlandi: 450k ✅" | P1 | P4 (pre-verified state) |
| 5 | State ladder: dossier .docx + "@consumergovuz_bot / 1159 tayyor" | P3 | P4 (pre-exported dossier) |
| 6 | Learning + WIPE: 👎 → pref row with provenance → pre-filled 2nd mandate → WIPE | P1/P2 | P4 (screenshot) |

## Day 0 — tonight, 2 hours, all four

- **P1:** repo + guard test runner + Whisper installed (verify `uz` on one clip)
- **P2:** scaffold + design tokens (from the poster) + tunnel account created
- **P3:** `api_id`/`api_hash` + test Telegram account + repo + `main` + gitignore (session files, secrets)
- **P4:** write the **9 acceptance bullets** for the 90-second demo + counterpart bot branch list
- **22:00:** 10-minute group call: contract draft review. **Then sleep — the gates don't move.**
