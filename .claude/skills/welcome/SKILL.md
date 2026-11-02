---
name: welcome
description: Welcome the squad at the start of the hackathon. Checks the environment (Context Nexus, assembled brief, tests), then explains in a few lines the squad's slice, what it publishes and reads, the four gates and the first thing to do. Use when the user types /welcome or asks where to start.
---

# /welcome

Goal: in under a minute, the squad knows where it is, and the environment is proven to work.

1. Check, and report each line with ✓ or ✗ (do not fix silently):
   - `.hackathon/ready` exists. If not, stop here: "The Codespace is still being prepared. Wait for **✓ Ready.** in the creation log (Command Palette → *Codespaces: View Creation Log*), then open a new terminal and run claude again." Locally, `bash .devcontainer/post-create.sh` creates it.
   - `../context-nexus/` exists (or `NEXUS_DIR` is set): `ls ../context-nexus/teams`.
   - `npm run context` succeeds; read its pin report.
   - `npm test` is green (unit tests of the starter).
   - `npm run test:reference` runs: it is **expected to fail** with `NotImplementedError` at this stage. Say so.
2. From `.context/brief.md` and `CLAUDE.md`, explain in at most 10 lines:
   - the case in one sentence, and this squad's slice;
   - what the squad publishes and what it reads from the other squad (contract names and pinned versions);
   - the four gates G1 Ready to Spec → G2 Ready to Build → G3 Ready to Release → G4 Released and Observable: a machine gate-check (`npm run gate -- Gx`), then a human gate keeper decides;
   - the hats: Specification Engineer, Context Engineer, Agentic Workflow Orchestrator, Decision Guarantor (+ Evaluation Engineer for a third person). Ask who wears which, do not assign them.
3. First step (Discover): copy `../context-nexus/templates/business-intent.md` to `../context-nexus/teams/<squad>/intent/business-intent.md` **only if the humans ask**, and suggest they first list what the brief does not say and ask the Head of Receivables. If the squad has a third person (Evaluation Engineer), give them their own first step: read the reference cases of this slice in `programme/payment-reminders/contracts/reference-cases.md`, explain each in one line, and list the edge cases the cases do not cover.

End by pointing to `MISSION.md` (who does what, and example prompts for each phase: to adapt, not to paste) and `CHEATSHEET.md` (all commands on one page).

At this step, write nothing in `intent/` on your own: you draft when a human asks, and a human signs. Keep the answer short.
