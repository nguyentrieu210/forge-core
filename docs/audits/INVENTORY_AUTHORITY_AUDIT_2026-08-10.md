# Forge Inventory Authority Audit — 2026-08-10

**Scope:** inventory authority, warehouse boundaries, Stock Ledger, serial/batch, reservation/ATP, reconciliation, returns, reversal, valuation/repost, physical-stock read model.

**Branch audited:** `exp/alumdoor-pricing-policy`

**Audit posture:** source-of-truth and invariant audit. This document does not promote the Inventory domain to Hardened and does not authorize merge/deploy.

## 1. Executive result

The stock core is structurally sound: `stock_ledger_entries` remains the physical quantity/value authority; D1 has write-time negative-stock, batch, serial and bundle-usage invariants; command writes are atomic; Stock Entry, Stock Reconciliation and Delivery Note have important exact-reversal protections; valuation replay is deterministic and fails closed on historical valued negative stock.

The domain is **not Hardened** because the protection at the *entry points to the ledger* is inconsistent. The critical gaps are warehouse/company scope on Delivery Note and Purchase Receipt, reservation feasibility/enforcement, and Stock Return exact reversal.

### Maturity recommendation

- Stock Ledger authority: **RC candidate**
- Batch/Serial integrity: **RC candidate**
- Stock Entry: **RC candidate**
- Stock Reconciliation: **RC candidate**
- Reservation/ATP: **Wired, not RC**
- Purchase Receipt inventory boundary: **Wired with P0 gap**
- Delivery Note inventory boundary: **Wired with P0 gap**
- Stock Return: **Wired with P0 reversal gap**
- Backdate/Repost: **Wired / RC candidate on stock side; not Hardened until Finance DR-02 closes**
- Inventory domain overall: **NOT HARDENED**

## 2. Invariants already strong

### INV-G01 — one physical stock authority

`stock_ledger_entries` is the only physical quantity/value movement authority. Reports/read models derive from it; no WMS, reservation or manufacturing balance is allowed to become a second physical stock book.

Evidence:

- `server/packages/document-kernel/src/d1-store.ts`
- `server/packages/clouderp-erpnext/src/d1-physical-stock-ledger-reader.ts`
- `docs/agents/rc/RC-024-025-inventory-authority.md`

### INV-G02 — write-time non-negative stock invariants

D1 enforces the invariant at insert time, not only in controller pre-checks:

- aggregate item + warehouse non-negative guard;
- batch + warehouse non-negative guard;
- serial stock can only be absent or exactly one unit;
- bundle cumulative usage can only be 0 or 1.

Evidence:

- `server/migrations/tenant/0001_core.sql` — `stock_balance_guard`
- `server/migrations/tenant/0007_erpnext_core.sql` — `batch_stock_integrity_guard`, `serial_stock_integrity_guard`, `stock_bundle_source_guard`

### INV-G03 — atomic command boundary

Document, Version, Stock Ledger, GL, bundle usage, outbox and mutation receipt are committed through the canonical D1 mutation batch. Retry/idempotency is anchored by mutation receipts.

Evidence:

- `server/packages/document-kernel/src/d1-store.ts`
- `docs/agents/rc/RC-024-025-inventory-authority.md`

### INV-G04 — tracked stock identity and valuation

Tracked outward stock validates submitted bundle identity, warehouse, direction, quantity, expiry and current tracked balance. Outgoing valuation is resolved per selected batch and the actual posted stock value is returned to the caller for GL parity.

Evidence:

- `server/packages/clouderp-stock/src/tracking.ts`
- `server/packages/clouderp-stock/src/tracking-integrity.ts`
- `server/packages/clouderp-stock/src/valuation.ts`

### INV-G05 — strong reconciliation correction

Stock Reconciliation freezes the snapshot envelope and row identity, rejects duplicate/aggregate-vs-batch ambiguity, requires separation of duties, respects period locks and reverses exact Stock Ledger rows from the submitted revision. Original history is not rewritten.

Evidence:

- `server/packages/clouderp-erpnext/src/stock-reconciliation-integrity.ts`
- `server/tests/stock-reconciliation-integrity.test.mjs`

### INV-G06 — company-wide serialization exists for selected inventory flows

