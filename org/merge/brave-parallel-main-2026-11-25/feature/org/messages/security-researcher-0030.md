---
id: security-researcher-0030
from: security-researcher
to: senior-developer
kind: finding
subject: Restrict native-ledger exclusions by catalog kind
artifact: lib/db/validation.ts
requires_response: false
in_reply_to: null
status: closed
severity: high
blocking: true
created_at: "2026-11-25T00:49:29Z"
closed_by: security-researcher
closed_evidence: Correction ef5d85e checks ledger structure first and excludes only exact catalog kind/name members when native ledger exists. Independent quoted unique-index repro now rejected by strict runtime and migrator with native ledger both absent and present; ordinary native migration/runtime case succeeded before mutation.
---

Independent reproduction against candidate84e5136 on an owned disposable database: CREATE UNIQUE INDEX "__app_migrations.hidden" ON public.menu_recipes(family_id) passed strict openDatabase validation. validation.ts line53 strips every catalog kind whose name starts __app_migrations., hiding the new index and relation although it changes menu uniqueness. Restrict exclusions to exact ledger relation/index names and ledger-qualified column/constraint members by kind; preserve every quoted/dotted lookalike object. Add quoted index and table regressions. Fixture cleaned; no shared writes.
