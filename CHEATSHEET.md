# Cheat sheet · squad C · Insight

> One page. Your mission, phase by phase, with example prompts: `MISSION.md`.

## Two places to type

| Where | What goes there | Example |
|---|---|---|
| **Claude Code** (`claude`, in the terminal) | Prompts in your own words, and the skills below | `/welcome`, "Read squad B's contract and list what we need from it" |
| **The terminal** (a second terminal, or `!` before a command inside Claude) | The commands only a human runs | `npm run flag -- reminders_pilot_kpi on --reason "…"` |

Claude runs in **auto mode**: it does not ask before each command. The harness still blocks what matters (flag, reference tests, Core Billing, other squads' folders).

## Skills (type them in Claude Code)

| Skill | When |
|---|---|
| `/welcome` | First thing: checks your environment and explains your slice |
| `/nexus` | Pull the shared context and see what changed (after another squad publishes, after the business speaks) |
| `/contract-diff` | Something you depend on changed version: what changed, and where it hits your code |
| `/publish` | Publish your squad's files to the Nexus (only `teams/squad-c-insight/`) |
| `/gate G1` … `/gate G4` | Before asking the gate keeper: runs the check, explains each red line |
| `/speckit-constitution` → `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` | The spec chain, in this order |
| `/graphify` | The code graph (also: `npm run graph`, then ask Claude to query it) |

## Commands (terminal)

| Command | What it does |
|---|---|
| `npm run gate -- G1` | The machine check for a gate (G1 to G4). Green, then call the gate keeper |
| `npm run context` | Rebuild what Claude reads from the Nexus (pulls first) |
| `npm run spec:publish` / `npm run spec:pull` | Move your Spec Kit spec, plan and tasks to the Nexus / get them in your Codespace. Then `/publish` |
| `npm run spec:publish -- --repin` | Same, re-pinning on the current versions, once you have read what changed |
| `npm test` · `npm run test:reference` · `npm run test:coverage` | Your tests · the business's acceptance examples · coverage |
| `npm run graph` | Build the code graph of this starter, Core Billing included |
| `npm run deprecated` | Core Billing symbols you must not build on |
| `npm run deploy` · `npm run observe` | Deploy on port 3003 · check it answers, read its metrics |
| `npm run flag -- reminders_pilot_kpi on --reason "…"` | **Human only, after the gate keeper's G3 GO** |

## What a human does by hand

- **Sign:** in the editor, set `owner:` to your `first.last` and `status: active` on your intent, spec, contract and runbook. Claude will not do it.
- **Switch the flag**, with a reason, after G3 GO. Then `/publish` (the journal) and `npm run deploy` again.
- **Talk:** a question for another squad or the business → walk over and ask. Claude must not answer it for them.

## Gates

| Gate | Green when | The gate keeper asks |
|---|---|---|
| G1 Ready to Spec | intent published, 5 sections, a number, a source on every claim, owner, status active | Who set that number? What if you are wrong? |
| G2 Ready to Build | spec with ≥ 3 acceptance criteria (Given/When/Then), contract ≥ 1.0.0 active, every pin current | Show me a field you exchange with the other squad: name, type, unit, on both sides |
| G3 Ready to Release | lint, typecheck, reference tests, coverage ≥ 70 %, one test per AC, no secret, nothing stale | What did the agent get wrong the first time? Who reviewed it? |
| G4 Released and Observable | flag on by a human with a reason, runbook with owner and rollback, service answering, all published | Who decides to switch it off, and how fast? |

## When stuck

| You see | Do |
|---|---|
| A gate line in red | `/gate Gx`: it explains the line and the fix |
| "stale" or "BREAKING" in `/nexus` | `/contract-diff`, read the change, then update and re-pin |
| `[harness · blocked: …]` | Expected: that action is a human's, or not yours. Read the message |
| Stuck more than 5 minutes on tooling | Raise your hand |
