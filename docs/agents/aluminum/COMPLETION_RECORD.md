# Aluminum Supply–Demand & Inventory Closure — Completion Record

Date: 2026-08-11
Branch: `feat/alumdoor-aluminum-inventory-closure`
PR: `#807`
Risk: **CRITICAL — inventory valuation / stock authority / manufacturing integration**

## Source completion

The implementation is source-complete for the approved non-production scope:

- canonical aluminum Item contract: commercial/priced quantity in Kg, physical stock in counted `Cây/Lá`, Kg catch weight, mandatory Batch tracking;
- `purchase_stock_qty_field=qty_bar`, `purchase_allocation_qty_field=qty_bar`, `purchase_allocation_uom=Cây` materialized in the effective Alumdoor V2 package;
- exact observed stock quantity derives the per-line purchase conversion; no static Kg↔piece factor is required or trusted for catch-weight aluminum;
- FIFO Purchase Receipt provisions Batch + submitted Inward Serial and Batch Bundle and posts counted quantity + actual Kg + value to canonical Stock Ledger;
- Purchase Receipt cancellation reverses the canonical Stock Ledger effect;
- deployed Alumdoor entrypoint no longer updates `Aluminium Lot.sheet_count` as an active inventory authority;
- Cut Order remains on canonical Batch/Stock Ledger authority, including offcut child-Batch lineage and reservation protection;
- Work Order aluminum ATP is dimension-aware, consumes one shared stock pool, protects external reservations, allocates longer demand first, prefers offcuts, then the smallest fitting full Batch;
- shortage planning creates idempotent draft Material Request quantities in counted stock UOM without inventing Kg, supplier or rate;
- local/authenticated FIFO and bulk QA fixtures use the same counted-stock + catch-weight contract;
- `build-alumdoor-v2-brief.mjs` is now a canonical source of the same aluminum metadata already committed in `briefs/alumdoor-v2.json`; regenerate must be byte-stable;
- dedicated CRITICAL CI now runs the V2 builder and rejects generated metadata drift.

## Authority closure

- Stock Ledger is the only quantity/weight/value balance authority.
- Batch owns physical identity and dimension lineage, not mutable balance.
- Stock Reservation reduces ATP only.
- Alumdoor does not create a shadow valuation, WIP, COGS or GL ledger.
- Historical correction remains reversal/reconciliation based; no silent stock-history edit is introduced.

## Production boundary / dependency requests

### DR-ALINV-01 — shared Manufacturing/Finance posting policy

Actual Cut → WIP → Finished Goods → COGS/GL posting remains owned by shared Manufacturing/Finance controllers. This branch does not invent an Alumdoor-specific WIP/GL policy. This does **not** block source completion for Procurement/Stock/ATP/Reservation/Cutting; it blocks any claim that a new vertical accounting policy has been introduced.

### DR-ALINV-02 — historical production cutover evidence

Existing tenants that still hold aluminum balances in Kg or legacy `Aluminium Lot` rows must be physically counted/reconciled before conversion to counted Batch stock. The provided cutover path is read-only/fail-closed and must not infer number of pieces from Kg.

Production migration/data mutation remains separately approval-gated.

## Final verification contract

The exact final PR head must pass both:

1. `.github/workflows/aluminum-inventory-closure.yml`
   - changed-source TypeScript classification;
   - dual-measure purchase + tracked receipt + cancel;
   - FIFO allocation compatibility;
   - canonical builder/metadata byte-stability;
   - Item validator/adversarial boundary;
   - ATP/reservation/shortage;
   - Cut/offcut and manufacturing compatibility;
   - legacy authority/cutover guards;
   - diff hygiene.

2. `.github/workflows/r6-pass-convergence.yml`
   - full server/client release build;
   - migration/backup/destructive-operation safety;
   - real Workerd/D1/Durable Object integration;
   - tenant/auth/CSRF boundary;
   - tenant provisioning;
   - R6 commercial/procurement/manufacturing/fulfillment/settlement Golden Flow;
   - release/observability/queue safety;
   - effective Alumdoor package dry-run;
   - source diff hygiene excluding only build-produced `dist/**` and `dist-mobile/**` artifacts.

## Merge/deploy boundary

No merge to `main`, production deploy, production migration, production data rewrite, DNS, secret or provider mutation is authorized by this completion record. Those remain explicit-approval operations under the Forge enterprise completion skill.
