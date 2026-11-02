---
name: nexus
description: Refresh and inspect the shared context. Pulls the Context Nexus, re-assembles the brief, reports pinned dependencies that changed, and shows exactly what the agent reads (system prompt, injected context, on-demand knowledge) with versions. Use for /nexus, "update the context", "what do you read?", or after another squad published.
---

# /nexus

1. `git -C ../context-nexus pull --rebase --autostash --quiet` (skip silently if there is no remote).
2. `npm run context` and read its output.
3. Report, in this order and briefly:
   - **What I read**: the task brief id, then a 3-column list (layer: org / programme / team · artefact · version and status) of the system-prompt and injected artefacts. One line each.
   - **What changed**: every pin issue (`BREAKING`, `UPDATE`, `TARGET_STALE`, `MISSING`) with the artefact that pins it. If none: "Every pin is up to date."
   - **What to do**: `BREAKING` means the major version moved, not always a real break: suggest `/contract-diff` to see what changed; never re-pin or change status yourself without the humans.
   - If asked whether the other squad took our new version: `node scripts/nexus.mjs context-assemble --all --check` lists every artefact's out-of-date pins, theirs included.
4. If the user asks to flag outdated artefacts: `npm run context -- --mark-stale`, then explain that a human sets them back to `active` after review.