Stock Entry, Work Order, Cut Order, Stock Reconciliation and Stock Reservation mutations route through one tenant+company Durable Object and a serial executor. This prevents differently named coordinated documents from interleaving their read-check-write sections.

Evidence:

- `server/apps/tenant-worker/src/inventory-coordinator.ts`
- `server/apps/tenant-worker/src/aggregate-do.ts`

## 3. P0 blockers

### P0-INV-01 — Delivery Note can reach Stock Ledger without canonical leaf/company warehouse guard

**Finding**

`DeliveryNoteController` validates that Warehouse master records exist, but it does not call the canonical `requireLeafWarehouse()` guard. The selling registry registers `DeliveryNoteController` directly; there is no stock-side wrapper around it.

**Risk**

A Delivery Note can potentially post stock against a warehouse that is a group/disabled warehouse or belongs to another company while GL/COGS uses the Delivery Note company. Because `stock_ledger_entries` has no company column, the company is inferred through the owning voucher/read model. A cross-company warehouse selection therefore creates a physical/company semantic contradiction even if the tenant-level stock quantity remains mathematically valid.

**Evidence**

- `server/packages/clouderp-selling/src/controllers.ts` — `DeliveryNoteController.normalize()` only checks master existence and stock balance.
- `server/packages/clouderp-selling/src/registry.ts` — direct registration of `DeliveryNoteController`.
- `server/packages/clouderp-stock/src/warehouse-scope.ts` — canonical guard exists but is not consumed here.
- `server/packages/clouderp-erpnext/src/d1-physical-stock-ledger-reader.ts` — company is recovered from voucher payload while warehouse comes from Stock Ledger.

**Required fix**

Before submit, require every Delivery Note warehouse to be active, leaf and owned by `document.company`. Prefer a generic stock-posting warehouse guard used by every stock-producing controller rather than another one-off Alumdoor condition.

**Done when**

- cross-company warehouse submit fails;
- group warehouse submit fails;
- disabled warehouse submit fails;
- same-company leaf warehouse succeeds;
- authenticated and D1 integration tests prove no Stock Ledger/GL side effects on rejection.

---

### P0-INV-02 — Purchase Receipt has the same warehouse/company boundary gap

**Finding**

`RolloutPurchaseReceiptController` delegates to legacy/allocation Purchase Receipt controllers. The core receipt normalization requires `item_code` + `warehouse` and submit checks master existence, but there is no canonical `requireLeafWarehouse()` boundary in the rollout/controller chain.

**Risk**

Inbound stock can be received into a group/disabled/cross-company warehouse. This contaminates physical ownership and future valuation/issue flows even though quantity is positive.

**Evidence**

- `server/packages/clouderp-core/src/purchase-allocation-rollout-controllers.ts`
- `server/packages/clouderp-core/src/controllers.ts` — `PurchaseReceiptController`, `normalizePurchaseStockItems()`.
- `server/packages/clouderp-core/src/registry.ts` — production registry uses `RolloutPurchaseReceiptController`.
- `server/packages/clouderp-stock/src/warehouse-scope.ts` — reusable canonical guard already exists.

**Required fix**

Wrap/extend the rollout Purchase Receipt path with the same canonical leaf/company check used by Stock Entry/Stock Return/Reconciliation.

**Done when**

Same four warehouse-boundary tests as P0-INV-01 pass on both legacy and allocation rollout modes.

---

### P0-INV-03 — Stock Return cancellation recomputes tracked stock instead of reversing exact original posting

**Finding**

`StockReturnController.ledger()` rebuilds the normal stock/GL/return/bundle entries on both `submit` and `cancel`, then calls `reverseStock()`/`reverseGl()` on the newly computed result. It does **not** load the exact original Stock Ledger/GL rows by submitted revision.

For a Purchase Stock Return, the normal direction is Outward. `buildTrackedStockLines()` derives current historical per-batch valuation at `posting_at`; on cancel the original outbound ledger row is already part of history. The recomputed value can therefore differ from the value originally posted or the cancel can fail after later/backdated history changes. GL reversal still derives from the stored document amount, which creates a Stock Ledger <-> GL mismatch risk.

**Risk**

