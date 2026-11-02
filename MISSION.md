# Mission · squad C · Insight

> Your goal, who does what, and for each phase: the commands and **example prompts**. The examples worked in rehearsal: **adapt them, don't paste them**. Your own words, your own questions, work better. One page of commands: `CHEATSHEET.md`.

## Your slice

You build `measurePilot` (`src/domain/measure-pilot.ts`): over a period: how many invoices were reminded, how many were paid within a week, the payment delay, the fees asked. Rules: **RR-10 to RR-13** in the business rules. Exact expected outputs: the reference cases.

- **You read:** squad B's plans (`reminder-events`), which depend on squad A.
- **Who reads you:** the Head of Receivables reads your figures at day 60.
- You publish one contract: **`pilot-kpi`**. You publish last: wait for squad B's v1 and pin it. Meanwhile, write your side from the business rules and the reference cases.

## Who does what (three people)

Pick the hats yourselves. A split that worked:

| Seat | Hats | Mostly |
|---|---|---|
| **Pen** | Specification Engineer + Context Engineer | holds the pen on the intent and the spec, reads the other squads' contracts, keeps the pins current |
| **Driver** | Agentic Workflow Orchestrator + Decision Guarantor | owns the contract, drives the code from Develop on, switches the flag |
| **Evaluator** | Evaluation Engineer | checks what the agent produced against the reference cases, finds the edge cases, reviews the tests before the flag goes on |

One Codespace is the **driver station**: at Develop, swap seats, not Codespaces. Working in two Codespaces? The pen runs `npm run spec:publish` then `/publish`; the other runs `npm run spec:pull`.

## How to talk to Claude

Say who you are and what you want, give a limit, then review what comes back. Three habits from the rehearsal:

- **One step at a time:** "Do T001 to T003 only, then stop so I can review."
- **Ask before it edits:** "Show me what changed for us. Don't edit anything yet."
- **Keep other squads' questions for humans:** "Ask me your questions; don't answer anything about squad B: I'll walk over."

## Kick-off · everyone

In Claude Code: `/welcome`. Then:
> I'm <name>, I wear <hats>. <Teammate> holds the pen on the intent. What should I do first in my seat?

## Discover · G1 Ready to Spec

**Goal:** a Business Intent Spec in five answers (problem, users, a success number with a horizon, data, priority and owner), every claim with its source.

**Pen**
> What does the brief **not** say that matters for `measurePilot`? Split it: what's in the Context Nexus, what only the Head of Receivables can answer.

Ask the Head of Receivables (a human, in the room), not Claude, for the number. Then:
> Here is what the Head of Receivables said: <her answers, with today's date>. Copy `templates/business-intent.md` to our folder in the Nexus and draft our intent from it. Tag every claim with its source. Leave owner and status to me.

Review it, set `owner:` and `status: active` yourself in the editor, then `/publish` and `npm run gate -- G1`.

**Driver**
> Read squad B's contract in the Nexus. List what we need from them, field by field, and what is unclear.

**Evaluator**: start with the reference cases.
> Read the `measurePilot` cases in `../context-nexus/programme/payment-reminders/contracts/reference-cases.md` and explain each in one line. Which edge cases do they not cover?

**Done when:** `npm run gate -- G1` is green and the gate keeper says GO.

## Design · G2 Ready to Build

**Goal:** a short spec (Spec Kit) with 3 to 5 acceptance criteria AC-1… in Given/When/Then, and your contract v1. Read the other squad's contract **before** writing yours.

**Pen**: the Spec Kit chain, one command at a time, reviewing each:
> /speckit-constitution The org rules are already in it. Add the business rules of our slice (RR-10 to RR-13), each with its id. Nothing else.

> /speckit-specify measurePilot: for a period, from squad B's planned reminders and the payments, report the reminded invoices by step, the share paid within 7 days, the average payment delay and the fees scheduled, per RR-10 to RR-13, reusing Core Billing's reporting. Short spec: one user story, 3 to 5 acceptance criteria in Given/When/Then.

