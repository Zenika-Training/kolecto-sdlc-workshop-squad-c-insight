# Squad C · Insight Constitution

<!-- Pre-filled from the organisation's rules in the Context Nexus (org/), so the squad starts from them.
     /speckit-constitution adds the business rules (RR-xx) this squad's slice depends on, each with its id. -->

## Core Principles

### I. Human decisions stay human (ORG-02, ORG-05)
Every new behaviour ships behind a feature flag, off by default. Only a named human activates a flag, with a reason traced in the flag journal. The agent never sets an intent, a spec or a contract to `active` and never signs a gate.

### II. Contracts are the truth between squads (ORG-04, API-01, API-02, API-03)
Published contracts are the source of truth. Each exchanged field has a name, a type, a unit (amounts: integer minor units plus `currency`) and an example. A breaking change bumps the major version, and consumers are told before it is published. When code and a contract disagree: stop and report, never guess.

### III. Never build on stale context (ORG-06, ORG-07)
A `stale` artefact or a pin on an outdated version is read and realigned before any new code. A squad writes only in its own folder of the Context Nexus.

### IV. Reuse existing code, never modify it (ORG-08)
Core Billing (`src/billing/`) is reused, not modified; a needed change goes to its owners. Nothing new is built on a `@deprecated` symbol.

### V. Tested against the spec (ENG-01 to ENG-05)
Lint and typecheck pass. Every acceptance criterion has a unit test named after its id. Coverage is at least 70 %. The reference tests pass and are read-only. The spec is updated with what implementation taught.

## Data, security and time (ORG-01, ORG-03, SEC-01 to SEC-04)

Synthetic data only. No secret and no bank detail anywhere, even fake. Logs carry ids, never an e-mail or a name. HTTP inputs are validated: an invalid input returns `400` with an error code. Dates are ISO 8601, business time is Europe/Paris, and code takes `today` / `now` as parameters.

## Business rules of this slice

<!-- /speckit-constitution: list the RR-xx rules from the brief that this squad's function applies, one line each with its id. -->

## Governance

Operations (ENG-06): a deployed service exposes `/health` and `/metrics` and has a runbook with an owner and a rollback. This constitution changes only with the squad's agreement; the rule ids stay the reference.

**Version**: 1.0.0 | **Ratified**: the session day | **Last Amended**: the session day
