# UI-REC-01 — BACKEND/UI SURFACE MATRIX SUMMARY

Baseline: `main@cecb19c51855ab3e6a05ce84261d717c630c96b7`
Status: **READY** — evidence-backed backend↔metadata truth is materialized; no production mutation.

## Coverage

### P0 vertical matrix

- Rows audited: **11**
- Rows with findings: **3**
- P0: **3** · P1: **0** · P2 findings: **0**
- Focus: Sales commercial, Procurement, Inventory/ATP projection, Attendance/Payroll metadata.
- Reproduction authority: `server/scripts/audit-backend-ui-surfaces.mjs`.

### First-party closed-contract sweep

`server/scripts/verify-backend-ui-contracts.mjs` applies the business-neutral validator in `server/scripts/lib/backend-ui-contract-validator.mjs` to the canonical Meta v1 source packages already covered by `verify-first-party-meta.mjs`.

Exact GitHub runner evidence on source head `5d0ef9e01551a3526ac4cd00373c6c1e0cbcc302`:

- **8** first-party apps
- **131** DocTypes
- **1,295** fields
- **134** navigation entries
- **2** declared actions
- all eight packages passed closed Link/Table target, view reference, internal leakage, required-field reachability, navigation/action permission-target checks.

Apps swept: Maintenance, Projects, Support, Visits, HRM, VN Accounting, ERP Organization/Security, Manufacturing/QMS.

### Generated/brief coverage

The same exact-head run also passed `brief:check` and `ALUMDOOR_META_COMPLETENESS_PASS`:

- AlumDoor V2: **74** DocTypes, **984** fields, **255** Links, **27** child tables, **79** nav entries.
- Other canonical briefs dry-run clean: Assets, Center, AlumDoor V1, Phanbon.
- Focused + generic regression suite: **9/9 pass**.

Evidence files:

- `UI-REC-01-CI-EVIDENCE.md` — fast exact-head detector check.
- `UI-REC-01-BROAD-CI-EVIDENCE.md` — build + first-party sweep + brief completeness + generic drift regressions.

## P0/P1 findings

### P0 — Sales Option

Classification: `NAV_MISSING`, `SCHEMA_DRIFT`

- Migration `0118_sales_price_variants_options.sql` installs operator-maintained `Sales Option` metadata and an operator-facing `sales_option: Link(Sales Option)` on Quotation/Sales Order/Sales Invoice rows.
- Current AlumDoor V2 metadata does not declare `Sales Option` as a discoverable master; navigation/catalog correction belongs to UI-REC-02.
- `Sales Option.sales_package` remains `Data`. Migration 0118 explicitly says the package phase should upgrade it to a Link; migration 0119 creates `Sales Package` but does not perform that upgrade. This schema correction is owned by Sales/domain authority, not UI-REC-01.

### P0 — Sales Package

Classification: `NAV_MISSING`

- Migration `0119_sales_package_line_fulfillment.sql` installs `Sales Package` plus child `Sales Package Item` as generic Selling metadata.
- Current AlumDoor V2 metadata does not declare `Sales Package` as a discoverable operator master; navigation/catalog correction belongs to UI-REC-02.

### P0 — Sales Order Item

Classification: `SCHEMA_DRIFT`, `GRID_INCOMPLETE`

- Backend migration 0118 declares `Sales Order Item.sales_option` as an operator-facing quick Link.
- Exact AlumDoor V2 child metadata does not project `sales_option` on `Sales Order Item`.
- This worker records the projection defect only. UI-REC-03 owns form/list metadata projection; the Grid program owns shared child-grid interaction/runtime parity.
- Known Sales Option / Sales Package snapshot fields remain non-operator data in this audited projection; no `INTERNAL_LEAK` is recorded.

## Confirmed pass evidence

- `Sales Order` retains the metadata-driven commercial summary repaired by PR #825: `total_amount`, `discount_amount`, `surcharge_amount`, `vat_rate`, `vat_amount`, `grand_total`, with server preview `alumdoor.ui.preview_document` reacting to `items` and `vat_rate`.
- `Purchase Receipt`, `Purchase Receipt Item`, `Stock Reservation`, and `Stock Reconciliation` are present in current AlumDoor V2 metadata in the P0 procurement/inventory slice.
- `AlumDoor Attendance Day` and `AlumDoor Pay Profile` are package-owned metadata surfaces; Salary Slip normalization consumes AlumDoor attendance/pay-profile inputs when `alu_pay_profile` is present.
- Manufacturing/QMS, Finance, Service/Support, Projects, HRM, Visits, and Organization/Security pass the new closed-contract static sweep.

## Permanent static validator coverage

`backend-ui-contract-validator.mjs` fails closed only for contradictions provable from metadata; it does **not** infer business formulas or demand that every backend field be visible.

Covered drift classes:

- field duplication/type and Link/Table target drift → `SCHEMA_DRIFT`;
- list/form/quick references to missing fields → `DEAD_METADATA`;
- required fields with no operator path and no default/server source → `FORM_INCOMPLETE`;
- hidden/internal fields projected into operator views → `INTERNAL_LEAK`;
- broken navigation/permission targets → `DEAD_METADATA` / `PERMISSION_MISMATCH`;
- broken action permission targets → `ACTION_UNWIRED`;
- server preview outputs absent from metadata → `FORM_INCOMPLETE`.

## Dependency Requests

### DR-UIREC01-001

Dependency Request
Owner: UI-REC-02 NAV
Need: expose `Sales Option` and `Sales Package` as role-aware AlumDoor operator masters in declarative navigation/catalog.
Why: both masters are installed backend metadata and ordinary Sales Manager configuration; UI-REC-01 does not own sidebar/catalog declarations.
Blocked scope: discoverable commercial configuration.
Can continue independently: yes
Next independent work: UI-REC-01 complete; consume this request in NAV convergence.

### DR-UIREC01-002

Dependency Request
Owner: UI-REC-03 FORMS + Grid program
Need: project `Sales Order Item.sales_option` from the canonical 0118 backend metadata into AlumDoor child metadata; Grid owner validates interaction/runtime parity.
Why: 0118 marks the field operator-facing `surface=quick`, but the current AlumDoor V2 Sales Order Item projection omits it.
Blocked scope: operator choice of canonical Sales Option on Sales Order rows.
Can continue independently: yes
Next independent work: UI-REC-01 complete; consume this request in Forms/Grid convergence.

### DR-UIREC01-003

Dependency Request
Owner: Sales/domain authority
Need: decide and implement an append-only correction if `Sales Option.sales_package` is intended to be a `Link(Sales Package)` as stated by migration 0118.
Why: 0119 creates Sales Package but does not perform the promised type/target upgrade; changing an applied schema contract is outside UI-REC-01 ownership.
Blocked scope: strict Link-target parity for Sales Option package configuration.
Can continue independently: yes
Next independent work: UI-REC-01 complete; domain owner resolves before final convergence gate if the intended Link contract is confirmed.

## Gate semantics

The auditor records current drift instead of making this worker fail merely because another owner has not converged yet. Tests fail when the detector stops seeing an evidence-backed current contract or when a resolved invariant regresses. UI-REC-05 may promote resolved classifications into blocking convergence gates.
