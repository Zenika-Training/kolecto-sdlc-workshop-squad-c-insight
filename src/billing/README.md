# Core Billing (existing code)

Kolecto's invoicing core: ledger, customers, business calendar, money, templates, notifications, exports, reporting.
It predates the payment-reminders programme and runs in production for every customer.

- **Owner:** Core Billing team (see `OWNERS`). Every change goes through them: open a change request, do not edit here.
- **Reuse it.** Before writing a helper (dates, business days, Paris time, amounts, outstanding balance, templates), look for it here. `npm run graph`, then `graphify affected <symbol>` shows what already depends on a symbol.
- **Conventions:** amounts in integer minor units (cents), days as `YYYY-MM-DD`, instants as ISO 8601 with offset, Europe/Paris.
- **Legacy inside the legacy:** `dunning-v0/` is the manual-chasing export finance downloads every Monday. The payment-reminders programme is meant to replace it. Some of its helpers are `@deprecated`: do not build on them.
