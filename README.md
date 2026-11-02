# Squad C · Insight

> AI-augmented PDLC hackathon · fictional case "smart payment reminders" · synthetic data only.

**Your slice:** Measure the pilot: which invoices were reminded, how many were paid within 7 days, the payment delay, the fees scheduled.

## Start (5 minutes, before the session)

1. Open this repository in a **Codespace** (green *Code* button → *Codespaces* → *Create*), or locally: clone it next to the Context Nexus (`Zenika-Training/kolecto-sdlc-workshop-context-nexus`, cloned as `context-nexus`) and run `bash .devcontainer/post-create.sh`.
2. In the terminal: `claude auth login` with the Claude account you were given.
3. `claude`, then type **`/welcome`**.

Your mission, phase by phase, with example prompts: **`MISSION.md`**. All commands on one page: **`CHEATSHEET.md`**.

## The cycle you will run

| Phase | You produce | Gate (`npm run gate -- Gx`, then the gate keeper) |
|---|---|---|
| Discover | Business Intent Spec, in the Nexus | **G1** Ready to Spec |
| Design | Spec (Spec Kit) + contract v1, in the Nexus | **G2** Ready to Build |
| Develop | Code + tests; reference tests green | **G3** Ready to Release |
| Deploy | Deployed, flag switched on by a human, runbook | **G4** Released and Observable |

## Where things are

| | |
|---|---|
| `CLAUDE.md`, `.claude/` | The harness: instructions, permissions, guardrail hook, skills |
| `.context/brief.md` | What Claude reads, assembled from the Context Nexus (`npm run context`) |
| `../context-nexus/` | The shared Context Nexus: you read everything, you write only in `teams/squad-c-insight/` |
| `src/domain/` | The function to implement (a stub for now) |
| `src/billing/` | **Core Billing**: existing production code of another team. Reuse it, never modify it. `npm run graph` shows what it offers and who depends on what |
| `test/unit/` | Your tests · `test/reference/` the programme's reference tests (read-only) · `test/legacy/` Core Billing's tests |
| `.specify/` | Spec Kit: templates and constitution |

Skills: `/welcome` · `/nexus` · `/publish` · `/gate` · `/contract-diff` · `/speckit-*` · `/graphify`.

Switching the feature flag is **yours, not Claude's**: `npm run flag -- reminders_pilot_kpi on --reason "…"`.