> /speckit-clarify Ask me your questions, max 3. Don't answer them yourself, above all anything about another squad.

> /speckit-plan then /speckit-tasks. Keep the plan short: one pure function behind the existing route, reuse what Core Billing already does, tests named after the AC.

Then `npm run spec:publish`, set owner and status in the editor, `/publish`.

**Driver**: the contract.
> Write our contract `pilot-kpi` v1.0.0 in `../context-nexus/teams/squad-c-insight/contracts/` from `templates/contract.md`, field by field: name, type, unit, rounding, what happens when there is nothing to measure. Read the fields we take from squad B's published plan, with B's names.

Review it, set owner and status, `/publish`. Once the contract is out, the pen re-pins the spec on it: `npm run spec:publish -- --repin`, then `/publish`.

**Evaluator**, while the spec is written:
> Before the pen's spec lands, give me a checklist: for each reference case and each of RR-10 to RR-13, the one behaviour an acceptance criterion must pin down.

When it lands (`npm run spec:pull`):
> Hold this spec against the checklist: which reference case has no acceptance criterion? Don't edit it, list the gaps for the pen.

**Done when:** `npm run gate -- G2` is green. At minute 35, the contract market: the three contracts on the room screen, field by field.

## Develop · G3 Ready to Release

**Goal:** the code, task by task; one unit test named after each AC; the reference tests green.

**Driver** (start a **fresh** Claude session: a long one re-reads its whole history on every turn):
> I'm the driver now. I ran `npm run spec:pull` and `npm run graph`. Before writing anything, use the graph: what does Core Billing (`src/billing/`) already do that `measurePilot` needs? Give me a table: our need, the existing function, its file. Nothing marked `@deprecated`.

> /speckit-implement Reuse the functions from your table. One unit test per AC, named after its id. Don't touch `test/reference/` or `src/billing/`. Do the first three tasks, then stop so I can review.

Then `npm test`, `npm run test:reference`, `npm run gate -- G3`.

**Pen**: keep the spec right while the code is written; check the acceptance criteria against what the code taught you.

**Evaluator**: the gate keeper may ask for your review before the flag goes on. Read the tests on the driver's screen:
> Here are our unit tests. Is there one test per AC? Which reference case or edge case would still pass with wrong code?

### When the business changes its mind (around minute 50)

The Head of Receivables reads a card. Then, **before prompting anything**:
1. `/nexus`: what is now stale.
2. `/contract-diff`:
   > Show me what changed for squad C, and which of our acceptance criteria and code it hits. Don't edit anything yet.
3. Read the diff yourselves. Then the pen updates the spec, the driver the code and the contract.

You are last in the chain: start from the business rules 2.0.0 (RR-13), then finish when squad B's `reminder-events` 2.0.0 is out; publish `pilot-kpi` 2.0.0. Re-pin the intent and the spec on the new versions (`npm run spec:publish -- --repin`, `/publish`).

**Done when:** `npm run gate -- G3` is green again and the gate keeper says GO.

## Deploy · G4 Released and Observable

**Goal:** live with the flag off; a human switches it on, with a reason; a five-line runbook.

**Driver**, in the terminal (these are yours, not Claude's):
```
npm run deploy
npm run observe
npm run flag -- reminders_pilot_kpi on --reason "<why, and the G3 GO>"
```
Then `/publish` (the flag journal), `npm run deploy` again (the service reads the flag at start), `npm run observe`, and try the feature: `curl -s "http://localhost:3003/v1/pilot/kpi?from=2026-11-01&to=2026-11-30"`

**Pen**:
> Write our runbook in `teams/squad-c-insight/operations/runbook.md` from `templates/runbook.md`, five lines, for our service. The owner is <driver>. Rollback: flag off with a reason, then `npm run deploy`.

Set owner and status, `/publish`. Then `npm run gate -- G4`.

**Done when:** `npm run gate -- G4` is green and you can say, in one sentence, who switches it off and how fast.
