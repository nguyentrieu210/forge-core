# NO-STOP RULE — BACKEND/UI RECONCILIATION

Program: `program/backend-ui-reconciliation-20260811`

## Default behavior

Workers continue independently whenever the remaining work is inside their owned hotspot and can be resolved from repository evidence.

Do **not** stop for:

- naming choices already established by current code/metadata;
- routine presentation decisions supported by existing UX patterns;
- generated-artifact regeneration;
- test fixture updates caused by an owner-correct change;
- stale historical branches/PRs that can be treated as reference evidence only;
- minor ambiguity where exact backend contracts clearly determine the correct projection.

## Stop / Dependency Request only when

1. another owner must change a shared contract/hotspot;
2. a business decision cannot be inferred from current source/contracts;
3. a change would create or alter authoritative accounting/stock/payroll/pricing/manufacturing semantics;
4. a migration/schema change is needed beyond correcting an objectively broken declaration;
5. production mutation/deploy/install/secrets/DNS/customer data would be required;
6. merge into `main` of non-trivial runtime/metadata/backend changes is the next step.

## Cross-program Grid boundary

The Grid program owns child-grid interaction/runtime parity.

This program may:

- define which fields belong to compact/full/internal surfaces;
- audit whether required fields are reachable;
- add metadata tests for declared columns;
- consume the final generic Grid runtime.

This program must not:

- independently restore resize/reorder/pin/paste/keyboard/fullscreen behavior;
- create a second child-grid renderer;
- reintroduce Sales/Purchase formulas into React to compensate for a Grid/runtime gap.

If blocked by grid behavior, issue a Dependency Request to the correct `GRID-XX` owner and continue non-grid work.

## Generated metadata rule

If a generated brief/package artifact is wrong, find and fix the source generator first. Regenerate the artifact and include a regression that locks the source-to-output contract. Do not hand-patch generated JSON as the durable fix.

## Historical evidence rule

Old branches and merged PRs are useful for behavior/parity evidence, not live baselines. New implementation starts from this program's exact fork point and must re-audit any reused idea against current backend authority.

## Merge/deploy boundary

Branch creation, docs, tests and source implementation do not authorize:

- merge of non-trivial shared/runtime/backend/schema changes;
- production deployment;
- tenant metadata install/relock;
- D1 migration;
- provider/DNS/secret changes;
- customer production data mutation.

Coordinator must stop at the relevant gate and report exact candidate SHA/evidence.