Cancellation can fail or append a non-exact stock reversal; tracked Purchase Returns are the highest-risk case. This violates the append-only correction principle already adopted by Delivery Note, Stock Entry, Stock Reconciliation and Repost.

**Evidence**

- `server/packages/clouderp-erpnext/src/controllers.ts` — `StockReturnController.ledger()` rebuilds then reverses.
- `server/packages/clouderp-stock/src/tracking.ts` — tracked Outward valuation is derived from ledger history.
- `server/packages/document-kernel/src/d1-store.ts` — exact `getVoucherStockEntries()` / `getVoucherGlEntries()` readers already exist.
- `server/tests/stock-return-integrity.test.mjs` currently covers warehouse scope only; it does not prove exact cancellation.

**Required fix**

Cancellation must load and sign-reverse the exact submitted revision:

- exact Stock Ledger rows;
- exact GL rows;
- exact return-progress rows or an equivalent immutable reversal contract;
- exact bundle-usage release.

Do not call current valuation logic to reconstruct historical stock on cancel.

**Done when**

A tracked Purchase Return is submitted, subsequent/backdated valuation history is changed, then cancellation restores quantity/value/GL exactly to the pre-return state.

---

### P0-INV-04 — Reservation is not a global outbound-stock invariant

**Finding**

Cut Order explicitly runs `assertCutDoesNotConsumeOtherReservations()`. Equivalent reservation protection is not centralized in `buildTrackedStockLines()` or a stock-posting policy and is not present on Delivery Note, Stock Return Purchase, or general Stock Entry Material Issue/Transfer paths.

The inventory coordinator also does not include Delivery Note or Stock Return in its coordinated doctype set.

**Risk**

Physical stock can remain non-negative while another document consumes stock promised to a reservation. The database stock triggers cannot detect this because reservation is a planning promise, not physical stock. A later Cut/Work Order then fails even though the reservation had previously succeeded.

**Evidence**

- `server/packages/clouderp-erpnext/src/alumdoor-inventory.ts` — reservation protection is implemented specifically in Cut Order.
- `server/packages/clouderp-selling/src/controllers.ts` — Delivery Note has no Stock Reservation check.
- `server/packages/clouderp-erpnext/src/controllers.ts` — Stock Return/Stock Entry paths do not consume the same reservation guard.
- `server/apps/tenant-worker/src/inventory-coordinator.ts` — coordinated set excludes Delivery Note and Stock Return.

**Required fix**

Create one generic **outbound reservation guard** at the stock authority boundary. Every physical outbound movement must either:

1. prove it owns/consumes the applicable reservation; or
2. prove the remaining feasible stock still satisfies all other active reservations.

All reservation create/save and all reservation-sensitive outbound mutations must share the same tenant+company serialization key.

**Done when**

Cut, Delivery Note, Stock Entry Issue/Transfer and Purchase Stock Return all pass the same reservation-preservation matrix.

---

### P0-INV-05 — multi-length reservation feasibility algorithm can over-reserve

**Finding**

`reservationAvailability()` checks only the threshold of the reservation currently being created/edited:

- stock supply = positions with `length >= request.min_length`;
- reserved demand = active reservations with `min_length >= request.min_length`.

That is not sufficient for a pool where a long piece can satisfy a shorter reservation.

Counterexample:

- physical stock: one 5.0m piece, no other piece;
- active reservation A: 1 piece >= 3.0m;
- create reservation B: 1 piece >= 5.0m.

At B's 5.0m threshold the current calculation sees one 5.0m piece and zero existing reservations with `min_length >= 5.0`, so B can pass. Globally A+B demand two pieces from a one-piece pool.

**Risk**

The reservation book itself can become infeasible before any physical movement happens.

**Evidence**

- `server/packages/clouderp-erpnext/src/alumdoor-inventory.ts` — `reservationAvailability()`.
- Existing `server/tests/stock-reservation-integrity.test.mjs` has no mixed-threshold feasibility test.

**Required fix**

Evaluate the post-mutation reservation set cumulatively at **every demand breakpoint**. For each minimum length `L`:

`demand(reservation.min_length >= L) <= supply(batch.length >= L)`

The check must include the proposed reservation and all active compatible reservations. Warehouse/color/condition wildcard semantics must remain fail-safe.

