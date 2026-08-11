# UI-REC-01 — BACKEND ↔ META TRUTH

Branch: `agent/ui-rec-01-backend-meta-20260811`
Fork point: `program/backend-ui-reconciliation-20260811@c4209b8318ac36110ca84094d905ce724ffae3d5`
PR: `#831` → `program/backend-ui-reconciliation-20260811`
Status: **READY**
Risk: STANDARD audit/tooling. One Sales schema-contract defect was found and routed to the domain owner; this worker does not alter applied schema authority.

## Mission

Materialize the exact current mapping from backend capability/schema/controller contracts to metadata declarations and build permanent validators for drift classes that can be proven statically.

## Completed outcomes

1. `BACKEND_UI_SURFACE_MATRIX.json`
   - P0-first backend↔metadata matrix for Sales, Procurement, Inventory/ATP and Attendance/Payroll.
   - 11 audited rows; 3 evidence-backed P0 rows routed to the owning workstreams.
2. `BACKEND_UI_SURFACE_MATRIX_SUMMARY.md`
   - exact findings, owner routing, first-party sweep totals and gate semantics.
3. `server/scripts/audit-backend-ui-surfaces.mjs`
   - reproducible source-backed detector for the current P0 vertical slice.
4. `server/scripts/lib/backend-ui-contract-validator.mjs`
   - business-neutral static validator for schema/link/child target, dead view metadata, required reachability, internal leakage, navigation/action permission targets and preview-output parity.
5. `server/scripts/verify-backend-ui-contracts.mjs`
   - applies the closed-contract validator to the canonical Meta v1 first-party packages.
6. Regression coverage:
   - `server/tests/backend-ui-reconciliation.test.mjs`
   - `server/tests/backend-ui-contract-validator.test.mjs`
7. GitHub runner evidence:
   - `UI-REC-01-CI-EVIDENCE.md`
   - `UI-REC-01-BROAD-CI-EVIDENCE.md`

## Exact verification evidence

Broad validation source head: `5d0ef9e01551a3526ac4cd00373c6c1e0cbcc302`

Passed on GitHub Linux runner / Node 24 / pnpm 9.15.0:

- server build;
- canonical `verify:first-party-meta`;
- new `verify-backend-ui-contracts.mjs` sweep;
- `brief:check` + `ALUMDOOR_META_COMPLETENESS_PASS`;
- 9/9 focused + generic UI-REC-01 tests;
- `git diff --check`.

First-party sweep totals:

- 8 apps;
- 131 DocTypes;
- 1,295 fields;
- 134 navigation entries;
- 2 actions.

AlumDoor V2 completeness on the same run:

- 74 DocTypes;
- 984 fields;
- 255 Links;
- 27 child tables;
- 79 navigation entries.

## Findings / owner routing

### DR-UIREC01-001 — UI-REC-02 NAV

`Sales Option` and `Sales Package` exist as generic Selling metadata but are not discoverable AlumDoor operator masters. UI-REC-02 owns declarative navigation/catalog exposure.

### DR-UIREC01-002 — UI-REC-03 FORMS + Grid program

Migration 0118 declares `Sales Order Item.sales_option` as operator-facing `Link(Sales Option)` / `surface=quick`; current AlumDoor V2 child metadata omits it. UI-REC-03 owns metadata projection and Grid owns interaction/runtime parity.

### DR-UIREC01-003 — Sales/domain authority

`Sales Option.sales_package` remains `Data`; migration 0118 states the package phase should upgrade it to `Link(Sales Package)`, while migration 0119 creates Sales Package without performing that upgrade. Any correction must be append-only and domain-owned.

## Audit order completed

P0:

```text
Sales commercial
Procurement
Inventory/ATP
Attendance/Payroll
permissions/actions
```

Broad follow-through:

```text
Manufacturing/QMS
Finance / VN Accounting
Service / Maintenance / Support / Visits
Projects
HRM
Organization/Security
```

No additional static-contract P0 was found in the closed Meta v1 sweep.

## Ownership boundary preserved

Allowed zones used:

- audit/validator tooling under server scripts/tests;
- program docs/matrix artifacts;
- temporary exact-branch GitHub validation workflows, removed after evidence was recorded.

Not edited:

- sidebar/catalog implementation owned by UI-REC-02;
- Form/List/Workspace implementation owned by UI-REC-03;
- shared Grid runtime owned by the Grid program;
- authoritative Sales/Stock/Finance/Payroll business semantics;
- production tenant metadata, migrations, secrets, DNS or customer data.

## Acceptance

- [x] matrix is reproducible from exact current source;
- [x] every P0 finding has concrete source evidence and an owner;
- [x] no maturity promotion from source presence alone;
- [x] validators fail closed without assuming every backend field should be visible;
- [x] no business formula/runtime duplication;
- [x] broad first-party metadata sweep completed after P0 domains;
- [x] branch remains unmerged/un-deployed pending convergence.

## Convergence note

PR #831 is ready for coordinator review into the program control branch. UI-REC-01 itself has no remaining owned implementation blocker; its three unresolved findings are explicit Dependency Requests owned by NAV, FORMS/Grid and Sales/domain authority.
