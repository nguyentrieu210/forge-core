# Alumdoor 10/10 Certification

**Status:** IN PROGRESS — do not call the vertical complete until every gate below is 1.0/1.0 with evidence.

**Golden UI:** current Sales / Sales Order experience.

**Release posture:** this file does not authorize merge or deploy.

## Scoring rule

No partial rounding. A gate is either `PASS = 1.0` or `OPEN = 0.0`. A 9/10 result is not completion.

| # | Gate | Score | Current evidence / blocker |
|---|---|---:|---|
| 1 | Visual consistency | 0.0 | Golden Sales Order exists; remaining Alumdoor screens not yet certified against one UI contract. |
| 2 | Metadata purity | 0.0 | Metadata-first child-grid presentation contract is verified 4/4, but `FormView.tsx`, `ChildGrid.tsx`, `ChildGridWithExtensions.tsx` still contain doctype/business branches. |
| 3 | UX completeness | 0.0 | Needs create/edit/save/submit/cancel/link/grid/filter validation per operational screen with real runtime evidence. |
| 4 | Sales closure | 0.0 | Strong O2C unit evidence exists; final real-data end-to-end certification remains open. |
| 5 | Purchase closure | 0.0 | Purchase Receipt warehouse boundary and exact Stock/GL cancel are verified; full real-data P2P chain remains open. |
| 6 | Inventory integrity | **1.0 PASS** | No open P0/P1 inventory correctness blocker after exact reversal, lifecycle-aware reservations, Cut-ledger consumption projection and generic outbound reservation protection. Remaining 5,000-row scan work is fail-closed P2 scalability. |
| 7 | Manufacturing closure | 0.0 | Strong Work Order/Cut/manufacture evidence exists; final golden real-data chain not yet certified. |
| 8 | Accounting reconciliation | 0.0 | Stock/GL/AR/AP controls exist; final Alumdoor golden-chain reconciliation and backdate/repost finance closure are open. |
| 9 | Real-data certification | 0.0 | Pricing lab real data exists; full vertical transaction chain on disposable Alumdoor data clone remains open. |
| 10 | Regression / print / performance | 0.0 | Build + full server unit + metadata UI contract are green; visual/E2E/print/performance certification remains open. |

**Current certified score: 1/10.** No partial gates are counted.

## Latest verified checkpoint — 2026-08-11

Self-hosted runner `alumdoor-runner` on `DESKTOP-JTFCUTT` tested experiment commit:

`b662b323ed00e0d273fe38659be346ad6b382c02`

Workflow: `Test local runner` run #61, run id `31448043854`, job id `93646390695`.

Verified results:

- server TypeScript build: PASS
- MetaForge views TypeScript build: PASS
- metadata child-grid presentation contract: 4/4 PASS
- focused inventory integrity slice: 36/36 PASS
- full server suite: 2036/2036 PASS
- full-suite fail: 0
- marker: `ALUMDOOR_INVENTORY_FULL_SERVER_UNIT_PASS`

### Inventory controls certified at this checkpoint

1. Delivery Note rejects cross-company, disabled and group posting warehouses before stock planning.
2. Purchase Receipt keeps rollout/allocation behavior and shares the same leaf/company warehouse boundary.
3. Purchase Receipt cancel preserves procurement/allocation reversal facts but replaces reconstructed Stock/GL with exact submitted-revision reversals.
4. Stock Return cancellation reverses exact submitted Stock/GL rows without replaying current valuation.
5. Stock Reservation checks every nested length breakpoint; one long bar cannot satisfy incompatible promises at multiple thresholds.
6. Partial reservation release remains `Đang giữ` and records actor, time, delta, cumulative released quantity and canonical/custom reason.
7. Client cannot directly declare `Đã dùng`.
8. Effective reservation consumption is derived from **submitted Cut Order Stock Ledger** facts for the same Production Order; partial cutting reduces effective `qty_reserved`, full consumption derives `Đã dùng`, and allocation is longest-minimum-first.
9. Cancellation of a reservation source removes that promise from effective ATP without rewriting the immutable reservation audit record; missing historical sources remain conservative and do not silently release stock.
10. Generic `assertStockPlanRespectsReservations()` protects batch-tracked outbound Stock Ledger plans by item/warehouse/color/condition and every reservation length breakpoint. Own source lineage can consume its own promise; other promises remain protected.
11. Stock Entry, Delivery Note, Purchase Receipt cancellation and Stock Return use the generic outbound reservation guard in addition to Cut Order's specialized allocation guard.
12. Delivery Note, Purchase Receipt, Stock Return, Stock Entry, Cut Order, Work Order and Stock Reconciliation share the company-wide inventory coordinator, so reservation/stock read-check-write sequences are serialized per company.
13. D1 remains the final write-time authority for aggregate negative stock, batch negative stock, serial state and bundle usage.

## Inventory residual work — non-blocking for correctness gate

### INV-P2-01 — targeted active-reservation query

Production D1 does **not** silently truncate at 5,000. `D1RolloutPurchaseAllocationDomainStore` counts rows and `assertControllerDocumentScanCount()` fails closed when the controller scan bound is exceeded. A narrow active-reservation query is still desirable for scale, but this is P2 performance work, not an inventory correctness blocker.

### Cross-domain dependency

Backdated valuation/repost may require downstream Finance restatement. That remains tracked under **Accounting reconciliation**, not the physical-inventory correctness gate; stock-side replay itself remains deterministic/fail-closed.

## Golden UI metadata work verified

`client/packages/views/src/form/child-grid-presentation.ts` defines a business-neutral presentation contract:

- `viewPolicy.form.columns/fields` controls full detail order;
- `viewPolicy.quickEntry.columns/fields` controls compact parent-form order;
- `surface=quick|expanded|internal` provides a generic fallback policy;
- `surface=internal` never becomes a business column;
- legacy metadata returns `null`, explicitly preserving the current UI until a DocType is migrated.

The contract is verified by `client/packages/views/tests/child-grid-presentation.test.mjs` and does not know Sales Order, Purchase Order or Alumdoor.

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
- `FormView` and `ChildGrid` must become business-neutral.

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