**Done when**

A descending-threshold matrix proves no infeasible reservation set can be created, including 3.0/3.8/4.5/5.0m mixtures and multiple quantities.

## 4. P1 blockers

### P1-INV-06 — active reservation calculation is silently capped by a generic 5,000-document reader

**Finding**

`reservationAvailability()` and Cut reservation protection call `listDocumentsByDoctype("Stock Reservation")`. D1 implements that generic reader with `ORDER BY name LIMIT 5000` and no pagination signal.

**Risk**

After sufficient reservation history accumulates, active reservations outside the first 5,000 names can disappear from availability calculations, allowing over-reservation or a cut that violates an active promise.

**Evidence**

- `server/packages/document-kernel/src/d1-store.ts` — `listDocumentsByDoctype()` has `LIMIT 5000`.
- `server/packages/clouderp-erpnext/src/alumdoor-inventory.ts` — reservation availability/cut guard use the generic reader.

**Required fix**

Add a purpose-built indexed reader such as `listActiveStockReservations(...)` or an append-only reservation projection. It must query active/non-expired compatible reservations directly and must not silently truncate.

---

### P1-INV-07 — `Đã dùng` is currently a client-requestable lifecycle transition without consumption evidence

**Finding**

The controller accepts `desiredState` in `["Đang giữ", "Đã dùng"]`. There is no required voucher/ledger/bundle evidence proving which physical movement consumed the reservation.

**Risk**

A caller can mark a reservation `Đã dùng`, removing it from availability protection, without stock actually being consumed by the owning source. The promised quantity can then be reserved or consumed again.

**Evidence**

- `server/packages/clouderp-erpnext/src/alumdoor-inventory.ts` — `StockReservationController.normalize()`.
- `server/tests/stock-reservation-integrity.test.mjs` does not cover evidence-based `Đã dùng`.
- `docs/agents/workstreams/WS04-inventory-wms.md` already records evidence-based `Đã dùng` as open work.

**Required fix**

Make `Đã dùng` system-derived from a canonical consumption event/reference. Persist `consumed_by_doctype`, `consumed_by_name`, `consumed_at` (or equivalent immutable evidence). Ordinary save must not be able to manufacture that transition.

---

### P1-INV-08 — reservation source lifecycle is incomplete

**Finding**

A reservation requires the source document to exist, but does not require a valid active/submitted source state. There is no centralized evidence found that cancellation of Sales Order/Work Order/Cut Order automatically releases its active reservations.

**Risk**

Reservations can be created against inappropriate source lifecycle states or remain active after the source is cancelled, understating ATP until manual release/expiry.

**Evidence**

- `server/packages/clouderp-erpnext/src/alumdoor-inventory.ts` — source is checked with `getDocument()` existence only.
- no `sales_order.cancelled -> Stock Reservation release` integration was found in the audited paths.

**Required fix**

Define source lifecycle policy per source doctype and release reservations through an idempotent system transition/event when the source becomes terminal.

---

### P1-INV-09 — Purchase Receipt cancellation still reconstructs its reversal

**Finding**

Purchase Receipt cancellation rebuilds stock/GL/procurement/bundle entries from current code and stored document fields, then sign-reverses them. It does not use `getVoucherStockEntries()` / `getVoucherGlEntries()` exact submitted-revision rows.

For current inward receipt logic this is less immediately dangerous than P0-INV-03, but it leaves historical correction dependent on current implementation/bundle interpretation.

**Evidence**

- `server/packages/clouderp-core/src/controllers.ts` — `PurchaseReceiptController.ledger()`.
- no exact voucher-stock reader is used in that controller.

**Required fix**

Converge Purchase Receipt cancellation onto the same exact-revision reversal contract as Delivery Note/Stock Entry/Reconciliation/Repost.

---

### P1-INV-10 — historical backdate/repost is not end-to-end Hardened with Finance

**Finding**

Stock-side replay/repost is materially implemented, including FIFO/Moving Average and Stock Ledger <-> GL valuation adjustment, but the documented Finance dependency for restating downstream historical COGS/expense/accounting dimensions remains open.

**Risk**

Inventory valuation can be recomputed correctly while the complete historical accounting consequence is not yet guaranteed across every already-posted downstream voucher.

