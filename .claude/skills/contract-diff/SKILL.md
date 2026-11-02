---
name: contract-diff
description: When something the squad depends on changed version (a business rule, the reference cases, the other squad's contract), shows the diff since the pinned version, which squad artefacts pin it, and which files of the starter mention fields that disappeared. Use for /contract-diff, "what changed?", or when the brief reports BREAKING.
---

# /contract-diff

1. `npm run context` to refresh, then `npm run contract-diff`.
2. Summarise for the squad, in at most 8 lines:
   - what changed, in business words (one line per change);
   - what is impacted on our side: spec criteria, contract fields, code, tests (from the tool's "mentioned in your starter" list);
   - whether it is breaking for **us**, and whether **our** contract must change too (then the other squad will be impacted in turn: tell them).
3. Propose the realignment order, and wait for the humans before doing it:
   1. `/speckit-clarify` on the change, then update the spec's criteria;
   2. update tests then code (reference tests show the new expected values);
   3. re-pin `consumes: …@<current>` in our spec and contract; a human sets them back to `active`;
   4. `/publish`.
