---
name: gate
description: Prepare a gate (G1 to G4). Runs the automatic gate-check, explains each failed criterion in plain words with the fix, and lists the questions the human gate keeper will ask. Use for /gate, "are we ready for G2?", "check the gate".
---

# /gate

A gate has two steps: the **gate-check** (machine, numeric criteria, no judgement) then the **gate keeper** (a named human who decides GO or NO-GO). A NO-GO names the missing criterion; it is not a sanction.

1. Find the next gate: the first of G1…G4 not yet GO in `../context-nexus/teams/<squad>/operations/gates-journal.md` (or the one the user names).
2. Run `npm run gate -- <Gx>`.
3. For each ✗: one line, what it means and the smallest fix. Never fix anything that needs a human decision (status `active`, owner, flag switch, signature): name who must do it.
4. When everything is ✓, say "Ready: ask the gate keeper" and list the questions they will ask:
   - G1: Who set the number in the success criterion? What if it is wrong? What is out of scope?
   - G2: Show a field you exchange with the other squad: its name, type and unit on both sides. Which open question remains?
   - G3: What did the agent get wrong first time? Who reviewed the code? Which criterion was hardest to test?
   - G4: Who switched the flag on, and why? How do you switch it off in one minute? What do you watch?