**Evidence**

- `docs/agents/rc/RC-024-025-inventory-authority.md` — DR-02.
- `server/packages/clouderp-stock/src/valuation.ts`.

**Required fix**

Close the Finance-owned historical propagation contract before promoting Backdate/Repost or the whole Inventory domain to Hardened.

## 5. P2 / operational hardening

### P2-INV-11 — physical-stock ledger report has a hard source scan ceiling

`D1PhysicalStockLedgerReader` defaults to 20,000 ledger rows and hard-fails above the configured source limit (max 100,000). This is safe — it does not return silently wrong balances — but it is not a scalable production read path for a long-lived tenant.

Evidence: `server/packages/clouderp-erpnext/src/d1-physical-stock-ledger-reader.ts`.

Required direction: page/stream by posting cursor or maintain a derived, reconcilable read projection sourced only from Stock Ledger.

## 6. Required architecture convergence

The fix should not create more one-off Alumdoor checks. Converge on five reusable stock services:

1. **WarehousePostingGuard** — active + leaf + tenant/company boundary for every stock entry point.
2. **ReservationFeasibilityService** — correct multi-threshold matching and active reservation query.
3. **OutboundReservationGuard** — one policy for Cut/Delivery/Issue/Transfer/Purchase Return.
4. **ExactVoucherReversalService** — retrieve and reverse exact submitted revision Stock/GL/progress/bundle side effects.
5. **InventoryCoordinatorPolicy** — every reservation-sensitive physical mutation resolves to the same tenant+company serialization domain.

The Stock Ledger remains the physical source of truth; reservation remains a planning/commitment authority and must not become a second physical stock ledger.

## 7. Fix order

1. P0-INV-03 Stock Return exact cancellation.
2. P0-INV-01 + P0-INV-02 warehouse/company guard on Delivery Note and Purchase Receipt.
3. P0-INV-05 multi-threshold reservation feasibility.
4. P0-INV-04 global outbound reservation enforcement + coordinator coverage.
5. P1-INV-06 remove 5,000-row reservation truncation.
6. P1-INV-07 + P1-INV-08 evidence-based reservation lifecycle and source terminal release.
7. P1-INV-09 converge Purchase Receipt exact reversal.
8. P1-INV-10 close Finance DR-02.
9. P2-INV-11 scalable physical-stock reporting.

## 8. Mandatory verification matrix before Inventory can be called Hardened

### Warehouse boundary

- Delivery Note: leaf/same-company pass; cross-company/group/disabled fail with zero side effects.
- Purchase Receipt: same matrix in legacy + allocation rollout modes.
- Stock Entry/Return/Reconciliation: retain existing evidence.

### Reservation

- mixed-length feasibility matrix;
- warehouse/color/condition wildcard matrix;
- >5,000 historical reservation regression;
- concurrent reservation creates on different document names;
- reservation vs Cut/Delivery/Material Issue/Transfer/Purchase Return;
- source cancel auto-release;
- `Đã dùng` requires consumption evidence;
- retry/idempotency does not duplicate release/consume transitions.

### Reversal

- exact stock quantity/value restoration;
- exact GL restoration where applicable;
- exact bundle usage restoration;
- exact return/procurement/fulfillment progress restoration;
- later and backdated ledger changes between submit and cancel must not alter the reversal values.

### Valuation / backdate

- FIFO and Moving Average;
- per-batch valuation;
- same timestamp deterministic ordering;
- historical negative valued stock fail-closed;
- Repost Stock Ledger delta == stock-account GL delta;
- downstream Finance historical-restatement evidence.

### Scale / tenant isolation

- tenant and company isolation on every reader;
- active reservation query has no silent truncation;
- physical-stock report pagination/projection proves complete large-history results.

## 9. Audit conclusion

The current inventory architecture is **not a rewrite candidate**. Its core ledger, D1 invariants, fixed-point valuation, tracking and reconciliation design are worth keeping. The correct completion strategy is to harden and unify the entry-point policies around that core.

Do **not** create a second inventory engine, WMS balance, or Alumdoor-specific shadow stock. Close the P0/P1 gaps above, then rerun the critical inventory gate against real D1 data and authenticated flows before changing maturity status.
