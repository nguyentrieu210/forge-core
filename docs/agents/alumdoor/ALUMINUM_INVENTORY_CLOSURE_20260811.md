# Alumdoor Aluminum Supply–Demand & Inventory Closure

Status: IMPLEMENTATION / CRITICAL / DO NOT MERGE OR DEPLOY WITHOUT EXPLICIT APPROVAL

Integration branch: `feat/alumdoor-aluminum-inventory-closure`
Baseline: `main@5ce215b8c6eade8512d59b68c8cab77d06b2c0b2`
Date: 2026-08-11

## Mission

Converge Alumdoor onto one canonical aluminum lifecycle:

`Sales demand -> manufacturing requirement -> ATP/reservation -> shortage -> procurement -> Purchase Receipt -> Batch/Serial & Batch Bundle -> Stock Ledger -> Cut Order/offcut -> Manufacture/FG -> Delivery/COGS/reconciliation`.

The program must remove `Aluminium Lot.sheet_count` from active inventory authority. `Batch` owns identity only; Stock Ledger owns quantity, catch weight and value.

## Capability scope

- Sales: `C03-004`, `C03-006`.
- Procurement: `P01-002`, `P01-008`, `P01-010`, `P01-013`, `P01-016..P01-019` integration seams.
- Inventory: `W01-004`, `W01-011..W01-016`, `W01-019..W01-024`.
- Manufacturing: `M02-004..M02-005`, `M03-001`, `M03-004..M03-008`, `M04-001`, `M04-006`, `M04-008..M04-010` integration seams.

## Frozen invariants

1. **One stock authority.** No quantity/value is written to `Aluminium Lot` or another vertical balance store.
2. **Dual measure is explicit.** Counted aluminum stock is `Cây/Lá/Đoạn`; catch weight is Kg. Neither is inferred from the other.
3. **Commercial price unit is explicit.** Supplier price can be per Kg while canonical stock is counted pieces.
4. **Exact purchase quantity wins.** `purchase_stock_qty_field=qty_bar`; a static Kg-to-piece conversion is forbidden for catch-weight aluminum.
5. **Supplier obligation is independent.** `purchase_allocation_qty_field=qty_bar` and `purchase_allocation_uom=<counted stock UOM>`.
6. **Tracked receipt is mandatory.** Submitted aluminum Purchase Receipt lines require an Inward `Serial and Batch Bundle`; bundle quantity equals counted stock quantity.
7. **Batch is identity, not balance.** Current quantity/weight/value comes from Stock Ledger grouped by `(item, warehouse, batch)`.
8. **Cutting consumes canonical Batch stock.** Offcuts return through a new child Batch + Inward bundle; Cut cancellation reverses exact original Stock Ledger entries.
9. **Reservations do not write stock.** They reduce ATP only and must never permit another Cut Order to consume protected stock.
10. **Dimension-aware ATP fails closed.** Only manufacturing rows with a proven dimension contract may become aluminum cutting demand. No generic assumption that every aluminum component uses door `cut_width_m`.
11. **Manufacturing/Finance remain shared authorities.** This vertical does not create WIP, COGS, valuation, GL or manufacturing-cost ledgers.
12. **Correction is append/reversal based.** No silent historical stock/value edits.

## Lanes

### P0-A — Generic exact purchase quantity

Owner: shared Procurement/UOM seam.

Close the defect where `purchase_stock_qty_field` still required a static conversion factor before using the exact observed stock quantity.

Acceptance:
- 568.7 Kg + 200 counted bars can normalize to 200 stock units without a static Kg→bar factor;
- stale client factor fails closed;
- price quantity remains 568.7 Kg;
- stock quantity remains 200 pieces.

### P0-B — Tracked aluminum receipt

Owner: Alumdoor vertical orchestration; canonical Stock controller remains authority.

Acceptance:
- FIFO allocation remains against counted supplier obligation;
- receipt draft creates/reuses physical Batch identity and submitted Inward bundles;
- receipt submit produces Stock Ledger pieces + Kg + value;
- no `Aluminium Lot` mutation occurs;
- replay/resume cannot create duplicate receipt/batch/bundle effects.

### P0-C — Item/profile cutover

Owner: Alumdoor package/profile.

Required master contract for aluminum tracked by physical length:

```text
inventory_mode = Nhôm cây/lá
stock_uom = Cây | Lá | Đoạn
default_purchase_uom = Kg
has_batch_no = 1
has_catch_weight = 1
weight_uom = Kg
purchase_stock_qty_field = qty_bar
purchase_allocation_qty_field = qty_bar
purchase_allocation_uom = <stock_uom>
allow_negative_stock = 0
```

Historical applied migrations are immutable. Cutover must be append-only and must not convert an existing Kg balance to pieces without counted/batch evidence.

### P1-A — Sales/Work Order ATP

Owner: Alumdoor orchestration consuming Manufacturing + Inventory authorities.

Use submitted Work Order manufacturing snapshots. For batch-tracked aluminum, a row is dimension-resolvable only when its snapshot proves a supported dimension basis. Initial closure supports leaf-count-driven rows where Work Order `cut_width_m` is the required minimum source length. Unsupported aluminum rows are returned as explicit unresolved dependencies, not guessed.

ATP allocation order:
1. eligible offcuts first;
2. then smallest full Batch that satisfies required length;
3. subtract active reservations owned by other sources;
4. never count negative/zero Stock Ledger positions.

### P1-B — Reservation + shortage Material Request

Acceptance:
- ATP can create bounded `Stock Reservation` records tied to Work Order/Sales demand;
- shortages generate an idempotent draft Material Request in counted stock UOM;
- no Kg is fabricated for shortage planning;
- later Procurement owns supplier/rate/receipt.

### P1-C — Manufacturing value/reconciliation boundary

Cut Order material value must reconcile into the existing Manufacturing/Stock lifecycle. This lane may add evidence/adapters only where an existing shared contract exists. It must not create a vertical WIP/GL ledger.

## Dependency Requests

### DR-ALINV-01 — Manufacturing/Finance posted WIP/operation-cost policy

Existing Manufacturing closure explicitly keeps actual operation cost/variance `NOT_POSTED` until Finance owns the accounting contract. This program will not invent a vertical posting rule.

Blocking: posted WIP/operation cost and final Finance maturity claims.
Not blocking: canonical aluminum receipt, Batch stock, reservation, cutting, shortage planning.

### DR-ALINV-02 — Historical tenant cutover evidence

Existing tenant data was previously standardized with Kg as aluminum stock UOM and legacy `Aluminium Lot` rows. A safe production cutover requires observed counted-piece/batch evidence and opening reconciliation. Source code may prepare a planner, but production data mutation is explicitly out of scope without separate authorization.

Blocking: production migration/cutover only.
Not blocking: source implementation and disposable/local tests.

## Verification gates

CRITICAL gates before merge:

- server build / changed-source TypeScript classification;
- exact dual-measure purchase regression;
- Purchase Receipt -> Batch Bundle -> Stock Ledger -> cancel regression;
- existing `alumdoor-v2-inventory` cut/offcut/reservation regression;
- FIFO allocation regressions;
- sales ATP/reservation/shortage regressions;
- retry/idempotency;
- tenant/permission boundary evidence;
- stock quantity/weight/value reconciliation;
- `git diff --check`.

## Merge/deploy boundary

Branch/PR/test work is authorized. **Merge to `main`, production deploy, production migration/data rewrite, DNS/secret/provider mutation remain blocked until explicit approval.**
