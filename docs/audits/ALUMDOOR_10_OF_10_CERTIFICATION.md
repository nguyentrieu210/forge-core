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
| 6 | Inventory integrity | 0.0 | P0/exact-reversal/reservation-threshold slice verified; consumption evidence, source lifecycle and generic outbound reservation guard remain open. |
| 7 | Manufacturing closure | 0.0 | Strong Work Order/Cut/manufacture evidence exists; final golden real-data chain not yet certified. |
| 8 | Accounting reconciliation | 0.0 | Stock/GL/AR/AP controls exist; final Alumdoor golden-chain reconciliation is open. |
| 9 | Real-data certification | 0.0 | Pricing lab real data exists; full vertical transaction chain on disposable Alumdoor data clone remains open. |
| 10 | Regression / print / performance | 0.0 | Build + 2025/2025 server unit + metadata UI contract are green; visual/E2E/print/performance certification remains open. |

**Current certified score: 0/10.** This intentionally does not reward partial gates. Evidence can be strong without the gate being complete.

## Latest verified checkpoint — 2026-08-11

Self-hosted runner `alumdoor-runner` on `DESKTOP-JTFCUTT` tested experiment commit:

`3193acc42c9af588cd64f1238ecb876a09126f0f`

Workflow: `Test local runner` run #56, run id `31446707358`, job id `93642385301`.

Verified results:

- server TypeScript build: PASS
- MetaForge views TypeScript build: PASS
- metadata child-grid presentation contract: 4/4 PASS
- focused inventory integrity slice: 28/28 PASS
- full server suite: 2025/2025 PASS
- full-suite fail: 0
- marker: `ALUMDOOR_INVENTORY_FULL_SERVER_UNIT_PASS`

### Inventory controls verified at this checkpoint

1. Delivery Note rejects cross-company, disabled and group posting warehouses before stock planning.
2. Purchase Receipt keeps rollout/allocation behavior and shares the same leaf/company warehouse boundary.
3. Purchase Receipt cancel preserves procurement/allocation reversal facts but replaces reconstructed Stock/GL with exact submitted-revision reversals.
4. Stock Reservation checks all nested length breakpoints; one physical bar cannot satisfy incompatible promises at multiple thresholds.
5. Partial reservation release stays `Đang giữ` and records actor, time, delta, cumulative released quantity and canonical/custom reason.
6. Client cannot declare reservation `Đã dùng`; consumption state remains server-evidence-only.
7. Stock Return cancel reverses exact submitted Stock/GL rows without replaying current valuation.
8. Delivery Note, Purchase Receipt and Stock Return share the company-wide inventory coordinator with Stock Entry, Cut Order, Work Order and Stock Reconciliation.

## Inventory remaining blockers

### INV-P2-01 — bounded reservation scan scalability

Production D1 does **not** silently truncate at 5,000. `D1RolloutPurchaseAllocationDomainStore` counts rows and `assertControllerDocumentScanCount()` fails closed when the controller scan bound is exceeded. Correctness is therefore protected; a targeted active-reservation reader is still required for scale and is now P2, not P1 correctness.

### INV-P1-01 — `Đã dùng` requires canonical consumption evidence

Direct client mutation is now blocked. The remaining work is positive evidence: submitted Cut/Delivery/Stock Entry lineage must derive consumed quantity and the terminal `Đã dùng` state when the promise is fully consumed.

### INV-P1-02 — source lifecycle releases promises

Cancellation/closure of the source Sales/Production/Cut document must deterministically release or terminate its active reservations with audit evidence.

### INV-P1-03 — generic outbound reservation guard

All stock-consuming paths must respect active promises using one server guard under the company inventory coordinator. Cut Order already has a specialized reservation protection; Delivery/Material Issue/Transfer/Purchase Return must converge on the same invariant.

## Golden UI metadata work verified

`client/packages/views/src/form/child-grid-presentation.ts` now defines a business-neutral presentation contract:

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
