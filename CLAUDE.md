# CLAUDE.md · squad C · Insight

You work for **squad C · Insight** of the AI-augmented PDLC hackathon, on the fictional "smart payment reminders" case.
Your squad's slice: Measure the pilot: which invoices were reminded, how many were paid within 7 days, the payment delay, the fees scheduled.

## Assembled context

The mission context is produced by the Context Assembler of the Context Nexus and imported here:

@.context/brief.md

If it is missing or outdated, run `npm run context` (or `/nexus`), then read what changed.

## Working rules

- The shared Context Nexus is in `../context-nexus/`. You may **read** all of it. You write **only** in `../context-nexus/teams/squad-c-insight/`, and only when a human of the squad asks.
- Intent (what we build) and Contracts (what we require) are decided by humans. You draft; you never set an `intent/` or `contracts/` artefact to `status: active` yourself, and you never sign a gate.
- The other squad's contract is the truth as pinned in the brief. If you find a gap (name, type, unit, format) between our code or contract and theirs, **stop and report it** with both excerpts, instead of picking an interpretation.
- If the brief reports a `stale` artefact or a pinned version that changed, do not write new code on that basis until the squad has read the change (`/contract-diff`).
- `test/reference/` holds the programme's reference tests, generated from the business's acceptance examples. They are read-only. Make the code pass them.
- Spec Kit order: `/speckit-constitution` → `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`. The constitution comes pre-filled with the organisation's rules; `/speckit-constitution` only adds the business rules (RR-xx) of this slice, each with its id. Nothing in it without a source id.
- Acceptance criteria in the spec carry ids `AC-1`, `AC-2`… and are written Given / When / Then. Every criterion has at least one unit test in `test/unit/` whose name starts with its id (ENG-02).
- Every feature sits behind the feature flag `reminders_pilot_kpi`, off by default. You never switch a flag: the harness blocks it. When asked to, say who decides: the squad's Decision Guarantor, after the gate keeper's G3 GO. Do not hand out the switch command before G3 is GO.
- `src/billing/` is **Core Billing**, existing production code owned by another team (ORG-08). Reuse it, never modify it (the harness blocks edits). Before writing any helper (days between dates, business days, Paris time, amounts, outstanding balance, templates), look for it there with the graph. Do not build on anything marked `@deprecated`: the graph does not show it, `npm run deprecated` does.
- In `/speckit-clarify`, a question about the other squad's contract or about the business's ambition is not yours to answer: do not propose an answer, mark it `[To confirm: <the other squad or the Head of Receivables>]` and tell the humans to go and ask.
- Source tags: the Head of Receivables' date is the day they answered (the session day), not the dataset's reference day.
- Code always takes `today` / `now` as parameters, never the system clock (decision D-06).
- Code and specs in English. Be concise: read a precise file rather than the whole repository.
- Shell: one simple command per call, run from the starter folder. No `cd … &&`, no pipes into scripts, no `sed -i`: use the file tools to edit. Compound commands stop on a permission prompt for the humans.
- The spec travels with `npm run spec:publish` (to the Nexus) and `npm run spec:pull` (from it): never copy it by hand.

## This starter

- Fastify API in TypeScript (Node 22). The slice's route is in `src/routes.ts`, behind the flag in `flags.json`.
- The domain function to implement is in `src/domain/`: it is a **stub** that throws `NotImplementedError`.
- Squad C implements `measurePilot` in `src/domain/measure-pilot.ts`. The route `GET /v1/pilot/kpi?from=…&to=…` is already wired to it.
- Core Billing (`src/billing/reporting/`) already computes the share paid within N days (`paidWithinRate`) and the average payment delay (`averagePaymentDelay`) for the finance dashboard. Reuse them: the pilot's figures must match finance's (D-07). Find them with the graph.
- `src/mocks/reminder-plan.ts` mocks squad B's `reminder-events` contract **v0**, and a small pilot log built on it. When squad B publishes v1, align the mock and your input type with the published contract, field for field, and pin that version in your spec and contract.
- `MISSION.md` (the squad's mission and example prompts per phase) and `CHEATSHEET.md` (commands) are for the humans; you may read them to know which phase they are in.
- `src/billing/` is Core Billing (ledger, customers, calendar, money, templates, notifications, exports, reporting, and `dunning-v0/`, the manual chasing export this programme will replace). See `src/billing/README.md`.
- `data/` holds the synthetic pilot dataset (reference day 2026-11-20). Amounts are always integer **cents**.

| Command | What it does |
|---|---|
| `npm test` | Unit tests (`test/unit/`) and Core Billing's tests (`test/legacy/`) |
| `npm run test:reference` | The programme's reference tests (`test/reference/`) |
| `npm run test:coverage` | All tests, coverage ≥ 70 % |
| `npm run lint` / `npm run typecheck` | Code quality |
| `npm run scan` | No secret, no bank data (SEC-01, SEC-02) |
| `npm run context` | Re-assemble `.context/brief.md` from the Context Nexus |
| `npm run publish -- -m "…"` | Publish `teams/squad-c-insight/` to the Context Nexus |
| `npm run gate -- G1` | Automatic gate-check (G1 to G4): run it before asking the gate keeper |
| `npm run deprecated` | Core Billing's `@deprecated` symbols, and whether our code imports one |
| `npm run spec:publish` / `npm run spec:pull` | Spec Kit spec and working files to / from `teams/squad-c-insight/intent/specs/` (then `/publish`) |
| `npm run deploy` / `npm run observe` | Local deploy on port 3003, health and metrics (G4) |
| `npm run flag -- reminders_pilot_kpi on --reason "…"` | Traced flag switch: **human only**, never run it yourself |

## Code graph (Graphify)

`npm run graph` builds a knowledge graph of this starter's code, Core Billing included, in `graphify-out/` (local tree-sitter analysis: nothing leaves the machine). Open `graphify-out/graph.html` to see it.
- Use it first to find what Core Billing already offers: `graphify query "outstanding balance"`, `graphify explain "nextBusinessSlot"`.
- When `graphify-out/graph.json` exists, run `graphify query "<question>"` before your first grep or source-file read for a codebase question. Use `graphify path "<A>" "<B>"` for relationships, `graphify explain "<concept>"` for one concept, and `graphify affected "<symbol>"` to see what a change impacts.
- After modifying code, run `graphify update .` to keep the graph current (no API cost).
- `/graphify src` rebuilds it from the skill; keep it on `src` so it stays code-only and fast.

Skills of this harness: `/welcome`, `/nexus`, `/publish`, `/gate`, `/contract-diff`, the `/speckit-*` commands, and `/graphify`.
