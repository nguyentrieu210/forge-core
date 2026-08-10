# Alumdoor 10/10 Certification

**Status:** IN PROGRESS — do not call the vertical complete until every gate below is 1.0/1.0 with evidence.

**Golden UI:** current Sales / Sales Order experience.

**Release posture:** this file does not authorize merge or deploy.

## Scoring rule

No partial rounding. A gate is either `PASS = 1.0` or `OPEN = 0.0`. A 9/10 result is not completion.

| # | Gate | Score | Current evidence / blocker |
|---|---|---:|---|
| 1 | Visual consistency | 0.0 | Golden Sales Order exists; remaining Alumdoor screens not yet certified against one UI contract. |
| 2 | Metadata purity | 0.0 | `FormView.tsx`, `ChildGrid.tsx`, `ChildGridWithExtensions.tsx` still contain Sales/doctype-specific presentation/business branches. |
| 3 | UX completeness | 0.0 | Needs create/edit/save/submit/cancel/link/grid/filter validation per operational screen with real runtime evidence. |
| 4 | Sales closure | 0.0 | Strong O2C unit evidence exists, but final real-data end-to-end certification is still open. |
| 5 | Purchase closure | 0.0 | Strong P2P unit evidence exists, but final real-data end-to-end certification and exact Purchase Receipt cancel review remain open. |
| 6 | Inventory integrity | 0.0 | P0 slice verified 2020/2020; active-reservation scan bound, consumption evidence and remaining lifecycle guards are open. |
| 7 | Manufacturing closure | 0.0 | Strong Work Order/Cut/manufacture evidence exists; final golden real-data chain not yet certified. |
| 8 | Accounting reconciliation | 0.0 | Stock/GL/AR/AP controls exist; final Alumdoor golden-chain reconciliation is open. |
| 9 | Real-data certification | 0.0 | Pricing lab real data exists; full vertical transaction chain on disposable Alumdoor data clone remains open. |
| 10 | Regression / print / performance | 0.0 | Server full unit is green; full UI visual/E2E/performance certification is open. |

**Current certified score: 0/10.** This intentionally does not reward partial gates. Evidence can be strong without the gate being complete.

## Verified inventory slice — 2026-08-11

Self-hosted runner `alumdoor-runner` on `DESKTOP-JTFCUTT` tested experiment commit:

`5839a04122beee9f17cd2f7c0a83c329a7d53f61`

Workflow: `Test local runner` run #48, run id `31444195885`, job id `93634832300`.

Result:

- tests: 2020
- pass: 2020
- fail: 0
- skipped: 0
- marker: `PRICING_EXPERIMENT_FULL_SERVER_UNIT_PASS`

Verified changes in this slice:

1. Delivery Note rejects cross-company, disabled and group posting warehouses before stock planning.
2. Purchase Receipt keeps rollout behavior but shares the same leaf/company warehouse boundary.
3. Stock Reservation checks all nested length breakpoints; one physical bar cannot satisfy two incompatible promises.
4. Stock Return cancellation reverses exact submitted Stock/GL rows instead of replaying current valuation.
5. Delivery Note, Purchase Receipt and Stock Return now share the company-wide inventory coordinator with Stock Entry, Cut Order, Work Order and Stock Reconciliation.

## Inventory remaining blockers

### INV-P1-01 — bounded document scan must never silently undercount reservations

`D1MutationStore.listDocumentsByDoctype()` currently selects at most 5,000 rows. Reservation availability must either use a narrow active-reservation query or fail closed when the bounded scan cannot prove completeness.

### INV-P1-02 — `Đã dùng` requires consumption evidence

A reservation must not be allowed to become consumed merely because a client writes a state value. Terminal consumed state needs canonical evidence from a stock-consuming voucher/cut lineage.

### INV-P1-03 — source lifecycle releases promises

Cancellation/closure of the source Sales/Production document must deterministically release or terminate its active reservations with audit evidence.

### INV-P1-04 — Purchase Receipt cancellation exactness

Review and, where necessary, replace reconstructed cancellation with exact reversal of original Stock/GL/procurement facts.

### INV-P1-05 — outbound reservation guard

All stock-consuming paths must respect active promises using one generic server guard under the company inventory coordinator. Physical non-negative stock alone is insufficient because it does not protect promised stock.

## Golden UI contract

The Sales Order experience is a **visual/interaction reference**, not code to duplicate.

Every standard transaction screen must converge on:

1. common document header, breadcrumb, title/status and action placement;
2. metadata-driven two-column/section field layout;
3. the same dense child-grid interaction model;
4. consistent link-create, dropdown, row-add/remove and validation affordances;
5. common summary block driven by declared fields, not doctype branches;
6. common Save / Submit / Cancel / Print workflow placement;
7. identical loading, dirty, conflict and error behavior;
8. responsive behavior matching the golden Sales Order surface.

Implementation constraint:

- do **not** create `PurchaseOrderPage`, `StockEntryPage`, etc. by copying Sales Order React code;
- presentation belongs in DocType/view metadata;
- business calculation belongs in server policy/controllers;
- `FormView` and `ChildGrid` must remain business-neutral.

## Required final real-data chain

A disposable clone must prove at least this chain with authoritative source data:

`Customer -> Quotation -> Sales Order -> Reservation -> Production Request -> Work Order -> Cut/Stock Entry -> Manufacture -> Delivery Note -> Sales Invoice -> Payment`

and purchase replenishment:

`Material Request -> RFQ -> Supplier Quotation -> Purchase Order -> Purchase Receipt -> Purchase Invoice -> Payment`

Final evidence must reconcile:

- Stock Ledger quantity, batch/serial and catch weight;
- stock valuation versus inventory GL;
- manufacturing progress and genealogy;
- Sales Order delivery/billing progress;
- AR/AP Payment Ledger versus GL;
- cancellation/reversal path back to a valid state;
- print output and UI state for the same document facts.

## Stop condition

Only mark this document `COMPLETE — 10/10` when:

- no P0 exists;
- no P1 affecting money, stock, reservations, accounting or workflow exists;
- all ten gates above are PASS;
- real-data golden chains are reproducible;
- no unexplained reconciliation difference exists;
- generic renderer contains no Alumdoor/domain business hardcode;
- full unit/integration/E2E/print/visual/performance suites are green.
